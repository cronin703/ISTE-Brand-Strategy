"use client";

import { useEffect, useState } from "react";
import { removePushSubscription, savePushSubscription, sendTestPush } from "@/app/actions";

type Status = "checking" | "unsupported" | "ios-install" | "blocked" | "off" | "on" | "busy" | "nokey";

function keyBytes(base64: string) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = () => window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;

async function currentSub() {
  const reg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  return { reg, sub: await reg.pushManager.getSubscription() };
}

/** "Turn on notifications" for this device. `compact` = dashboard reminder that hides once on or dismissed. */
export function PushToggle({ vapidKey, compact = false }: { vapidKey: string; compact?: boolean }) {
  const [status, setStatus] = useState<Status>("checking");
  const [note, setNote] = useState("");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try { setDismissed(localStorage.getItem("zs-push-dismissed") === "1"); } catch {}
    if (!vapidKey) return setStatus("nokey");
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      return setStatus(isIOS() && !isStandalone() ? "ios-install" : "unsupported");
    }
    if (Notification.permission === "denied") return setStatus("blocked");
    currentSub()
      .then(({ sub }) => setStatus(sub ? "on" : "off"))
      .catch(() => setStatus("unsupported"));
  }, [vapidKey]);

  async function turnOn() {
    setStatus("busy");
    setNote("");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return setStatus(perm === "denied" ? "blocked" : "off");
      const { reg, sub: existing } = await currentSub();
      const sub = existing ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(vapidKey) }));
      await savePushSubscription(sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } });
      setStatus("on");
      setNote("Notifications are on. Sending a test…");
      const n = await sendTestPush();
      setNote(n > 0 ? "Sent a test notification." : "Turned on, but the test didn't go through. Try again in a minute.");
    } catch {
      setStatus("off");
      setNote("Couldn't turn on notifications on this device. Try again.");
    }
  }

  async function turnOff() {
    setStatus("busy");
    try {
      const { sub } = await currentSub();
      if (sub) {
        await removePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setStatus("off");
      setNote("Notifications are off on this device.");
    } catch {
      setStatus("on");
    }
  }

  if (compact && (status !== "off" || dismissed)) return null;

  const body: Record<Status, React.ReactNode> = {
    checking: <p className="muted small">Checking this device…</p>,
    nokey: <p className="muted small">Notifications aren&apos;t set up for this app yet.</p>,
    unsupported: <p className="muted small">This browser can&apos;t show notifications. Try Safari on iPhone (from the Home Screen) or Chrome.</p>,
    "ios-install": (
      <p className="small">
        On iPhone, notifications need ZeroStim on your Home Screen. In Safari tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>, open ZeroStim from there, and come back here.
      </p>
    ),
    blocked: <p className="small">Notifications are blocked for ZeroStim. Turn them on in your phone&apos;s Settings, then reload.</p>,
    off: (
      <button className="btn btn-solid" onClick={turnOn}>Turn on notifications</button>
    ),
    busy: <button className="btn btn-solid" disabled aria-busy>Working…</button>,
    on: (
      <div className="push-on">
        <span className="pill pill-good">On for this device</span>
        <button className="btn btn-small" onClick={async () => { setNote("Sending…"); const n = await sendTestPush(); setNote(n ? "Sent a test notification." : "The test didn't go through."); }}>Send a test</button>
        <button className="btn btn-small" onClick={turnOff}>Turn off</button>
      </div>
    ),
  };

  return (
    <div className={compact ? "panel push-prompt" : "push-toggle"}>
      {compact && (
        <div className="panel-head">
          <h2>Get a heads-up when the kids finish</h2>
          <button className="btn btn-ghost btn-small" onClick={() => { setDismissed(true); try { localStorage.setItem("zs-push-dismissed", "1"); } catch {} }}>Not now</button>
        </div>
      )}
      {compact && <p className="muted small">ZeroStim tells you when a kid checks off all of today&apos;s chores, plus an 8pm wrap-up of anything still waiting.</p>}
      {body[status]}
      {note && <p className="muted small" aria-live="polite">{note}</p>}
    </div>
  );
}
