import "server-only";
import webpush from "web-push";
import { db } from "./db";

// Phone notifications for parents (Web Push). Free, no outside account.
// On iPhone they work once ZeroStim is added to the Home Screen.

export const vapidPublicKey = () => process.env.VAPID_PUBLIC_KEY ?? "";
export const pushConfigured = () => Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

let ready = false;
function setup() {
  if (ready || !pushConfigured()) return pushConfigured();
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:hello@zerostim.app", process.env.VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
  ready = true;
  return true;
}

export type PushMessage = { title: string; body: string; url?: string; tag?: string };

/** Sends to every parent device in the family. Drops subscriptions the browser has revoked. */
export async function notifyFamily(familyId: string, msg: PushMessage): Promise<number> {
  if (!setup()) return 0;
  const subs = await db().listPushSubs(familyId);
  let sent = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(msg), { TTL: 60 * 60 * 12 });
        sent++;
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) await db().deletePushSub(s.endpoint);
        else console.error("push failed", code ?? e);
      }
    }),
  );
  return sent;
}
