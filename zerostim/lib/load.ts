import "server-only";
import { db, type Family, type KidRow } from "./db";
import { addDays, today, weekStart } from "./dates";
import { pennyFor, pennyForPastWeek, type Penny } from "./penny";
import { summarize } from "./calc";
import { kidIn, loadSettingsBook, type Rules, type SettingsBook } from "./settings";
import type { Kid } from "./family";

/** Everything about one family that most pages need. Load once per request. */
export type FamilyCtx = { family: Family; kids: KidRow[]; book: SettingsBook };

export async function loadFamily(family: Family): Promise<FamilyCtx> {
  const kids = await db().listKids(family.id);
  return { family, kids, book: await loadSettingsBook(family, kids) };
}

export type WeekView = {
  kid: Kid;
  rules: Rules;
  summary: ReturnType<typeof summarize>;
  paid: boolean;
  penny: Pick<Penny, "mood" | "line"> & Partial<Penny>;
};

/** One kid's week, using the rules that were in effect that week. */
export async function loadWeek(ctx: FamilyCtx, row: KidRow, week: string): Promise<WeekView> {
  const store = db();
  const isCurrent = week === weekStart(today());
  // The current week also needs ~60 days of chores for Penny's streak.
  const from = isCurrent ? addDays(today(), -62) : week;
  const [entries, payouts, lastSeen] = await Promise.all([
    store.listEntries(row.id, from, addDays(week, 6)),
    store.listPayouts(row.id),
    isCurrent ? store.lastSeen(row.id) : Promise.resolve(null),
  ]);
  const settings = ctx.book.at(week);
  const kid = kidIn(settings, row);
  // Fresh balance every week: only this week's entries count toward the payout.
  const summary = summarize(kid, settings, week, entries);
  return {
    kid,
    rules: settings,
    summary,
    paid: payouts.some((p) => p.weekStart === week),
    penny: isCurrent ? pennyFor({ kid, book: ctx.book, summary, entries, lastSeen }) : pennyForPastWeek(summary),
  };
}

/** Summaries for the last `n` weeks, oldest first. */
export async function loadHistory(ctx: FamilyCtx, row: KidRow, currentWeek: string, n: number) {
  const first = addDays(currentWeek, -7 * (n - 1));
  const store = db();
  const [entries, payouts] = await Promise.all([store.listEntries(row.id, first, addDays(currentWeek, 6)), store.listPayouts(row.id)]);
  const weeks = Array.from({ length: n }, (_, i) => addDays(first, i * 7));
  const current = ctx.book.at(currentWeek);
  return {
    entries,
    rules: current as Rules,
    baseCents: kidIn(current, row).baseCents,
    weeks: weeks.map((w) => {
      const s = ctx.book.at(w);
      return { ...summarize(kidIn(s, row), s, w, entries), paid: payouts.find((p) => p.weekStart === w) };
    }),
  };
}
