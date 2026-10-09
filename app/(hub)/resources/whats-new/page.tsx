import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/Page";
import { counts } from "@/lib/logos";

export const metadata: Metadata = { title: "What’s new" };

export default function Page() {
  const c = counts();
  const entries = [
    {
      date: "2026-10-01",
      tag: "Launch",
      title: "Brand Hub demo is live",
      items: [
        <>Logo library with {c.active} active marks, filters by type and status, and one page per mark.</>,
        <>{c.retired} retired marks moved to the <Link className="link" href="/logos/archive">Archive</Link>, labeled “Retired, do not use”.</>,
        <>Working <Link className="link" href="/foundations/color">color palette</Link> with contrast pairs, plus Typography and Accessibility.</>,
        <>Draft <Link className="link" href="/content/voice-and-tone">voice and tone</Link>, naming and boilerplate.</>,
      ],
    },
    {
      date: "2026-10-01",
      tag: "Logos",
      title: "Brand Lockup Checklist imported",
      items: [
        <>All {c.total} marks from the checklist, each with its audit decision, owner and source.</>,
        <>{c.withFile} marks have a file. {c.missing} show “Logo needed” until a master is found.</>,
        <>Files that are crops, banners or web copies are flagged as stand-ins on their pages.</>,
      ],
    },
    {
      date: "2021-08-01",
      tag: "Audit",
      title: "ISTE Brand Treatment audit",
      items: [<>The audit that grouped every mark into five groups and proposed what to keep, refresh, merge, rename or retire.</>],
    },
  ];
  return (
    <div className="px-4 pt-10 sm:px-8 lg:px-12 lg:pt-12">
      <div className="max-w-[820px]">
        <PageHeader title="What’s new" lead="Dated changes to the hub and the marks in it." />
        <ol className="relative border-l border-border">
          {entries.map((e, i) => (
            <li key={e.title} className="card-enter relative mb-12 pl-8" style={{ "--i": i } as React.CSSProperties}>
              <span aria-hidden className="absolute -left-[5px] top-2 size-[9px] rounded-full bg-indicator ring-4 ring-bg" />
              <p className="flex flex-wrap items-center gap-3 text-sm text-muted">
                <time dateTime={e.date}>
                  {new Date(`${e.date}T12:00:00Z`).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                    ...(e.tag !== "Audit" ? { day: "numeric" } : {}),
                  })}
                </time>
                <span className="rounded border border-border px-2 py-0.5 text-xs font-semibold text-text">{e.tag}</span>
              </p>
              <h2 className="mt-2 text-xl font-semibold text-heading">{e.title}</h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-text marker:text-border-strong">
                {e.items.map((it, j) => <li key={j}>{it}</li>)}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
