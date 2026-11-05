import type { Kid } from "./family";
import type { Rules } from "./settings";
import { addDays, today, weekDays } from "./dates";
import type { Entry } from "./db";

// How money works (start full, keep it by doing chores):
// - The week's chores add up to the full weekly allowance ($10 / $15).
//   Each active day gets an equal share; each chore is a share of its day.
//   A short week (like the first one) still adds up to the full amount.
// - When a day ends, every chore not signed off by Mom or Dad takes its share
//   off that day. No sign-offs at all = the day earns $0. The next day starts
//   fresh at the full amount.
// - Today is never reduced while it's still going.
// - Approved bonuses add (up to the weekly max); deductions subtract.
// - Pending items (kid checked, not approved yet) never change the money.
// - Days before the start date (Settings) don't count at all.

export type DayInfo = {
  date: string;
  active: boolean; // on or after the tracking start
  status: "past" | "today" | "future" | "inactive";
  total: number;
  approved: number;
  pending: number;
  dailyCents: number;
  /** Past days: what the day kept. Today: what it keeps if the day ended now. */
  keptCents: number;
  lostCents: number; // only counted for past days
};

export type PendingItem = { id: string; kind: "chore" | "bonus"; itemId: string; date: string };

export type WeekSummary = {
  weekStart: string;
  trackingStart: string;
  baseCents: number; // weekly allowance setting
  dailyCents: number;
  startCents: number; // this week's full amount (active days x daily)
  missedCents: number; // taken off for chores not signed off on days that have ended
  deductionCents: number;
  bonusRawCents: number;
  bonusCents: number; // approved, after the weekly cap
  bonusCapCents: number;
  payoutCents: number;
  choresDone: number; // approved
  choresPossible: number; // active days up to today
  choreDone: Set<string>; // approved: `${choreId}|${date}`
  chorePending: Set<string>; // kid checked, waiting for Mom or Dad
  pendingCount: number; // chores + bonuses waiting
  pendingItems: PendingItem[];
  days: DayInfo[];
  tallies: Record<string, number>; // approved: `${kind}|${itemId}` -> count
  pendingTallies: Record<string, number>; // waiting bonuses
};

export function summarize(kid: Kid, rules: Rules, weekStart: string, entries: Entry[]): WeekSummary {
  const end = addDays(weekStart, 6);
  const t = today();
  const inWeek = entries.filter((e) => e.date >= weekStart && e.date <= end && e.date >= rules.trackingStart);
  const choreIds = new Set(kid.chores.map((c) => c.id));
  const choreDone = new Set<string>();
  const chorePending = new Set<string>();
  const tallies: Record<string, number> = {};
  const pendingTallies: Record<string, number> = {};
  const pendingItems: PendingItem[] = [];
  let deductionCents = 0;
  let bonusRawCents = 0;

  for (const e of inWeek) {
    const pending = e.status === "pending";
    if (e.kind === "chore") {
      if (!choreIds.has(e.itemId)) continue;
      (pending ? chorePending : choreDone).add(`${e.itemId}|${e.date}`);
      if (pending) pendingItems.push({ id: e.id, kind: "chore", itemId: e.itemId, date: e.date });
      continue;
    }
    const list = e.kind === "deduction" ? rules.deductions : rules.bonuses;
    const item = list.find((i) => i.id === e.itemId);
    if (!item) continue; // removed in settings; no longer counts
    const key = `${e.kind}|${e.itemId}`;
    if (pending) {
      pendingTallies[key] = (pendingTallies[key] ?? 0) + 1;
      if (e.kind === "bonus") pendingItems.push({ id: e.id, kind: "bonus", itemId: e.itemId, date: e.date });
      continue;
    }
    tallies[key] = (tallies[key] ?? 0) + 1;
    if (e.kind === "deduction") deductionCents += item.cents;
    else bonusRawCents += item.cents;
  }

  const activeCount = weekDays(weekStart).filter((d) => d >= rules.trackingStart).length;
  const dailyCents = activeCount ? kid.baseCents / activeCount : 0;
  const n = kid.chores.length;
  const days: DayInfo[] = weekDays(weekStart).map((date) => {
    const active = date >= rules.trackingStart;
    const status = !active ? "inactive" : date < t ? "past" : date === t ? "today" : "future";
    const approved = kid.chores.filter((c) => choreDone.has(`${c.id}|${date}`)).length;
    const pending = kid.chores.filter((c) => chorePending.has(`${c.id}|${date}`)).length;
    const keep = !active ? 0 : n ? dailyCents * (approved / n) : dailyCents;
    return {
      date,
      active,
      status,
      total: n,
      approved,
      pending,
      dailyCents: active ? dailyCents : 0,
      keptCents: status === "future" ? dailyCents : keep,
      lostCents: status === "past" ? (active ? dailyCents - keep : 0) : 0,
    };
  });

  const startCents = activeCount ? kid.baseCents : 0;
  const missedCents = Math.round(days.reduce((sum, d) => sum + d.lostCents, 0));
  const bonusCents = Math.min(bonusRawCents, rules.bonusCapCents);
  const payoutCents = Math.max(0, startCents - missedCents - deductionCents + bonusCents);
  const soFar = days.filter((d) => d.status === "past" || d.status === "today");

  return {
    weekStart,
    trackingStart: rules.trackingStart,
    baseCents: kid.baseCents,
    dailyCents: Math.round(dailyCents),
    startCents,
    missedCents,
    deductionCents,
    bonusRawCents,
    bonusCents,
    bonusCapCents: rules.bonusCapCents,
    payoutCents,
    choresDone: soFar.reduce((s, d) => s + d.approved, 0),
    choresPossible: soFar.length * n,
    choreDone,
    chorePending,
    pendingCount: pendingItems.length,
    pendingItems: pendingItems.sort((a, b) => a.date.localeCompare(b.date)),
    days,
    tallies,
    pendingTallies,
  };
}
