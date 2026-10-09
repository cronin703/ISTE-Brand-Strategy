"use client";

import { useCopy } from "./CopyButton";
import { CheckIcon, CopyIcon } from "./icons";

/** Color swatch that copies its hex value on click. */
export function Swatch({ name, hex, role, rgb, border }: { name: string; hex: string; role?: string; rgb: string; border?: boolean }) {
  const { copied, copy } = useCopy();
  return (
    <li data-reveal>
      <button
        type="button"
        onClick={() => copy(hex.toUpperCase())}
        className="spotlight group block w-full overflow-hidden rounded-lg border border-border text-left transition-[transform,box-shadow] duration-[var(--motion-150)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]"
        aria-label={`${name}, ${hex.toUpperCase()}. Copy hex value`}
      >
        <span className={`block h-28 ${border ? "border-b border-border" : ""}`} style={{ background: hex }} aria-hidden />
        <span className="block p-4">
          <span className="flex items-center justify-between gap-2">
            <span className="font-semibold text-heading">{name}</span>
            <span className="swap text-sm font-medium text-muted">
              <span data-on={!copied} className="inline-flex items-center justify-end gap-1.5">
                <CopyIcon width={14} height={14} /> Copy
              </span>
              <span data-on={copied} className="inline-flex items-center justify-end gap-1.5 text-success">
                <CheckIcon width={14} height={14} /> Copied
              </span>
            </span>
          </span>
          <span className="mt-1 block font-mono text-sm text-text">{hex.toUpperCase()}</span>
          <span className="block font-mono text-xs text-muted">RGB {rgb}</span>
          {role && <span className="mt-2 block text-sm text-muted">{role}</span>}
        </span>
      </button>
      <span className="sr-only" aria-live="polite">{copied ? `${hex.toUpperCase()} copied` : ""}</span>
    </li>
  );
}
