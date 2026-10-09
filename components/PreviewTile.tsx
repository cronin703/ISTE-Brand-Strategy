"use client";

import { useState } from "react";
import { LogoImage, type LogoImageSource } from "./LogoImage";

/** Large preview with a light/dark background toggle. Backgrounds cross-fade 200ms. */
export function PreviewTile({ mark, retired }: { mark: LogoImageSource; retired: boolean }) {
  const [bg, setBg] = useState<"light" | "dark">("light");
  return (
    <div>
      <div className="spotlight relative aspect-[16/10] overflow-hidden rounded-lg border border-border">
        <div
          aria-hidden
          className={`absolute inset-0 bg-[#f4f5f7] transition-opacity duration-[var(--motion-200)] ease-[var(--ease-out)] ${
            bg === "light" ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          aria-hidden
          className={`absolute inset-0 bg-[#1d2125] transition-opacity duration-[var(--motion-200)] ease-[var(--ease-out)] ${
            bg === "dark" ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`relative flex h-full items-center justify-center p-8 sm:p-14 ${
            bg === "dark" ? "text-[#c7d1db]" : "text-[#58595b]"
          }`}
        >
          <LogoImage mark={mark} size="full" priority className={retired ? "opacity-60 grayscale" : ""} />
        </div>
      </div>
      {mark.hasLogo && (
        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="text-sm text-muted">Preview background</p>
          <div role="radiogroup" aria-label="Preview background" className="inline-flex rounded-md border border-border p-0.5">
            {(["light", "dark"] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={bg === v}
                onClick={() => setBg(v)}
                className={`h-8 rounded px-3 text-sm font-medium capitalize ${
                  bg === v ? "bg-heading text-bg" : "text-text hover:bg-tile"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
