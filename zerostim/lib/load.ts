import "server-only";
import { db } from "./db";
import { addDays } from "./dates";
import { summarize } from "./calc";
import type { Kid } from "./family";

export async function loadWeek(kid: Kid, week: string) {
  const store = db();
  const [entries, payouts] = await Promise.all([store.listEntries(kid.id, week, addDays(week, 6)), store.listPayouts(kid.id)]);
  return { summary: summarize(kid, week, entries), paid: payouts.some((p) => p.weekStart === week) };
}

/** Summaries for the last `n` weeks, oldest first. */
export async function loadHistory(kid: Kid, currentWeek: string, n: number) {
  const first = addDays(currentWeek, -7 * (n - 1));
  const store = db();
  const [entries, payouts] = await Promise.all([store.listEntries(kid.id, first, addDays(currentWeek, 6)), store.listPayouts(kid.id)]);
  const weeks = Array.from({ length: n }, (_, i) => addDays(first, i * 7));
  return {
    entries,
    weeks: weeks.map((w) => ({ ...summarize(kid, w, entries), paid: payouts.find((p) => p.weekStart === w) })),
  };
}
