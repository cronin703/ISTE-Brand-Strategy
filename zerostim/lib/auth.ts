import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "crypto";
import { db, type Family, type Parent } from "./db";

// Signed-cookie sessions.
// - Parents log in with email + password (hashed in the database).
// - The app owner logs in at /admin with ADMIN_PASSWORD. That area isn't linked anywhere.
// - Kids never log in; their page is reached by a private link per kid.

/** `asAdmin`: the app owner is viewing as this parent (impersonation). */
export type Session = { role: "parent"; parentId: string; familyId: string; asAdmin?: boolean } | { role: "admin" };

const COOKIE = "zerostim_session";
const DEVICE = "zerostim_family"; // remembers which family's dashboard this device shows
const MAX_AGE = 60 * 60 * 24 * 90; // 90 days
const isProd = process.env.NODE_ENV === "production";

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  if (isProd) throw new Error("SESSION_SECRET must be set in production.");
  return "dev-only-secret";
}

export function adminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD || (isProd ? undefined : "admin");
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const ha = createHmac("sha256", "cmp").update(a).digest();
  const hb = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(ha, hb);
}

const cookieOpts = { httpOnly: true, secure: isProd, sameSite: "lax" as const, path: "/", maxAge: MAX_AGE };

export async function setSession(s: Session) {
  const payload = Buffer.from(JSON.stringify({ ...s, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, cookieOpts);
}

export async function clearSession() {
  (await cookies()).delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    if (data.role === "admin") return { role: "admin" };
    if (data.role === "parent" && typeof data.parentId === "string" && typeof data.familyId === "string") {
      return { role: "parent", parentId: data.parentId, familyId: data.familyId, asAdmin: data.asAdmin === true };
    }
  } catch {}
  return null;
}

/** The logged-in parent (checked against the database), or null. */
export async function currentParent(): Promise<{ parent: Parent; family: Family } | null> {
  const s = await getSession();
  if (s?.role !== "parent") return null;
  const parent = await db().getParent(s.parentId);
  if (!parent || parent.familyId !== s.familyId) return null;
  const family = await db().getFamily(parent.familyId);
  return family ? { parent, family } : null;
}

export async function requireParent() {
  const p = await currentParent();
  if (!p) redirect("/login");
  return p;
}

export async function requireAdmin() {
  const s = await getSession();
  if (s?.role !== "admin") redirect("/admin/login");
}

/* ---- Device memory: which family's dashboard to show on this phone ---- */

export async function rememberFamily(token: string) {
  (await cookies()).set(DEVICE, token, cookieOpts);
}

export async function deviceFamily(): Promise<Family | null> {
  const token = (await cookies()).get(DEVICE)?.value;
  return token ? db().getFamilyByToken(token) : null;
}
