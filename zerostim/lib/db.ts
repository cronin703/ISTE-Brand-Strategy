import "server-only";
import { randomBytes, randomUUID } from "crypto";
import postgres from "postgres";
import { BUILT_IN_DEFAULTS, DEDUCTIONS, BONUSES, BONUS_CAP_CENTS, TRACKING_START, isKidColor, type KidColor } from "./family";

// Postgres storage (DATABASE_URL). Multi-family:
//   families -> parents (logins) and kids (with a private link token)
//   entries/payouts/seen are keyed by kid; settings versions by family.
// Everything a kid does is an append-only log of entries, which makes
// "analytics over time" a matter of querying the log.

export type Kind = "chore" | "deduction" | "bonus";
export type Entry = {
  id: string;
  kidId: string;
  date: string; // YYYY-MM-DD
  kind: Kind;
  itemId: string;
  createdAt: string;
  /** "pending" = kid marked it, waiting for Mom or Dad. Everything else is approved. */
  status?: "approved" | "pending";
};
export type Payout = { kidId: string; weekStart: string; amountCents: number; paidAt: string };
/** A saved version of a family's rules, in effect from `week` until a later version. */
export type SettingsVersion = { week: string; data: unknown };

export type Family = { id: string; name: string; token: string; trackingStart: string; createdAt: string };
export type Parent = { id: string; familyId: string; email: string; name: string; passwordHash: string };
export type KidRow = { id: string; familyId: string; name: string; color: KidColor; token: string; baseCents: number; sort: number };

export const newToken = () => randomBytes(12).toString("base64url");
const newId = (prefix: string) => `${prefix}_${randomBytes(5).toString("hex")}`;

export function dbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

type Sql = ReturnType<typeof postgres>;
const g = globalThis as unknown as { __sql?: Sql; __ready?: Promise<unknown> };

function conn(): Sql {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Add a Postgres database before using the app.");
  return (g.__sql ??= postgres(url, { max: 3, idle_timeout: 20 }));
}

