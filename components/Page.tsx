import Link from "next/link";
import { ChevronIcon } from "./icons";

export function PageHeader({
  title,
  lead,
  crumbs,
  children,
}: {
  title: string;
  lead?: React.ReactNode;
  crumbs?: { label: string; href: string }[];
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-10">
      {crumbs && (
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-1">
            {crumbs.map((c) => (
              <li key={c.href} className="flex items-center gap-1">
                <Link href={c.href} className="rounded hover:text-heading hover:underline">
                  {c.label}
                </Link>
                <ChevronIcon width={14} height={14} />
              </li>
            ))}
          </ol>
        </nav>
      )}
      <h1 className="text-[32px] font-bold leading-tight tracking-[-0.01em] text-heading sm:text-[40px]">{title}</h1>
      {lead && <p className="mt-3 max-w-[62ch] text-lg leading-relaxed text-muted">{lead}</p>}
      {children}
    </header>
  );
}

/** Content page frame: main column plus a sticky "On this page" list at wide widths. */
export function ContentPage({
  toc,
  children,
}: {
  toc?: { id: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 pt-10 sm:px-8 lg:px-12 lg:pt-12">
      <div className="flex gap-12">
        <div className="prose-hub min-w-0 max-w-[820px] flex-1">{children}</div>
        {toc && toc.length > 0 && (
          <nav aria-label="On this page" className="sticky top-28 hidden h-fit w-52 shrink-0 xl:block">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">On this page</p>
            <ul className="space-y-2 border-l border-border text-sm">
              {toc.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="-ml-px block border-l border-transparent pl-4 text-muted hover:border-border-strong hover:text-heading">
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
}

export function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mb-4 mt-14 scroll-mt-24 text-[28px] font-bold leading-tight text-heading">
      {children}
    </h2>
  );
}

export function H3({ children, id }: { children: React.ReactNode; id?: string }) {
  return <h3 id={id} className="mb-2 mt-8 text-xl font-semibold text-heading">{children}</h3>;
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="my-4 text-text">{children}</p>;
}

export function Callout({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warn" | "danger";
  title: string;
  children?: React.ReactNode;
}) {
  const tones = {
    info: "bg-info-bg border-indicator",
    warn: "bg-warn-bg border-warn",
    danger: "bg-danger-bg border-danger",
  };
  return (
    <div role="note" className={`my-6 rounded-lg border-l-4 px-5 py-4 ${tones[tone]}`}>
      <p className="font-semibold text-heading">{title}</p>
      {children && <div className="mt-1 text-[15px] text-text">{children}</div>}
    </div>
  );
}

export function CardGrid({ children }: { children: React.ReactNode }) {
  return <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</ul>;
}

export function LinkCard({
  href,
  title,
  description,
  index = 0,
  tag,
}: {
  href: string;
  title: string;
  description: string;
  index?: number;
  tag?: string;
}) {
  return (
    <li className="card-enter" style={{ "--i": index } as React.CSSProperties}>
      <Link
        href={href}
        className="group flex h-full flex-col rounded-lg border border-border bg-bg p-5 transition-[transform,box-shadow,border-color] duration-[var(--motion-150)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-hover)]"
      >
        <span className="flex items-center justify-between gap-3">
          <span className="text-lg font-semibold text-heading">{title}</span>
          {tag && <span className="rounded border border-border px-2 py-0.5 text-xs text-muted">{tag}</span>}
        </span>
        <span className="mt-1.5 text-[15px] text-muted">{description}</span>
      </Link>
    </li>
  );
}
