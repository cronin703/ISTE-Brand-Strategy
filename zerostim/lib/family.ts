// Shared types, colors and the built-in defaults (from the original paper
// allowance charts). The app owner can change the defaults for new families
// in /admin; each family changes its own rules in Settings.
// Amounts are in cents to avoid floating-point money bugs.

export type Item = { id: string; label: string; cents: number };
export type Chore = { id: string; label: string };

/** A kid with the amounts and chores in effect for a given week. */
export type Kid = {
  id: string;
  familyId: string;
  name: string;
  color: KidColor;
  token: string; // private link for the kid's page
  baseCents: number;
  chores: Chore[];
};

/** Each kid gets a color world. Order = the order new kids get them. */
export const KID_COLORS = ["cobalt", "flame", "lime", "grape", "teal", "bubble"] as const;
export type KidColor = (typeof KID_COLORS)[number];
export const COLOR_NAMES: Record<KidColor, string> = {
  cobalt: "Blue",
  flame: "Orange",
  lime: "Green",
  grape: "Purple",
  teal: "Teal",
  bubble: "Pink",
};
export const isKidColor = (c: unknown): c is KidColor => KID_COLORS.includes(c as KidColor);

export const DEFAULT_CHORES: Chore[] = [
  { id: "bed", label: "Make bed and tidy bedroom" },
  { id: "hamper", label: "Put dirty clothes in hamper" },
  { id: "laundry", label: "Put away clean laundry" },
  { id: "dishes", label: "Clear dishes after meals" },
  { id: "homework", label: "Complete homework / school prep" },
  { id: "trash", label: "Take out trash or recycling" },
];

export const DEDUCTIONS: Item[] = [
  { id: "rude", label: "Rude comment / name-calling / teasing", cents: 50 },
  { id: "provoke", label: "Yelling at or intentionally provoking sibling", cents: 50 },
  { id: "push", label: "Pushing, grabbing or shoving", cents: 100 },
  { id: "hit", label: "Hitting, kicking or intentionally hurting", cents: 200 },
  { id: "refuse", label: "Repeated refusal to complete a chore", cents: 50 },
  { id: "lie", label: "Lying about completing a chore", cents: 100 },
];

export const BONUSES: Item[] = [
  { id: "help", label: "Help sibling / handle conflict calmly", cents: 50 },
  { id: "extra", label: "Extra household chore", cents: 100 },
  { id: "calmweek", label: "Full week without intentional aggression", cents: 200 },
];

export const BONUS_CAP_CENTS = 300;

/** Fallback start date if a family has none. */
export const TRACKING_START = process.env.TRACKING_START || "2026-11-05";

/** What a new family starts with. Editable by the app owner in /admin. */
export type Defaults = {
  kidCount: number;
  baseCents: number;
  chores: Chore[];
  deductions: Item[];
  bonuses: Item[];
  bonusCapCents: number;
};

export const BUILT_IN_DEFAULTS: Defaults = {
  kidCount: 2,
  baseCents: 1000,
  chores: DEFAULT_CHORES,
  deductions: DEDUCTIONS,
  bonuses: BONUSES,
  bonusCapCents: BONUS_CAP_CENTS,
};

export const HOUSE_RULES = [
  "One warning for minor disrespect; intentional aggression has no warning.",
  "No double-charging one incident. Self-defense and accidents are not punished.",
  "Apologize and repair harm; money is not a substitute.",
  "Fresh start Monday; minimum $0.",
];

export function money(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  return `${sign}$${(Math.abs(cents) / 100).toFixed(2)}`;
}