/** Creates/upgrades tables. Runs once per server process. */
function ready(): Promise<unknown> {
  const sql = conn();
  return (g.__ready ??= sql
    .begin(async (sql) => {
    // One server at a time runs setup (several can start at once on first deploy).
    await sql`select pg_advisory_xact_lock(724301)`;
    await sql`create table if not exists entries (
      id uuid primary key,
      kid_id text not null,
      date date not null,
      kind text not null check (kind in ('chore','deduction','bonus')),
      item_id text not null,
      created_at timestamptz not null default now()
    )`;
    await sql`create index if not exists entries_kid_date on entries (kid_id, date)`;
    await sql`create table if not exists payouts (
      kid_id text not null,
      week_start date not null,
      amount_cents integer not null,
      paid_at timestamptz not null default now(),
      primary key (kid_id, week_start)
    )`;
    await sql`create table if not exists settings (
      effective_week date primary key,
      data jsonb not null,
      updated_at timestamptz not null default now()
    )`;
    await sql`create table if not exists seen (kid_id text primary key, seen_at timestamptz not null)`;
    await sql`alter table entries add column if not exists status text not null default 'approved'`;
    await sql`create table if not exists meta (key text primary key, value text not null)`;
    // One-time fresh start requested on 2026-11-05 (settings stay).
    await sql.savepoint(async (tx) => {
      const first = await tx`insert into meta (key, value) values ('fresh-start-2026-11-05', now()::text)
                             on conflict (key) do nothing returning key`;
      if (first.length) {
        await tx`delete from entries`;
        await tx`delete from payouts`;
        await tx`delete from seen`;
      }
    });

    // ---- Multi-family ----
    await sql`create table if not exists families (
      id text primary key,
      name text not null,
      token text not null unique,
      tracking_start date not null,
      created_at timestamptz not null default now()
    )`;
    await sql`create table if not exists parents (
      id text primary key,
      family_id text not null references families(id) on delete cascade,
      email text not null unique,
      name text not null,
      password_hash text not null,
      created_at timestamptz not null default now()
    )`;
    await sql`create table if not exists kids (
      id text primary key,
      family_id text not null references families(id) on delete cascade,
      name text not null,
      color text not null,
      token text not null unique,
      base_cents integer not null,
      sort integer not null default 0,
      created_at timestamptz not null default now()
    )`;
    await sql`create table if not exists family_settings (
      family_id text not null references families(id) on delete cascade,
      effective_week date not null,
      data jsonb not null,
      updated_at timestamptz not null default now(),
      primary key (family_id, effective_week)
    )`;

    // Move the original single family (Thomas & Carter) into the new tables, once.
    await sql.savepoint(async (tx) => {
      const first = await tx`insert into meta (key, value) values ('multi-family-v1', now()::text)
                             on conflict (key) do nothing returning key`;
      if (!first.length) return;
      const existing = await tx`select 1 from families limit 1`;
      if (existing.length) return;
      const start = (await tx<{ value: string }[]>`select value from meta where key = 'tracking_start'`)[0]?.value ?? TRACKING_START;
      await tx`insert into families (id, name, token, tracking_start) values ('family1', 'Cronin family', ${newToken()}, ${start})`;
      await tx`insert into kids (id, family_id, name, color, token, base_cents, sort) values
        ('thomas', 'family1', 'Thomas', 'cobalt', ${newToken()}, 1000, 0),
        ('carter', 'family1', 'Carter', 'flame', ${newToken()}, 1500, 1)`;
      const pw = process.env.PARENT_PASSWORD || (process.env.NODE_ENV === "production" ? null : "parent");
      if (pw) {
        const { hashPassword } = await import("./password");
        await tx`insert into parents (id, family_id, email, name, password_hash)
                 values (${newId("p")}, 'family1', ${process.env.OWNER_EMAIL || "cronin703@gmail.com"}, 'Nick', ${await hashPassword(pw)})`;
      }
      const old = await tx<{ effective_week: string; data: unknown }[]>`
        select to_char(effective_week, 'YYYY-MM-DD') as effective_week, data from settings`;
      if (old.length) {
        for (const o of old) {
          await tx`insert into family_settings (family_id, effective_week, data)
                   values ('family1', ${o.effective_week}, ${tx.json(o.data as never)}) on conflict do nothing`;
        }
      } else {
        // Keep the original chart's chores (Thomas: trash, Carter: pet).
        const shared = BUILT_IN_DEFAULTS.chores.slice(0, 5);
        const data = {
          kids: {
            thomas: { baseCents: 1000, chores: [...shared, { id: "trash", label: "Take out trash or recycling" }] },
            carter: { baseCents: 1500, chores: [...shared, { id: "pet", label: "Feed pet or set the table" }] },
          },
          deductions: DEDUCTIONS,
          bonuses: BONUSES,
          bonusCapCents: BONUS_CAP_CENTS,
        };
        await tx`insert into family_settings (family_id, effective_week, data) values ('family1', '2026-11-02', ${tx.json(data as never)})`;
      }
    });

    // One-time: a login for Mom (Becca) in the original family. Only the hash is stored here;
    // the temporary password was given to the owner, and she can change it in Settings.
    await sql.savepoint(async (tx) => {
      const first = await tx`insert into meta (key, value) values ('seed-parent-becca', now()::text)
                             on conflict (key) do nothing returning key`;
      if (!first.length) return;
      const fam = await tx`select 1 from families where id = 'family1'`;
      const taken = await tx`select 1 from parents where lower(email) = 'montague.becca@gmail.com'`;
      if (fam.length && !taken.length) {
        await tx`insert into parents (id, family_id, email, name, password_hash)
                 values (${newId("p")}, 'family1', 'montague.becca@gmail.com', 'Becca',
                         'scrypt$JxlkROyAkLBUYSqWt6kLCg$csrNPK_Y3zVH7E65TyGRYCCph9LhnT6yyLQicozLRqs')`;
      }
    });

    // One-time: the owner asked to set his password to a short one (2026-11-05).
    await sql.savepoint(async (tx) => {
      const first = await tx`insert into meta (key, value) values ('owner-password-2026-11-05', now()::text)
                             on conflict (key) do nothing returning key`;
      if (!first.length) return;
      await tx`update parents set password_hash = 'scrypt$kx0pEGUOnsBKcgsZ65i_ZQ$UcMjsZyPRrVtoengmjJkL8Y1x0biMSvYoh3eMwqxuG8'
               where lower(email) = 'cronin703@gmail.com'`;
    });
    })
    .catch((e) => {
      g.__ready = undefined; // let the next request retry
      throw e;
    }));
}

