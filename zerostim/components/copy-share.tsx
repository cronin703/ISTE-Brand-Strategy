"use client";

import { useState } from "react";

/** Share sheet on phones that support it; copies to clipboard everywhere else. */
export function ShareButton({ text, url, title, label = "Share link" }: { text?: string; url?: string; title: string; label?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  async function go() {
    const payload = { title, text, url };
    try {
      if (navigator.share) {
        await navigator.share(payload);
        return;
      }
      await navigator.clipboard.writeText([text, url].filter(Boolean).join("\n"));
      setState("copied");
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2000);
  }
  return (
    <button type="button" className="btn btn-solid" onClick={go} aria-live="polite">
      {state === "copied" ? "Copied" : state === "failed" ? "Couldn't copy. Long-press the link instead." : label}
    </button>
  );
}

export function RevealPin({ pin }: { pin: string }) {
  const [shown, setShown] = useState(false);
  return (
    <button type="button" className="btn" onClick={() => setShown((s) => !s)} aria-pressed={shown}>
      {shown ? `PIN ${pin}` : "Show PIN"}
    </button>
  );
}
