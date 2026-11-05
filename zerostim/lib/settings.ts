import "server-only";
import { BUILT_IN_DEFAULTS, type Chore, type Defaults, type Item, type Kid } from "./family";
import { db, type Family, type KidRow } from "./db";

// A family's rules. Saved as versions by week, so changing amounts never
// rewrites what past weeks paid.

export type Rules = {
  deductions: Item[];
  bonuses: Item[];
  bonusCapCents: number;
  /** First day that counts for this family (set in Settings). */
  trackingStart: string;
};
export type Settings = Rules & {
  kids: Record<string, { baseCents: number; chores: Chore[] }>;
};

/** App-wide defaults for new families (set by the owner in /admin). */
export async function loadDefaults(): Promise<Defaults> {
  const raw = await db().getMeta("defaults");
  if (!raw) return BUILT_IN_DEFAULTS;
  try {
    const d = JSON.parse(raw) as Partial<Defaults>;
    return {
      kidCount: Number.isInteger(d.kidCount) ? (d.kidCount as number) : BUILT_IN_DEFAULTS.kidCount,
      baseCents: Number.isFinite(d.baseCents) ? (d.baseCents as number) : BUILT_IN_DEFAULTS.baseCents,
      chores: Array.isArray(d.chores) ? d.chores : BUILT_IN_DEFAULTS.chores,
      deductions: Array.isArray(d.deductions) ? d.deductions : BUILT_IN_DEFAULTS.deductions,
      bonuses: Array.isArray(d.bonuses) ? d.bonuses : BUILT_IN_DEFAULTS.bonuses,
      bonusCapCents: Number.isFinite(d.bonusCapCents) ? (d.bonusCapCents as number) : BUILT_IN_DEFAULTS.bonusCapCents,
    };
  } catch {
    return BUILT_IN_DEFAULTS;
  }
}

/** Fill in anything missing (e.g. a kid added later) from the kid row and defaults. */
function normalize(raw: unknown, kids: KidRow[], defaults: Defaults, trackingStart: string): Settings {
  const s = (raw ?? {}) as Partial<Settings>;
  const out: Settings["kids"] = {};
  for (const k of kids) {
    const v = s.kids?.[k.id];
    out[k.id] =
      v && Number.isFinite(v.baseCents) && Array.isArray(v.chores) ? v : { baseCents: k.baseCents, chores: defaults.chores };
  }
  return {
    kids: out,
    deductions: Array.isArray(s.deductions) ? s.deductions : defaults.deductions,
    bonuses: Array.isArray(s.bonuses) ? s.bonuses : defaults.bonuses,
    bonusCapCents: Number.isFinite(s.bonusCapCents) ? (s.bonusCapCents as number) : defaults.bonusCapCents,
    trackingStart,
  };
}

export type SettingsBook = { at(week: string): Settings; latestWeek: string | null; trackingStart: string };

/** Loads a family's saved versions once; `at(week)` picks the one in effect that week. */
export async function loadSettingsBook(family: Family, kids: KidRow[]): Promise<SettingsBook> {
  const [list, defaults] = await Promise.all([db().listSettings(family.id), loadDefaults()]);
  const versions = list.sort((a, b) => a.week.localeCompare(b.week));
  return {
    latestWeek: versions.at(-1)?.week ?? null,
    trackingStart: family.trackingStart,
    at(week) {
      const v = versions.filter((x) => x.week <= week).at(-1);
      return normalize(v?.data, kids, defaults, family.trackingStart);
    },
  };
}

/** The kid with this week's amount and chores applied. */
export function kidIn(settings: Settings, row: KidRow): Kid {
  const k = settings.kids[row.id];
  return { id: row.id, familyId: row.familyId, name: row.name, color: row.color, token: row.token, baseCents: k.baseCents, chores: k.chores };
}

/** Strip the per-family start date before saving a version. */
export function toSaved(s: Settings): Omit<Settings, "trackingStart"> {
  const { trackingStart: _t, ...rest } = s;
  void _t;
  return rest;
}
