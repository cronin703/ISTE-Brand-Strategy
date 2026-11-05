"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { clearSession, parentPassword, requireParent, safeEqual, setSession } from "@/lib/auth";
import { db, type Kind } from "@/lib/db";
import { KIDS, TRACKING_START, getKid, type Item } from "@/lib/family";
import { addDays, isValidDate, today, weekStart, weekDays } from "@/lib/dates";
import { loadWeek } from "@/lib/load";
import { settingsFor, kidIn, type Settings } from "@/lib/settings";

export type LoginState = { error?: string };

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  const who = String(form.get("who") ?? "");
  const secret = String(form.get("secret") ?? "");

  if (who === "parent") {
    const pw = parentPassword();
    if (!pw) return { error: "The Mom or Dad password isn't set up yet. Add PARENT_PASSWORD in the app settings." };
    if (!safeEqual(secret, pw)) return { error: "That password didn't match. Try again." };
    await setSession({ role: "parent" });
    redirect("/parent");
  }

  return { error: "Kids don't need to log in. Go back and tap your name." };
}

export async function logout() {
  await clearSession();
  redirect("/");
}

function readKidAndWeek(form: FormData) {
  const kidId = String(form.get("kidId"));
  const week = String(form.get("week"));
  if (!getKid(kidId) || !isValidDate(week) || weekStart(week) !== week) throw new Error("Bad request");
  return { kidId, week };
}

function refresh() {
  revalidatePath("/", "layout");
}

export async function toggleChore(form: FormData) {
  await requireParent();
  const { kidId, week } = readKidAndWeek(form);
  const date = String(form.get("date"));
  const choreId = String(form.get("choreId"));
  const kid = kidIn(await settingsFor(week), kidId)!;
  if (!weekDays(week).includes(date) || !kid.chores.some((c) => c.id === choreId)) throw new Error("Bad request");
  await db().toggleChore(kidId, date, choreId);
  refresh();
}

export async function changeTally(form: FormData) {
  await requireParent();
  const { kidId, week } = readKidAndWeek(form);
  const kind = String(form.get("kind")) as Kind;
  const itemId = String(form.get("itemId"));
  const delta = Number(form.get("delta"));
  const rules = await settingsFor(week);
  const list = kind === "deduction" ? rules.deductions : kind === "bonus" ? rules.bonuses : null;
  if (!list || !list.some((i) => i.id === itemId)) throw new Error("Bad request");

  const end = addDays(week, 6);
  if (delta > 0) {
    // Log it on today if we're looking at this week, otherwise on the week's Monday.
    const t = today();
    const date = t >= week && t <= end ? t : week;
    await db().addTally(kidId, date, kind, itemId);
  } else {
    await db().removeLatestTally(kidId, week, end, kind, itemId);
  }
  refresh();
}

export async function togglePaid(form: FormData) {
  await requireParent();
  const { kidId, week } = readKidAndWeek(form);
  const store = db();
  const { summary, paid } = await loadWeek(kidId, week);
  if (paid) await store.clearPayout(kidId, week);
  else await store.setPayout(kidId, week, summary.payoutCents);
  refresh();
}

/* ---------------- Settings ---------------- */

function cents(raw: FormDataEntryValue | null, label: string): number {
  const n = Number(String(raw ?? "").replace(/[$,\s]/g, ""));
  if (!Number.isFinite(n) || n < 0 || n > 1000) throw new SettingsError(`${label} needs to be an amount between $0 and $1,000.`);
  return Math.round(n * 100);
}

class SettingsError extends Error {}

function slug(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) || "item";
}

function readItems(form: FormData, prefix: string, title: string): Item[] {
  const items: Item[] = [];
  const count = Number(form.get(`${prefix}_count`)) || 0;
  for (let i = 0; i < count; i++) {
    const label = String(form.get(`${prefix}_label_${i}`) ?? "").trim().slice(0, 80);
    if (!label) continue; // blank row = removed / unused
    const id = String(form.get(`${prefix}_id_${i}`) || `${slug(label)}-${randomBytes(3).toString("hex")}`);
    items.push({ id, label, cents: cents(form.get(`${prefix}_amt_${i}`), `"${label}"`) });
  }
  if (items.length > 20) throw new SettingsError(`${title} can have up to 20 items.`);
  return items;
}

