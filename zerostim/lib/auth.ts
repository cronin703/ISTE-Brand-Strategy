import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "crypto";
import { getKid } from "./family";

// Signed-cookie sessions. No user table: one parent password and one PIN per kid,
// all set as environment variables.

export type Session = { role: "parent" } | { role: "kid"; kidId: string };

const COOKIE = "zerostim_session";
const MAX_AGE = 60 * 60 * 24 * 90; // 90 days, so kids aren't re-entering PINs constantly
const isProd = process.env.NODE_ENV === "production";

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  if (isProd) throw new Error("SESSION_SECRET must be set in production.");
  return "dev-only-secret";
}

export function parentPassword(): string | undefined {
  return process.env.PARENT_PASSWORD || (isProd ? undefined : "parent");
}

export function kidPin(kidId: string): string | undefined {
  const dev: Record<string, string> = { thomas: "1111", carter: "2222" };
  return process.env[`KID_PIN_${kidId.toUpperCase()}`] || (isProd ? undefined : dev[kidId]);
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const ha = createHmac("sha256", "cmp").update(a).digest();
  const hb = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function setSession(s: Session) {
  const payload = Buffer.from(JSON.stringify({ ...s, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
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
    if (data.role === "parent") return { role: "parent" };
    if (data.role === "kid" && getKid(data.kidId)) return { role: "kid", kidId: data.kidId };
  } catch {}
  return null;
}

export async function requireParent() {
  const s = await getSession();
  if (s?.role !== "parent") redirect("/login?who=parent");
}

/** Kids can see only their own page; the parent can see any kid's page. */
export async function requireKidAccess(kidId: string) {
  const s = await getSession();
  if (s?.role === "parent") return s;
  if (s?.role === "kid" && s.kidId === kidId) return s;
  redirect(`/login?who=${kidId}`);
}
