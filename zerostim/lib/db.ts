import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import postgres from "postgres";

// Storage. Uses Postgres when DATABASE_URL is set, otherwise a local JSON file
// (.data/db.json) so the app runs with zero setup on a laptop.
//
// Everything is an append-only log of entries, which makes "analytics over
// time" a matter of querying the log.

export type Kind = "chore" | "deduction" | "bonus";
export type Entry = {
  id: string;
  kidId: string;
  date: string; // YYYY-MM-DD
  kind: Kind;
  itemId: string;
  createdAt: string;
};
export type Payout = { kidId: string; weekStart: string; amountCents: number; paidAt: string };
/** A saved version of the rules, in effect from `week` until a later version. */
export type SettingsVersion = { week: string; data: unknown };

interface Store {
  listEntries(kidId: string, from: string, to: string): Promise<Entry[]>;
  toggleChore(kidId: string, date: string, choreId: string): Promise<void>;
  addTally(kidId: string, date: string, kind: Kind, itemId: string): Promise<void>;
  removeLatestTally(kidId: string, from: string, to: string, kind: Kind, itemId: string): Promise<void>;
  listPayouts(kidId: string): Promise<Payout[]>;
  setPayout(kidId: string, weekStart: string, amountCents: number): Promise<void>;
  clearPayout(kidId: string, weekStart: string): Promise<void>;
  listSettings(): Promise<SettingsVersion[]>;
  /** Saves rules from `week` on, replacing any versions that start later. */
  saveSettings(week: string, data: unknown): Promise<void>;
  /** When the kid last opened their page (ISO time), or null. */
  lastSeen(kidId: string): Promise<string | null>;
  markSeen(kidId: string): Promise<void>;
}

/* ---------------- JSON file store (local dev) ---------------- */

type FileData = { entries: Entry[]; payouts: Payout[]; settings?: SettingsVersion[]; seen?: Record<string, string> };
const FILE = path.join(process.cwd(), ".data", "db.json");

async function readFile(): Promise<FileData> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return { entries: [], payouts: [] };
  }
}
async function writeFile(data: FileData) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(data, null, 2));
}

const fileStore: Store = {
  async listEntries(kidId, from, to) {
    const d = await readFile();
    return d.entries.filter((e) => e.kidId === kidId && e.date >= from && e.date <= to);
  },
  async toggleChore(kidId, date, choreId) {
    const d = await readFile();
    const i = d.entries.findIndex((e) => e.kidId === kidId && e.date === date && e.kind === "chore" && e.itemId === choreId);
    if (i >= 0) d.entries.splice(i, 1);
    else d.entries.push({ id: randomUUID(), kidId, date, kind: "chore", itemId: choreId, createdAt: new Date().toISOString() });
    await writeFile(d);
  },
  async addTally(kidId, date, kind, itemId) {
    const d = await readFile();
    d.entries.push({ id: randomUUID(), kidId, date, kind, itemId, createdAt: new Date().toISOString() });
    await writeFile(d);
  },
  async removeLatestTally(kidId, from, to, kind, itemId) {
    const d = await readFile();
    const matches = d.entries
      .map((e, i) => ({ e, i }))
      .filter(({ e }) => e.kidId === kidId && e.kind === kind && e.itemId === itemId && e.date >= from && e.date <= to)
      .sort((a, b) => a.e.createdAt.localeCompare(b.e.createdAt));
    const last = matches.at(-1);
    if (last) {
      d.entries.splice(last.i, 1);
      await writeFile(d);
    }
  },
  async listPayouts(kidId) {
    const d = await readFile();
    return d.payouts.filter((p) => p.kidId === kidId);
  },
  async setPayout(kidId, weekStart, amountCents) {
    const d = await readFile();
    d.payouts = d.payouts.filter((p) => !(p.kidId === kidId && p.weekStart === weekStart));
    d.payouts.push({ kidId, weekStart, amountCents, paidAt: new Date().toISOString() });
    await writeFile(d);
  },
  async clearPayout(kidId, weekStart) {
    const d = await readFile();
    d.payouts = d.payouts.filter((p) => !(p.kidId === kidId && p.weekStart === weekStart));
    await writeFile(d);
  },
  async listSettings() {
    return (await readFile()).settings ?? [];
  },
  async saveSettings(week, data) {
    const d = await readFile();
    d.settings = [...(d.settings ?? []).filter((v) => v.week < week), { week, data }];
    await writeFile(d);
  },
  async lastSeen(kidId) {
    return (await readFile()).seen?.[kidId] ?? null;
  },
  async markSeen(kidId) {
    const d = await readFile();
    d.seen = { ...(d.seen ?? {}), [kidId]: new Date().toISOString() };
    await writeFile(d);
  },
};

