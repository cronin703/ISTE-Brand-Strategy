"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "./icons";

export function useCopy() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1500);
  }
  return { copied, copy };
}

export function CopyButton({ text, label = "Copy", what }: { text: string; label?: string; what: string }) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(text)}
      aria-label={`${label} ${what}`}
      className="inline-flex h-9 items-center rounded-md border border-border-strong px-3 text-sm font-semibold text-heading hover:bg-tile"
    >
      <span className="swap">
        <span data-on={!copied} className="inline-flex items-center gap-2">
          <CopyIcon width={16} height={16} /> {label}
        </span>
        <span data-on={copied} aria-hidden={!copied} className="inline-flex items-center justify-center gap-2">
          <CheckIcon width={16} height={16} /> Copied
        </span>
      </span>
      <span className="sr-only" aria-live="polite">{copied ? `${what} copied` : ""}</span>
    </button>
  );
}
