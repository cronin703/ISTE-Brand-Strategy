"use client";

import { useEffect, useRef, useState } from "react";
import { ImageOffIcon } from "./icons";

export interface LogoImageSource {
  name: string;
  status?: string;
  hasLogo: boolean;
  driveThumb: string | null;
  driveImage: string | null;
  localThumb: string | null;
  localImage: string | null;
}

/**
 * Shows a mark from Google Drive, falls back to the local copy if Drive has no file or fails,
 * and shows a "Logo needed" placeholder when there is no file at all.
 */
export function LogoImage({
  mark,
  size = "thumb",
  className = "",
  priority = false,
}: {
  mark: LogoImageSource;
  size?: "thumb" | "full";
  className?: string;
  priority?: boolean;
}) {
  const sources = (size === "thumb" ? [mark.driveThumb, mark.localThumb] : [mark.driveImage, mark.localImage]).filter(
    (s): s is string => !!s,
  );
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLImageElement>(null);
  const src = sources[index];

  // An image can fail before hydration attaches onError; catch that case too.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setIndex((i) => i + 1);
    else if (img && img.complete) img.dataset.loaded = "";
  }, [src]);

  if (!mark.hasLogo || !src) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-center">
        <ImageOffIcon width={28} height={28} />
        <span className="text-sm font-semibold">{mark.status === "Retired" ? "No file on record" : "Logo needed"}</span>
      </div>
    );
  }

  return (
    // Plain <img>: Drive serves its own sized thumbnails, and local previews are pre-sized WebP.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      key={src}
      src={src}
      alt={mark.name}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setIndex((i) => i + 1)}
      onLoad={(e) => (e.currentTarget.dataset.loaded = "")}
      className={`logo-img max-h-full max-w-full object-contain ${className}`}
    />
  );
}