export async function saveSettings(form: FormData) {
  await requireParent();
  const current = weekStart(today());
  const week = form.get("applyFrom") === "next" ? addDays(current, 7) : current;
  const before = await settingsFor(week);

  let data: Settings;
  try {
    const kids: Settings["kids"] = {};
    for (const k of KIDS) {
      // Keep each chore's id when its wording is unchanged, so past check marks still line up.
      const existing = new Map(before.kids[k.id].chores.map((c) => [c.label.toLowerCase(), c.id]));
      const used = new Set<string>();
      const chores = String(form.get(`chores_${k.id}`) ?? "")
        .split("\n")
        .map((l) => l.trim().slice(0, 80))
        .filter(Boolean)
        .slice(0, 15)
        .map((label) => {
          let id = existing.get(label.toLowerCase()) ?? slug(label);
          while (used.has(id)) id = `${id}-x`;
          used.add(id);
          return { id, label };
        });
      kids[k.id] = { baseCents: cents(form.get(`base_${k.id}`), `${k.name}'s starting amount`), chores };
    }
    data = {
      kids,
      deductions: readItems(form, "ded", "Deductions"),
      bonuses: readItems(form, "bon", "Bonuses"),
      bonusCapCents: cents(form.get("bonusCap"), "The weekly bonus max"),
    };
  } catch (e) {
    if (e instanceof SettingsError) redirect(`/parent/settings?error=${encodeURIComponent(e.message)}`);
    throw e;
  }

  await db().saveSettings(week, data);
  refresh();
  redirect(`/parent/settings?saved=${week}`);
}

/* ---------------- Kid visits ---------------- */

/** Called from the kid's own browser once their page is on screen. */
export async function markSeen(kidId: string) {
  if (!getKid(kidId)) return;
  const { getSession } = await import("@/lib/auth");
  if ((await getSession())?.role === "parent") return; // parent peeking doesn't count
  await db().markSeen(kidId);
}

/* ---------------- Kid check-offs and Mom's sign-off ---------------- */

/** Kids mark today's chores themselves (no login). They wait for Mom's approval. */
export async function kidToggleChore(form: FormData) {
  const kidId = String(form.get("kidId"));
  const choreId = String(form.get("choreId"));
  const t = today();
  const kid = getKid(kidId) && kidIn(await settingsFor(weekStart(t)), kidId);
  if (!kid || !kid.chores.some((c) => c.id === choreId) || t < TRACKING_START) throw new Error("Bad request");
  await db().kidToggleChore(kidId, t, choreId); // always today: kids can't edit other days
  refresh();
}

export async function approveAll(form: FormData) {
  await requireParent();
  const { kidId, week } = readKidAndWeek(form);
  await db().approveChores(kidId, week, addDays(week, 6));
  refresh();
}

/** Mom's sign-off list: approve or turn down one waiting item (chore or bonus). */
export async function approveEntry(form: FormData) {
  await requireParent();
  const { kidId } = readKidAndWeek(form);
  await db().approveEntry(kidId, String(form.get("id")));
  refresh();
}

export async function rejectEntry(form: FormData) {
  await requireParent();
  const { kidId } = readKidAndWeek(form);
  await db().rejectEntry(kidId, String(form.get("id")));
  refresh();
}

/** Kid says "I did this bonus" (today). It waits for Mom or Dad. delta -1 undoes their latest one. */
export async function kidBonus(form: FormData) {
  const kidId = String(form.get("kidId"));
  const itemId = String(form.get("itemId"));
  const delta = Number(form.get("delta"));
  const t = today();
  if (!getKid(kidId) || t < TRACKING_START) throw new Error("Bad request");
  const rules = await settingsFor(weekStart(t));
  if (!rules.bonuses.some((b) => b.id === itemId)) throw new Error("Bad request");
  if (delta > 0) await db().addTally(kidId, t, "bonus", itemId, "pending");
  else await db().removeLatestPending(kidId, t, "bonus", itemId);
  refresh();
}
