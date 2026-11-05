import "server-only";
import { db } from "./db";
import { addDays } from "./dates";
import { summarize } from "./calc";
import { kidIn, loadSettingsBook, type Rules } from "./settings";
import type { Kid } from "./family";

export type WeekView = { kid: Kid; rules: Rules; summary: ReturnType<typeof summarize>; paid: boolean };

/** One kid's week, using the rules that were in effect that week. */
export async function loadWeek(kidId: string, week: string): Promise<WeekView> {
  const store = db();
  const [book, entries, payouts] = await Promise.all([
    loadSettingsBook(),
    store.listEntries(kidId, week, addDays(week, 6)),
    store.listPayouts(kidId),
  ]);
  const settings = book.at(week);
  const kid = kidIn(settings, kidId)!;
  return {
    kid,
    rules: settings,
    summary: summarize(kid, settings, week, entries),
    paid: payouts.some((p) => p.weekStart === week),
  };
}

/** Summaries for the last `n` weeks, oldest first. */
export async function loadHistory(kidId: string, currentWeek: string, n: number) {
  const first = addDays(currentWeek, -7 * (n - 1));
  const store = db();
  const [book, entries, payouts] = await Promise.all([
    loadSettingsBook(),
    store.listEntries(kidId, first, addDays(currentWeek, 6)),
    store.listPayouts(kidId),
  ]);
  const weeks = Array.from({ length: n }, (_, i) => addDays(first, i * 7));
  const current = book.at(currentWeek);
  return {
    entries,
    rules: current as Rules,
    baseCents: kidIn(current, kidId)!.baseCents,
    weeks: weeks.map((w) => {
      const s = book.at(w);
      return { ...summarize(kidIn(s, kidId)!, s, w, entries), paid: payouts.find((p) => p.weekStart === w) };
    }),
  };
}
