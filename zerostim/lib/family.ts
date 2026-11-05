// Family setup and DEFAULT rules, taken from the paper allowance charts.
// The parent can change amounts, chores and items on the Settings page;
// these values are used until they do.
// Amounts are in cents to avoid floating-point money bugs.

export type Item = { id: string; label: string; cents: number };
export type Kid = {
  id: string;
  name: string;
  age: number;
  baseCents: number;
  chores: { id: string; label: string }[];
};

const sharedChores = [
  { id: "bed", label: "Make bed and tidy bedroom" },
  { id: "hamper", label: "Put dirty clothes in hamper" },
  { id: "laundry", label: "Put away clean laundry" },
  { id: "dishes", label: "Clear dishes after meals" },
  { id: "homework", label: "Complete homework / school prep" },
];

export const KIDS: Kid[] = [
  {
    id: "thomas",
    name: "Thomas",
    age: 12,
    baseCents: 1000,
    chores: [...sharedChores, { id: "trash", label: "Take out trash or recycling" }],
  },
  {
    id: "carter",
    name: "Carter",
    age: 9,
    baseCents: 1500,
    chores: [...sharedChores, { id: "pet", label: "Feed pet or set the table" }],
  },
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

/** Default first day that counts, until Mom or Dad picks one in Settings. */
export const TRACKING_START = process.env.TRACKING_START || "2026-11-05";

export const HOUSE_RULES = [
  "One warning for minor disrespect; intentional aggression has no warning.",
  "No double-charging one incident. Self-defense and accidents are not punished.",
  "Apologize and repair harm; money is not a substitute.",
  "Fresh start Monday; minimum $0.",
];

export function getKid(id: string): Kid | undefined {
  return KIDS.find((k) => k.id === id);
}

export function money(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  return `${sign}$${(Math.abs(cents) / 100).toFixed(2)}`;
}
