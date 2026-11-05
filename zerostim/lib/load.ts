import "server-only";
import { db } from "./db";
import { addDays, today, weekStart } from "./dates";
import { pennyFor, pennyForPastWeek, type Penny } from "./penny";
import { summarize } from "./calc";
import { kidIn, loadSettingsBook, type Rules } from "./settings";
import type { Kid } from "./family";

export type WeekView = {
  kid: Kid;
  rules: Rules;
  summary: ReturnType<typeof summarize>;
  paid: boolean;
  penny: Pick<Penny, "mood" | "line"> & Partial<Penny>;
};

/** One kid's week, using the rules that were in effect that week. */
export async function loadWeek(kidId: string, week: string): Promise<WeekView> {
  const store = db();
  const isCurrent = week === weekStart(today());
  // The current week also needs ~60 days of chores for Penny's streak.
  const from = isCurrent ? addDays(today(), -62) : week;
  const [book, entries, payouts, lastSeen] = await Promise.all([
    loadSettingsBook(),
    store.listEntries(kidId, from, addDays(week, 6)),
    store.listPayouts(kidId),
    isCurrent ? store.lastSeen(kidId) : Promise.resolve(null),
  ]);
  const settings = book.at(week);
  const kid = kidIn(settings, kidId)!;
  // Fresh balance every week: only this week's entries count toward the payout.
  const summary = summarize(kid, settings, week, entries);
  return {
    kid,
    rules: settings,
    summary,
    paid: payouts.some((p) => p.weekStart === week),
    penny: isCurrent ? pennyFor({ kid, book, summary, entries, lastSeen }) : pennyForPastWeek(summary),
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