/* ---------------- Postgres store (production) ---------------- */

function pgStore(url: string): Store {
  const g = globalThis as unknown as { __sql?: ReturnType<typeof postgres>; __ready?: Promise<unknown> };
  const sql = (g.__sql ??= postgres(url, { max: 3, idle_timeout: 20 }));

  const ready = (g.__ready ??= (async () => {
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
    await sql`create table if not exists seen (
      kid_id text primary key,
      seen_at timestamptz not null
    )`;
  })());

  type Row = { id: string; kid_id: string; date: string; kind: Kind; item_id: string; created_at: Date };
  const toEntry = (r: Row): Entry => ({
    id: r.id,
    kidId: r.kid_id,
    date: r.date,
    kind: r.kind,
    itemId: r.item_id,
    createdAt: r.created_at.toISOString(),
  });

  return {
    async listEntries(kidId, from, to) {
      await ready;
      const rows = await sql<Row[]>`
        select id, kid_id, to_char(date, 'YYYY-MM-DD') as date, kind, item_id, created_at
        from entries where kid_id = ${kidId} and date between ${from} and ${to}`;
      return rows.map(toEntry);
    },
    async toggleChore(kidId, date, choreId) {
      await ready;
      const removed = await sql`
        delete from entries
        where kid_id = ${kidId} and date = ${date} and kind = 'chore' and item_id = ${choreId}
        returning id`;
      if (removed.length === 0) {
        await sql`insert into entries (id, kid_id, date, kind, item_id)
                  values (${randomUUID()}, ${kidId}, ${date}, 'chore', ${choreId})`;
      }
    },
    async addTally(kidId, date, kind, itemId) {
      await ready;
      await sql`insert into entries (id, kid_id, date, kind, item_id)
                values (${randomUUID()}, ${kidId}, ${date}, ${kind}, ${itemId})`;
    },
    async removeLatestTally(kidId, from, to, kind, itemId) {
      await ready;
      await sql`
        delete from entries where id = (
          select id from entries
          where kid_id = ${kidId} and kind = ${kind} and item_id = ${itemId} and date between ${from} and ${to}
          order by created_at desc limit 1
        )`;
    },
    async listPayouts(kidId) {
      await ready;
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
    async setPayout(kidId, weekStart, amountCents) {
      await ready;
      await sql`insert into payouts (kid_id, week_start, amount_cents) values (${kidId}, ${weekStart}, ${amountCents})
                on conflict (kid_id, week_start) do update set amount_cents = excluded.amount_cents, paid_at = now()`;
    },
    async clearPayout(kidId, weekStart) {
      await ready;
      await sql`delete from payouts where kid_id = ${kidId} and week_start = ${weekStart}`;
    },
    async listSettings() {
      await ready;
      const rows = await sql<{ week: string; data: unknown }[]>`
        select to_char(effective_week, 'YYYY-MM-DD') as week, data from settings order by effective_week`;
      return rows.map((r) => ({ week: r.week, data: r.data }));
    },
    async saveSettings(week, data) {
      await ready;
      await sql.begin(async (tx) => {
        await tx`delete from settings where effective_week >= ${week}`;
        await tx`insert into settings (effective_week, data) values (${week}, ${tx.json(data as never)})`;
      });
    },
    async lastSeen(kidId) {
      await ready;
      const rows = await sql<{ seen_at: Date }[]>`select seen_at from seen where kid_id = ${kidId}`;
      return rows[0]?.seen_at.toISOString() ?? null;
    },
    async markSeen(kidId) {
      await ready;
      await sql`insert into seen (kid_id, seen_at) values (${kidId}, now())
                on conflict (kid_id) do update set seen_at = now()`;
    },
  };
}

/** False on Vercel until a Postgres database is connected. */
export function dbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL) || !process.env.VERCEL;
}

export function db(): Store {
  const url = process.env.DATABASE_URL;
  if (url) return pgStore(url);
  if (process.env.VERCEL) {
    throw new Error("DATABASE_URL is not set. Add a Postgres database in Vercel before using the app.");
  }
  return fileStore;
}
