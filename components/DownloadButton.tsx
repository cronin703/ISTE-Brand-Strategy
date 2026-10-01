"use client";

import { useEffect, useRef, useState } from "react";
import { formatBytes } from "@/lib/format";
import type { LogoFile } from "@/lib/types";
import { CheckIcon, DownloadIcon } from "./icons";

export function DownloadButton({
  file,
  markName,
  variant = "secondary",
  compact = false,
}: {
  file: LogoFile;
  markName: string;
  variant?: "primary" | "secondary";
  compact?: boolean;
}) {
  const [done, setDone] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const styles =
    variant === "primary"
      ? "bg-action text-on-action hover:bg-action-hover border-transparent"
      : "border-border-strong text-heading hover:bg-tile";

  return (
    <a
      href={file.path}
      download={file.name}
      onClick={() => {
        setDone(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setDone(false), 1500);
      }}
      aria-label={`Download ${markName}, ${file.ext}, ${formatBytes(file.bytes)}`}
      className={`relative z-10 inline-flex h-9 items-center rounded-md border px-3 text-sm font-semibold transition-colors duration-[var(--motion-150)] ${styles}`}
    >
      <span className="swap">
        <span data-on={!done} className="inline-flex items-center gap-2">
          <DownloadIcon width={16} height={16} />
          {compact ? file.ext : `Download ${file.ext}`}
          <span className="font-normal">{formatBytes(file.bytes)}</span>
        </span>
        <span data-on={done} className="inline-flex items-center justify-center gap-2" aria-hidden={!done}>
          <CheckIcon width={16} height={16} />
          Downloaded
        </span>
      </span>
      <span className="sr-only" aria-live="polite">
        {done ? "Downloaded" : ""}
      </span>
    </a>
  );
}
