import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DecisionBadge, NeutralBadge, StatusBadge, decisionHint } from "@/components/Badge";
import { CopyButton } from "@/components/CopyButton";
import { DownloadButton } from "@/components/DownloadButton";
import { ExternalIcon, MailIcon } from "@/components/icons";
import { LogoCard } from "@/components/LogoCard";
import { Callout } from "@/components/Page";
import { PreviewTile } from "@/components/PreviewTile";
import { formatBytes } from "@/lib/format";
import { allMarks, dataSource, getMark, relatedMarks } from "@/lib/logos";
import { REPLACED_BY, typeInfo } from "@/lib/logoTypes";
import { requestMailto } from "@/lib/nav";

export function generateStaticParams() {
  return allMarks().map((m) => ({ id: m.id }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const mark = getMark((await params).id);
  return mark ? { title: mark.name, description: `${mark.name}: ${mark.logoType}. Files, rules and alt text.` } : {};
}

const lastUpdated = new Date(`${dataSource.exported}T12:00:00Z`).toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function LogoDetail({ params }: { params: Promise<{ id: string }> }) {
  const mark = getMark((await params).id);
  if (!mark) notFound();
  const retired = mark.status === "Retired";
  const info = typeInfo(mark.logoType);
  const replacement = REPLACED_BY[mark.id] ? getMark(REPLACED_BY[mark.id]) : undefined;
  const related = relatedMarks(mark);
  const host = mark.sourceUrl ? new URL(mark.sourceUrl).host.replace(/^www\./, "") : null;

  return (
    <div className="px-4 pt-8 sm:px-8 lg:px-12 lg:pt-10">
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/logos" className="hover:text-heading hover:underline">Logos</Link></li>
          <li aria-hidden>/</li>
          {retired && (
            <>
              <li><Link href="/logos/archive" className="hover:text-heading hover:underline">Archive</Link></li>
              <li aria-hidden>/</li>
            </>
          )}
          <li aria-current="page" className="text-text">{mark.name}</li>
        </ol>
      </nav>

      <header className="mb-8">
        <h1 className="text-[32px] font-bold leading-tight tracking-[-0.01em] text-heading sm:text-[40px]">{mark.name}</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusBadge status={mark.status} />
          <NeutralBadge>{mark.logoType}</NeutralBadge>
          <DecisionBadge decision={mark.decision} />
          {mark.dated && <NeutralBadge>Dated mark</NeutralBadge>}
        </div>
      </header>

      {retired && (
        <Callout tone="danger" title="Retired, do not use.">
          {replacement ? (
            <>
              Use <Link className="link" href={`/logos/${replacement.id}`}>{replacement.name}</Link> instead.
            </>
          ) : (
            <>
              The audit retired this mark and no replacement is named yet. Use the{" "}
              <Link className="link" href="/logos/iste-iste-ascd">ISTE+ASCD master brand</Link> or{" "}
              <a className="link" href={`mailto:${"cronin703@gmail.com"}?subject=${encodeURIComponent(`Replacement for ${mark.name}`)}`}>ask the brand team</a>.
            </>
          )}
        </Callout>
      )}

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <PreviewTile mark={mark} retired={retired} />

          {mark.fileNotes && (
            <Callout tone="warn" title="This file is not a master.">
              {mark.fileNotes.replace(/\.$/, "")}. Fine for screens and drafts; ask the brand team for a vector master before printing.
            </Callout>
          )}

          {!mark.hasLogo && !retired && (
            <Callout title="Logo needed.">
              We don’t have a file for this mark yet. If you have the original, or need it for a project, email the brand team.
              <div className="mt-3">
                <a
                  href={requestMailto(`File for ${mark.name}`)}
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-action px-3 text-sm font-semibold text-on-action hover:bg-action-hover"
                >
                  <MailIcon width={16} height={16} /> Send a file or request one
                </a>
              </div>
            </Callout>
          )}

          <section aria-labelledby="files" className="mt-10">
            <h2 id="files" className="mb-3 text-xl font-semibold text-heading">Files</h2>
            {mark.files.length === 0 ? (
              <p className="text-muted">No files yet.</p>
            ) : (
              <ul className="divide-y divide-border rounded-lg border border-border">
                {mark.files.map((f, i) => (
                  <li key={f.path} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-heading">{f.name}</p>
                      <p className="text-sm text-muted">
                        {f.ext} · {formatBytes(f.bytes)}
                        {f.ext === "SVG" ? " · vector" : ""}
                      </p>
                    </div>
                    {retired ? (
                      <span className="text-sm font-semibold text-danger">No download: retired</span>
                    ) : (
                      <DownloadButton file={f} markName={mark.name} variant={i === 0 ? "primary" : "secondary"} />
                    )}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-sm text-muted">
              Single files for the demo. The full release bundles every approved color and layout in one download.
            </p>
          </section>

          <section aria-labelledby="alt" className="mt-10">
            <h2 id="alt" className="mb-3 text-xl font-semibold text-heading">Alt text</h2>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-bg-subtle px-4 py-3">
              <code className="font-mono text-[15px] text-heading">{mark.name}</code>
              <CopyButton text={mark.name} what="Alt text" />
            </div>
          </section>

          <section aria-labelledby="rules" className="mt-10">
            <h2 id="rules" className="mb-1 text-xl font-semibold text-heading">Rules for {info.plural.toLowerCase()}</h2>
            <p className="mb-3 text-muted">{info.summary}</p>
            <ul className="list-disc space-y-1.5 pl-5 text-text marker:text-border-strong">
              {info.rules.map((r) => <li key={r}>{r}</li>)}
            </ul>
            <p className="mt-3 text-sm">
              <Link className="link" href="/logos#do-and-dont">Do and don’t for every mark</Link>
            </p>
          </section>
        </div>

        <aside className="xl:sticky xl:top-24 xl:h-fit">
          <h2 className="sr-only">Details</h2>
          <dl className="divide-y divide-border rounded-lg border border-border text-[15px]">
            <Row label="Logo type">{mark.logoType}</Row>
            <Row label="Audit group">{mark.auditGroup}</Row>
            <Row label="Status">{retired ? "Retired" : "Active"}</Row>
            <Row label="Audit decision">
              {mark.decision}
              <span className="block text-sm text-muted">{decisionHint[mark.decision]}</span>
            </Row>
            <Row label="Owner">{mark.owner}</Row>
            <Row label="Last updated">{lastUpdated}</Row>
            {mark.notes && <Row label="Audit notes">{mark.notes}</Row>}
            {host && (
              <Row label="Source">
                <a className="link inline-flex items-center gap-1" href={mark.sourceUrl} target="_blank" rel="noreferrer">
                  {host} <ExternalIcon width={14} height={14} />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </Row>
            )}
          </dl>
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-16">
          <h2 id="related" className="mb-4 text-xl font-semibold text-heading">
            More from {mark.auditGroup.replace(/^Group \d+: /, "")}
          </h2>
          <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
            {related.map((m) => (
              <li key={m.id}><LogoCard mark={m} /></li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 px-4 py-3">
      <dt className="text-muted">{label}</dt>
      <dd className="min-w-0 break-words text-heading">{children}</dd>
    </div>
  );
}