/* ---------------- Entries (by kid) ---------------- */

type Row = { id: string; kid_id: string; date: string; kind: Kind; item_id: string; created_at: Date; status: "approved" | "pending" };
const toEntry = (r: Row): Entry => ({
  id: r.id,
  kidId: r.kid_id,
  date: r.date,
  kind: r.kind,
  itemId: r.item_id,
  createdAt: r.created_at.toISOString(),
  status: r.status,
});

type FamilyRow = { id: string; name: string; token: string; tracking_start: string; created_at: Date };
const toFamily = (r: FamilyRow): Family => ({ id: r.id, name: r.name, token: r.token, trackingStart: r.tracking_start, createdAt: r.created_at.toISOString() });
type ParentRow = { id: string; family_id: string; email: string; name: string; password_hash: string };
const toParent = (r: ParentRow): Parent => ({ id: r.id, familyId: r.family_id, email: r.email, name: r.name, passwordHash: r.password_hash });
type KidDbRow = { id: string; family_id: string; name: string; color: string; token: string; base_cents: number; sort: number };
const toKid = (r: KidDbRow): KidRow => ({
  id: r.id,
  familyId: r.family_id,
  name: r.name,
  color: isKidColor(r.color) ? r.color : "cobalt",
  token: r.token,
  baseCents: r.base_cents,
  sort: r.sort,
});

