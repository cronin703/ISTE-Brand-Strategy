import { money, type Kid } from "./family";
import { addDays, dateOf, daysBetween, nowHour, today, weekStart } from "./dates";
import type { Entry } from "./db";
import type { WeekSummary } from "./calc";
import type { SettingsBook } from "./settings";
import { kidIn } from "./settings";

// Penny is ZeroStim's coin mascot. Like Duolingo's owl, she reacts to what
// the kid is (or isn't) doing: proud on a streak, nagging when chores are
// left, grumpy in the evening, sad when money is lost, and pointed when the
// kid hasn't opened the app in a while.

export type Mood = "great" | "ok" | "mad" | "sad";
export type Penny = {
  mood: Mood;
  line: string;
  streak: number; // days in a row with every chore done
  todayDone: number;
  todayTotal: number;
  lastSeen: string | null; // ISO time the kid last opened their page
};

function choresOn(book: SettingsBook, kidId: string, date: string) {
  return kidIn(book.at(weekStart(date)), kidId)!.chores;
}

function doneOn(entries: Entry[], date: string, ids: Set<string>) {
  return new Set(entries.filter((e) => e.kind === "chore" && e.date === date && ids.has(e.itemId)).map((e) => e.itemId)).size;
}

/** Days in a row (ending today if today is complete, else yesterday) with all chores done. */
export function streakFor(book: SettingsBook, kidId: string, entries: Entry[], t = today()): number {
  let n = 0;
  const todayIds = new Set(choresOn(book, kidId, t).map((c) => c.id));
  let day = todayIds.size && doneOn(entries, t, todayIds) === todayIds.size ? t : addDays(t, -1);
  for (let i = 0; i < 60; i++) {
    const ids = new Set(choresOn(book, kidId, day).map((c) => c.id));
    if (!ids.size || doneOn(entries, day, ids) < ids.size) break;
    n++;
    day = addDays(day, -1);
  }
  return n;
}

const pick = <T,>(list: T[], seed: number) => list[Math.abs(seed) % list.length];

export function pennyFor(opts: {
  kid: Kid;
  book: SettingsBook;
  summary: WeekSummary;
  entries: Entry[]; // chore entries for at least the last ~60 days
  lastSeen: string | null;
}): Penny {
  const { kid, book, summary: s, entries, lastSeen } = opts;
  const t = today();
  const hour = nowHour();
  const chores = choresOn(book, kid.id, t);
  const ids = new Set(chores.map((c) => c.id));
  const todayDone = doneOn(entries, t, ids);
  const todayTotal = ids.size;
  const left = todayTotal - todayDone;
  const firstLeft = chores.find((c) => !entries.some((e) => e.kind === "chore" && e.date === t && e.itemId === c.id));
  const yIds = new Set(choresOn(book, kid.id, addDays(t, -1)).map((c) => c.id));
  // Only scold about yesterday once tracking had started by then (no blame for days before the app).
  const tracking = entries.some((e) => e.date < t) || (lastSeen !== null && dateOf(lastSeen) < t);
  const yesterdayMissed = tracking ? yIds.size - doneOn(entries, addDays(t, -1), yIds) : 0;
  const streak = streakFor(book, kid.id, entries, t);
  const away = lastSeen ? daysBetween(dateOf(lastSeen), t) : null;
  const seed = Number(t.replaceAll("-", "")) + kid.id.length; // same line all day, different tomorrow
  const base = { streak, todayDone, todayTotal, lastSeen };

  // Away for a while: the Duolingo guilt trip comes first.
  if (away !== null && away >= 2) {
    return {
      ...base,
      mood: "mad",
      line: pick(
        [
          `Oh, you're back. It's been ${away} days. Penny counted.`,
          `${away} days without checking in. Penny is not mad. Penny is disappointed.`,
          `Penny waited ${away} days. The chores did not do themselves.`,
        ],
        seed,
      ),
    };
  }

  if (todayTotal > 0 && left === 0) {
    return {
      ...base,
      mood: "great",
      line:
        streak >= 2
          ? pick([`${streak}-day streak. Penny is impressed.`, `${streak} days in a row. Don't break it now.`], seed)
          : pick(["All done today. Penny is proud.", "Every chore done. Penny might frame this."], seed),
    };
  }

  if (yesterdayMissed > 0 && todayDone === 0) {
    return {
      ...base,
      mood: "mad",
      line: pick(
        [
          `You skipped ${yesterdayMissed} ${yesterdayMissed === 1 ? "chore" : "chores"} yesterday. Penny noticed.`,
          `Yesterday: ${yesterdayMissed} ${yesterdayMissed === 1 ? "chore" : "chores"} missed. Today is a fresh chance.`,
        ],
        seed,
      ),
    };
  }

  if (hour >= 18 && left > 0) {
    return {
      ...base,
      mood: "mad",
      line: firstLeft
        ? pick([`It's evening. "${firstLeft.label}" is still waiting.`, `${left} ${left === 1 ? "chore" : "chores"} left and the day is almost over.`], seed)
        : `${left} chores left and the day is almost over.`,
    };
  }

  if (s.deductionCents > 0) {
    return {
      ...base,
      mood: "sad",
      line: pick(
        [`You've lost ${money(s.deductionCents)} this week. Penny would like it back.`, `${money(s.deductionCents)} gone this week. Penny is not okay.`],
        seed,
      ),
    };
  }

  if (left > 0 && streak >= 2) {
    return { ...base, mood: "ok", line: `${streak}-day streak on the line. ${left} ${left === 1 ? "chore" : "chores"} to keep it.` };
  }

  return {
    ...base,
    mood: "ok",
    line: pick([`${left} ${left === 1 ? "chore" : "chores"} left today. Penny is watching.`, `${left} to go today. Penny believes in you. Mostly.`], seed),
  };
}

/** For past weeks there's nothing to nag about; Penny just reacts to the payout. */
export function pennyForPastWeek(s: WeekSummary): Pick<Penny, "mood" | "line"> {
  if (s.payoutCents >= s.baseCents) return { mood: "great", line: "Full allowance that week. Penny remembers." };
  if (s.payoutCents >= s.baseCents / 2) return { mood: "ok", line: `Lost ${money(s.deductionCents)} that week.` };
  return { mood: "sad", line: "A rough week. Fresh start Monday." };
}
