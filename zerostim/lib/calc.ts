import type { Kid } from "./family";
import type { Rules } from "./settings";
import { addDays, today, weekDays } from "./dates";
import type { Entry } from "./db";

export type WeekSummary = {
  weekStart: string;
  baseCents: number;
  deductionCents: number;
  bonusRawCents: number;
  bonusCents: number; // after the weekly cap
  bonusCapCents: number;
  payoutCents: number;
  choresDone: number;
  choresPossible: number; // up to today for the current week
  choreDone: Set<string>; // `${choreId}|${date}`
  tallies: Record<string, number>; // `${kind}|${itemId}` -> count
};

export function summarize(kid: Kid, rules: Rules, weekStart: string, entries: Entry[]): WeekSummary {
  const end = addDays(weekStart, 6);
  const inWeek = entries.filter((e) => e.date >= weekStart && e.date <= end);
  const choreDone = new Set<string>();
  const tallies: Record<string, number> = {};
  let deductionCents = 0;
  let bonusRawCents = 0;

  for (const e of inWeek) {
    if (e.kind === "chore") {
      choreDone.add(`${e.itemId}|${e.date}`);
      continue;
    }
    const key = `${e.kind}|${e.itemId}`;
    tallies[key] = (tallies[key] ?? 0) + 1;
    const list = e.kind === "deduction" ? rules.deductions : rules.bonuses;
    const item = list.find((i) => i.id === e.itemId);
    if (!item) continue; // item was removed in settings; it no longer counts
    if (e.kind === "deduction") deductionCents += item.cents;
    else bonusRawCents += item.cents;
  }

  const bonusCents = Math.min(bonusRawCents, rules.bonusCapCents);
  const payoutCents = Math.max(0, kid.baseCents - deductionCents + bonusCents);
  const t = today();
  const daysSoFar = weekDays(weekStart).filter((d) => d <= t).length;
  const choreIds = new Set(kid.chores.map((c) => c.id));
  const choresDone = [...choreDone].filter((k) => choreIds.has(k.split("|")[0])).length;

  return {
    weekStart,
    baseCents: kid.baseCents,
    deductionCents,
    bonusRawCents,
    bonusCents,
    bonusCapCents: rules.bonusCapCents,
    payoutCents,
    choresDone,
    choresPossible: kid.chores.length * daysSoFar,
    choreDone,
    tallies,
  };
}
