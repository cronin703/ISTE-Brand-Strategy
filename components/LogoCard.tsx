import Link from "next/link";
import type { Mark } from "@/lib/types";
import { DownloadButton } from "./DownloadButton";
import { LogoImage } from "./LogoImage";

/** Card for the grid. The name link stretches over the card; the download button sits above it. */
export function LogoCard({ mark, priority }: { mark: Mark; priority?: boolean }) {
  const retired = mark.status === "Retired";
  const primary = mark.files[0];
  return (
    <article className="spotlight group relative flex h-full flex-col rounded-lg border border-border bg-bg transition-[transform,box-shadow,border-color] duration-[var(--motion-150)] ease-[var(--ease-out)] focus-within:border-border-strong hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-hover)]">
      {/* Light tile in both themes: most files are drawn for light backgrounds. */}
      <div className="m-2 mb-0 flex aspect-[16/10] items-center justify-center overflow-hidden rounded-md bg-[#f4f5f7] p-6 text-[#58595b]">
        <LogoImage
          mark={mark}
          priority={priority}
          className={`transition-transform duration-[var(--motion-150)] ease-[var(--ease-out)] group-hover:scale-[1.02] ${
            retired ? "opacity-60 grayscale" : ""
          }`}
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="text-base font-semibold leading-snug text-heading">
            <Link
              href={`/logos/${mark.id}`}
              className="rounded after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--focus)]"
            >
              {mark.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm text-muted">{mark.logoType}</p>
        </div>
        <div className="mt-auto flex min-h-9 flex-wrap items-center gap-2">
          {retired ? (
            <span className="inline-flex items-center gap-1.5 rounded bg-danger-bg px-2 py-1 text-xs font-semibold text-danger">
              Retired, do not use
            </span>
          ) : primary ? (
            <DownloadButton file={primary} markName={mark.name} compact />
          ) : (
            <span className="inline-flex items-center rounded border border-dashed border-border-strong px-2 py-1 text-xs font-semibold text-muted">
              No file yet
            </span>
          )}
          {!retired && mark.fileNotes && (
            <span className="rounded bg-warn-bg px-2 py-1 text-xs font-semibold text-warn">Stand-in file</span>
          )}
          {mark.dated && !retired && (
            <span className="rounded bg-tile px-2 py-1 text-xs font-semibold text-text">Dated</span>
          )}
        </div>
      </div>
    </article>
  );
}