function makeStore() {
  const sql = conn();
  return {
    async listEntries(kidId: string, from: string, to: string): Promise<Entry[]> {
      await ready();
      const rows = await sql<Row[]>`
        select id, kid_id, to_char(date, 'YYYY-MM-DD') as date, kind, item_id, created_at, status
        from entries where kid_id = ${kidId} and date between ${from} and ${to}`;
      return rows.map(toEntry);
    },
    /** Mom or Dad tap: empty -> approved, pending -> approved, approved -> empty. */
    async toggleChore(kidId: string, date: string, choreId: string) {
      await ready();
      const approved = await sql`
        update entries set status = 'approved'
        where kid_id = ${kidId} and date = ${date} and kind = 'chore' and item_id = ${choreId} and status = 'pending'
        returning id`;
      if (approved.length) return;
      const removed = await sql`
        delete from entries
        where kid_id = ${kidId} and date = ${date} and kind = 'chore' and item_id = ${choreId}
        returning id`;
      if (removed.length === 0) {
        await sql`insert into entries (id, kid_id, date, kind, item_id, status)
                  values (${randomUUID()}, ${kidId}, ${date}, 'chore', ${choreId}, 'approved')`;
      }
    },
    /** Kid tap: empty -> pending, pending -> empty. Approved chores are locked. */
    async kidToggleChore(kidId: string, date: string, choreId: string) {
      await ready();
      const existing = await sql<{ status: string }[]>`
        select status from entries where kid_id = ${kidId} and date = ${date} and kind = 'chore' and item_id = ${choreId}`;
      if (existing.some((r) => r.status !== "pending")) return; // approved: locked
      if (existing.length) {
        await sql`delete from entries where kid_id = ${kidId} and date = ${date} and kind = 'chore' and item_id = ${choreId} and status = 'pending'`;
      } else {
        await sql`insert into entries (id, kid_id, date, kind, item_id, status)
                  values (${randomUUID()}, ${kidId}, ${date}, 'chore', ${choreId}, 'pending')`;
      }
    },
    /** Approve everything pending (chores and bonuses) in the date range. */
    async approveChores(kidId: string, from: string, to: string) {
      await ready();
      await sql`update entries set status = 'approved'
                where kid_id = ${kidId} and status = 'pending' and date between ${from} and ${to}`;
    },
    async approveEntry(kidId: string, id: string) {
      await ready();
      await sql`update entries set status = 'approved' where kid_id = ${kidId} and id = ${id}`;
    },
    async rejectEntry(kidId: string, id: string) {
      await ready();
      await sql`delete from entries where kid_id = ${kidId} and id = ${id} and status = 'pending'`;
    },
    async removeLatestPending(kidId: string, date: string, kind: Kind, itemId: string) {
      await ready();
      await sql`delete from entries where id = (
        select id from entries
        where kid_id = ${kidId} and date = ${date} and kind = ${kind} and item_id = ${itemId} and status = 'pending'
        order by created_at desc limit 1)`;
    },
    async rejectChore(kidId: string, date: string, choreId: string) {
      await ready();
      await sql`delete from entries
                where kid_id = ${kidId} and date = ${date} and kind = 'chore' and item_id = ${choreId} and status = 'pending'`;
    },
    async addTally(kidId: string, date: string, kind: Kind, itemId: string, status: "approved" | "pending" = "approved") {
      await ready();
      await sql`insert into entries (id, kid_id, date, kind, item_id, status)
                values (${randomUUID()}, ${kidId}, ${date}, ${kind}, ${itemId}, ${status})`;
    },
    async removeLatestTally(kidId: string, from: string, to: string, kind: Kind, itemId: string) {
      await ready();
      await sql`
        delete from entries where id = (
          select id from entries
          where kid_id = ${kidId} and kind = ${kind} and item_id = ${itemId} and date between ${from} and ${to}
          order by created_at desc limit 1
        )`;
    },
    async listPayouts(kidId: string): Promise<Payout[]> {
      await ready();
      const rows = await sql<{ kid_id: string; week_start: string; amount_cents: number; paid_at: Date }[]>`
        select kid_id, to_char(week_start, 'YYYY-MM-DD') as week_start, amount_cents, paid_at
        from payouts where kid_id = ${kidId}`;
      return rows.map((r) => ({
        kidId: r.kid_id,
        weekStart: r.week_start,
        amountCents: r.amount_cents,
        paidAt: r.paid_at.toISOString(),
      }));
    },
    async setPayout(kidId: string, weekStart: string, amountCents: number) {
      await ready();
      await sql`insert into payouts (kid_id, week_start, amount_cents) values (${kidId}, ${weekStart}, ${amountCents})
                on conflict (kid_id, week_start) do update set amount_cents = excluded.amount_cents, paid_at = now()`;
    },
    async clearPayout(kidId: string, weekStart: string) {
      await ready();
      await sql`delete from payouts where kid_id = ${kidId} and week_start = ${weekStart}`;
    },

    /* ---------------- Settings (by family) ---------------- */
    async listSettings(familyId: string): Promise<SettingsVersion[]> {
      await ready();
      const rows = await sql<{ week: string; data: unknown }[]>`
        select to_char(effective_week, 'YYYY-MM-DD') as week, data from family_settings
        where family_id = ${familyId} order by effective_week`;
      return rows.map((r) => ({ week: r.week, data: r.data }));
    },
    /** Saves rules from `week` on, replacing any versions that start later. */
    async saveSettings(familyId: string, week: string, data: unknown) {
      await ready();
      await sql.begin(async (tx) => {
        await tx`delete from family_settings where family_id = ${familyId} and effective_week >= ${week}`;
        await tx`insert into family_settings (family_id, effective_week, data) values (${familyId}, ${week}, ${tx.json(data as never)})`;
      });
    },

    /* ---------------- Visits ---------------- */
    async lastSeen(kidId: string): Promise<string | null> {
      await ready();
      const rows = await sql<{ seen_at: Date }[]>`select seen_at from seen where kid_id = ${kidId}`;
      return rows[0]?.seen_at.toISOString() ?? null;
    },
    async markSeen(kidId: string) {
      await ready();
      await sql`insert into seen (kid_id, seen_at) values (${kidId}, now())
                on conflict (kid_id) do update set seen_at = now()`;
    },

    /* ---------------- App-wide values ---------------- */
    async getMeta(key: string): Promise<string | null> {
      await ready();
      const rows = await sql<{ value: string }[]>`select value from meta where key = ${key}`;
      return rows[0]?.value ?? null;
    },
    async setMeta(key: string, value: string) {
      await ready();
      await sql`insert into meta (key, value) values (${key}, ${value})
                on conflict (key) do update set value = excluded.value`;
    },

    /* ---------------- Families ---------------- */
    async listFamilies(): Promise<(Family & { parentEmails: string[]; kidNames: string[] })[]> {
      await ready();
      const rows = await sql<(FamilyRow & { parent_emails: string[] | null; kid_names: string[] | null })[]>`
        select f.id, f.name, f.token, to_char(f.tracking_start, 'YYYY-MM-DD') as tracking_start, f.created_at,
          (select array_agg(email order by created_at) from parents p where p.family_id = f.id) as parent_emails,
          (select array_agg(name order by sort, created_at) from kids k where k.family_id = f.id) as kid_names
        from families f order by f.created_at`;
      return rows.map((r) => ({ ...toFamily(r), parentEmails: r.parent_emails ?? [], kidNames: r.kid_names ?? [] }));
    },
    async getFamily(id: string): Promise<Family | null> {
      await ready();
      const rows = await sql<FamilyRow[]>`select id, name, token, to_char(tracking_start, 'YYYY-MM-DD') as tracking_start, created_at from families where id = ${id}`;
      return rows[0] ? toFamily(rows[0]) : null;
    },
    async getFamilyByToken(token: string): Promise<Family | null> {
      await ready();
      const rows = await sql<FamilyRow[]>`select id, name, token, to_char(tracking_start, 'YYYY-MM-DD') as tracking_start, created_at from families where token = ${token}`;
      return rows[0] ? toFamily(rows[0]) : null;
    },
    async createFamily(f: { name: string; trackingStart: string }): Promise<string> {
      await ready();
      const id = newId("f");
      await sql`insert into families (id, name, token, tracking_start) values (${id}, ${f.name}, ${newToken()}, ${f.trackingStart})`;
      return id;
    },
    async updateFamily(id: string, f: { name?: string; trackingStart?: string }) {
      await ready();
      if (f.name !== undefined) await sql`update families set name = ${f.name} where id = ${id}`;
      if (f.trackingStart !== undefined) await sql`update families set tracking_start = ${f.trackingStart} where id = ${id}`;
    },
    /** Deletes a family and everything its kids logged. */
    async deleteFamily(id: string) {
      await ready();
      await sql.begin(async (tx) => {
        const kids = await tx<{ id: string }[]>`select id from kids where family_id = ${id}`;
        const ids = kids.map((k) => k.id);
        if (ids.length) {
          await tx`delete from entries where kid_id in ${tx(ids)}`;
          await tx`delete from payouts where kid_id in ${tx(ids)}`;
          await tx`delete from seen where kid_id in ${tx(ids)}`;
        }
        await tx`delete from families where id = ${id}`; // cascades parents, kids, settings
      });
    },

    /* ---------------- Parents ---------------- */
    async getParentByEmail(email: string): Promise<Parent | null> {
      await ready();
      const rows = await sql<ParentRow[]>`select id, family_id, email, name, password_hash from parents where lower(email) = lower(${email})`;
      return rows[0] ? toParent(rows[0]) : null;
    },
    async getParent(id: string): Promise<Parent | null> {
      await ready();
      const rows = await sql<ParentRow[]>`select id, family_id, email, name, password_hash from parents where id = ${id}`;
      return rows[0] ? toParent(rows[0]) : null;
    },
    async listParents(familyId: string): Promise<Parent[]> {
      await ready();
      const rows = await sql<ParentRow[]>`select id, family_id, email, name, password_hash from parents where family_id = ${familyId} order by created_at`;
      return rows.map(toParent);
    },
    async createParent(p: { familyId: string; email: string; name: string; passwordHash: string }): Promise<string> {
      await ready();
      const id = newId("p");
      await sql`insert into parents (id, family_id, email, name, password_hash) values (${id}, ${p.familyId}, ${p.email.trim().toLowerCase()}, ${p.name}, ${p.passwordHash})`;
      return id;
    },
    /** Every parent login across all families (admin Users page). */
    async listAllParents(): Promise<(Parent & { familyName: string })[]> {
      await ready();
      const rows = await sql<(ParentRow & { family_name: string })[]>`
        select p.id, p.family_id, p.email, p.name, p.password_hash, f.name as family_name
        from parents p join families f on f.id = p.family_id order by f.created_at, p.created_at`;
      return rows.map((r) => ({ ...toParent(r), familyName: r.family_name }));
    },
    async updateParent(id: string, p: { name: string; email: string; familyId: string }) {
      await ready();
      await sql`update parents set name = ${p.name}, email = ${p.email.trim().toLowerCase()}, family_id = ${p.familyId} where id = ${id}`;
    },
    async setParentPassword(id: string, passwordHash: string) {
      await ready();
      await sql`update parents set password_hash = ${passwordHash} where id = ${id}`;
    },
    async deleteParent(id: string) {
      await ready();
      await sql`delete from parents where id = ${id}`;
    },

    /* ---------------- Kids ---------------- */
    async listKids(familyId: string): Promise<KidRow[]> {
      await ready();
      const rows = await sql<KidDbRow[]>`select id, family_id, name, color, token, base_cents, sort from kids where family_id = ${familyId} order by sort, created_at`;
      return rows.map(toKid);
    },
    async getKid(id: string): Promise<KidRow | null> {
      await ready();
      const rows = await sql<KidDbRow[]>`select id, family_id, name, color, token, base_cents, sort from kids where id = ${id}`;
      return rows[0] ? toKid(rows[0]) : null;
    },
    async getKidByToken(token: string): Promise<KidRow | null> {
      await ready();
      const rows = await sql<KidDbRow[]>`select id, family_id, name, color, token, base_cents, sort from kids where token = ${token}`;
      return rows[0] ? toKid(rows[0]) : null;
    },
    async createKid(k: { familyId: string; name: string; color: KidColor; baseCents: number; sort: number }): Promise<string> {
      await ready();
      const id = newId("k");
      await sql`insert into kids (id, family_id, name, color, token, base_cents, sort)
                values (${id}, ${k.familyId}, ${k.name}, ${k.color}, ${newToken()}, ${k.baseCents}, ${k.sort})`;
      return id;
    },
    async updateKid(id: string, k: { name: string; color: KidColor }) {
      await ready();
      await sql`update kids set name = ${k.name}, color = ${k.color} where id = ${id}`;
    },
    async deleteKid(id: string) {
      await ready();
      await sql.begin(async (tx) => {
        await tx`delete from entries where kid_id = ${id}`;
        await tx`delete from payouts where kid_id = ${id}`;
        await tx`delete from seen where kid_id = ${id}`;
        await tx`delete from kids where id = ${id}`;
      });
    },
  };
}

export type Store = ReturnType<typeof makeStore>;
let store: Store | undefined;
export function db(): Store {
  return (store ??= makeStore());
}
