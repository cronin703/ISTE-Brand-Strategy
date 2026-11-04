// All dates are plain "YYYY-MM-DD" strings in the family's time zone.
// Weeks start on Monday ("Fresh start Monday").

const TZ = process.env.FAMILY_TZ || "America/New_York";

export function today(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

function toUTC(date: string): Date {
  return new Date(`${date}T12:00:00Z`);
}

export function addDays(date: string, n: number): string {
  const d = toUTC(date);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function weekStart(date: string): string {
  const day = toUTC(date).getUTCDay(); // 0 = Sunday
  return addDays(date, -((day + 6) % 7));
}

export function weekDays(start: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export const DAY_SHORT = ["M", "T", "W", "Th", "F", "Sa", "Su"];
export const DAY_LONG = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function isValidDate(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(toUTC(s).getTime());
}

export function formatRange(start: string): string {
  const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return `${fmt.format(toUTC(start))} – ${fmt.format(toUTC(addDays(start, 6)))}`;
}

export function formatShort(date: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(toUTC(date));
}
