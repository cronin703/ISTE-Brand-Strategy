// Password gate for the demo. The password itself is never stored: the repo holds
// sha256(sha256("iste-hub:" + password)). The cookie holds the inner hash, so it can't be
// forged from the repo. Set SITE_PASSWORD_HASH in Vercel to change the password without a code change.
export const GATE_COOKIE = "hub_access";
const DEFAULT_HASH = "e395c135ef4acbfa5de6bc895bd69631f77637c78bdb21f805245796b3cf7dc6";

export const gateHash = () => process.env.SITE_PASSWORD_HASH || DEFAULT_HASH;

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** The cookie value a correct password earns. */
export const tokenFor = (password: string) => sha256(`iste-hub:${password}`);

/** Constant-time compare of two hex strings. */
function same(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function tokenIsValid(token: string | undefined) {
  if (!token) return false;
  return same(await sha256(token), gateHash());
}

/** Only allow redirects back into the hub. */
export function safeNext(next: string | null | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/unlock") ? next : "/";
}
