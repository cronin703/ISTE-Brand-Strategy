import "server-only";
import { BONUSES, BONUS_CAP_CENTS, DEDUCTIONS, KIDS, type Item, type Kid } from "./family";
import { db } from "./db";

// The rules the parent can change. Saved as versions by week, so changing
// amounts never rewrites what past weeks paid.

export type Rules = { deductions: Item[]; bonuses: Item[]; bonusCapCents: number };
export type Settings = Rules & {
  kids: Record<string, { baseCents: number; chores: { id: string; label: string }[] }>;
};

export function defaultSettings(): Settings {
  return {
    kids: Object.fromEntries(KIDS.map((k) => [k.id, { baseCents: k.baseCents, chores: k.chores }])),
    deductions: DEDUCTIONS,
    bonuses: BONUSES,
    bonusCapCents: BONUS_CAP_CENTS,
  };
}

/** Fill in anything missing (e.g. a kid added later) from the defaults. */
function normalize(raw: unknown): Settings {
  const d = defaultSettings();
  const s = (raw ?? {}) as Partial<Settings>;
  const kids = { ...d.kids };
  for (const k of KIDS) {
    const v = s.kids?.[k.id];
    if (v && Number.isFinite(v.baseCents) && Array.isArray(v.chores)) kids[k.id] = v;
  }
  return {
    kids,
    deductions: Array.isArray(s.deductions) ? s.deductions : d.deductions,
    bonuses: Array.isArray(s.bonuses) ? s.bonuses : d.bonuses,
    bonusCapCents: Number.isFinite(s.bonusCapCents) ? (s.bonusCapCents as number) : d.bonusCapCents,
  };
}

export type SettingsBook = { at(week: string): Settings; latestWeek: string | null };

/** Loads every saved version once; `at(week)` picks the one in effect that week. */
export async function loadSettingsBook(): Promise<SettingsBook> {
  const versions = (await db().listSettings()).sort((a, b) => a.week.localeCompare(b.week));
  return {
    latestWeek: versions.at(-1)?.week ?? null,
    at(week) {
      const v = versions.filter((x) => x.week <= week).at(-1);
      return v ? normalize(v.data) : defaultSettings();
    },
  };
}

export async function settingsFor(week: string): Promise<Settings> {
  return (await loadSettingsBook()).at(week);
}

/** The kid with this week's amount and chores applied. */
export function kidIn(settings: Settings, kidId: string): Kid | undefined {
  const base = KIDS.find((k) => k.id === kidId);
  if (!base) return undefined;
  const k = settings.kids[kidId];
  return { ...base, baseCents: k.baseCents, chores: k.chores };
}
