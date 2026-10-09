import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { CountUp } from "@/components/CountUp";
import { HeroTile } from "@/components/HeroTile";
import { DownloadButton } from "@/components/DownloadButton";
import { ArrowIcon } from "@/components/icons";
import { LogoCard } from "@/components/LogoCard";
import { Reveal } from "@/components/Reveal";
import { allMarks, counts, dataSource, getMark } from "@/lib/logos";
import { NAV, requestMailto } from "@/lib/nav";

const FEATURED = ["iste-iste-ascd", "iste-live", "iste-standards-educators", "iste-certified-educator"];

export default function Home() {
  const master = getMark("iste-iste-ascd")!;
  const svg = master.files.find((f) => f.ext === "SVG") ?? master.files[0];
  const c = counts();
  const featured = FEATURED.map((id) => getMark(id)!).filter(Boolean);
  const decisions = ["Keep", "Refresh", "Merge", "Rename", "Retire"].map((d) => ({
    d,
    n: allMarks().filter((m) => m.decision === d).length,
  }));
  const updated = new Date(`${dataSource.exported}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="px-4 pt-10 sm:px-8 lg:px-12 lg:pt-14">
      <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="card-enter">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">ISTE+ASCD Brand Hub</p>
          <h1 className="mt-3 text-[44px] font-bold leading-[1.05] tracking-[-0.02em] text-heading sm:text-[56px]">
            {["Education,", "Transformed."].map((w, i) => (
              <span key={w} className="word-mask" style={{ "--w": i } as React.CSSProperties}>
                <span>{w}</span>
                {i === 0 && " "}
              </span>
            ))}
          </h1>
          <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-muted">
            The logos, colors, type and voice behind ISTE+ASCD, in one place. Find the right mark, download it, and see
            how to use it.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <DownloadButton file={svg} markName="ISTE+ASCD master logo" variant="primary" />
            <Link
              href="/logos"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border-strong px-3 text-sm font-semibold text-heading hover:bg-tile"
            >
              Browse all logos <ArrowIcon width={16} height={16} />
            </Link>
          </div>
        </div>
        <HeroTile
          className="card-enter flex aspect-[4/3] items-center justify-center rounded-xl border border-border bg-tile p-10 sm:p-16"
          style={{ "--i": 2 } as React.CSSProperties}
        >
          <BrandMark className="h-auto w-full max-w-[360px]" title="ISTE+ASCD logo" animate />
        </HeroTile>
      </section>

      <Reveal className="mt-16">
        <h2 className="sr-only">Quick links</h2>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["/logos/iste-iste-ascd", "ISTE+ASCD logo", "The master mark, its files and rules."],
            ["/logos", "All logos", `${c.active} active marks, filterable by type.`],
            ["/foundations/color", "Colors", "Working palette with contrast pairs."],
            [requestMailto(), "Request a logo", "Need a lockup or a missing file? Ask the brand team."],
          ].map(([href, title, desc], i) => {
            const cls =
              "spotlight group flex h-full flex-col rounded-lg border border-border p-5 transition-[transform,box-shadow,border-color] duration-[var(--motion-150)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-hover)]";
            const body = (
              <>
                <span className="flex items-center justify-between text-lg font-semibold text-heading">
                  {title}
                  <ArrowIcon width={18} height={18} className="text-muted transition-transform duration-[var(--motion-150)] group-hover:translate-x-0.5" />
                </span>
                <span className="mt-1 text-[15px] text-muted">{desc}</span>
              </>
            );
            return (
              <li key={title} className="card-enter" style={{ "--i": i + 3 } as React.CSSProperties}>
                {href.startsWith("mailto:") ? (
                  <a href={href} className={cls}>{body}</a>
                ) : (
                  <Link href={href} className={cls}>{body}</Link>
                )}
              </li>
            );
          })}
        </ul>
      </Reveal>

      <Reveal className="mt-20">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[28px] font-bold text-heading">Recently updated</h2>
          <p className="text-sm text-muted">Synced from the Brand Lockup Checklist, {updated}</p>
        </div>
        <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
          {featured.map((m) => (
            <li key={m.id}><LogoCard mark={m} /></li>
          ))}
        </ul>
      </Reveal>

      <Reveal className="mt-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div>
            <h2 className="text-[28px] font-bold text-heading">Where the audit stands</h2>
            <p className="mt-3 max-w-[52ch] text-text">
              {c.total} logos and lockups were in circulation. The audit decides each one’s fate. The hub publishes the
              active marks and archives the rest so nobody uses them by mistake.
            </p>
            <p className="mt-4">
              <Link className="link" href="/logos/archive">See the {c.retired} retired marks</Link>
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-5">
            {decisions.map(({ d, n }) => (
              <div key={d} className="bg-bg p-4">
                <dt className="text-sm text-muted">{d}</dt>
                <dd className="mt-1 text-3xl font-bold text-heading tabular-nums"><CountUp value={n} /></dd>
              </div>
            ))}
            <div className="col-span-2 bg-bg p-4 sm:col-span-5">
              <dt className="text-sm text-muted">Marks with a file so far</dt>
              <dd className="mt-1 flex items-center gap-3">
                <CountUp value={c.withFile} className="text-3xl font-bold text-heading tabular-nums" />
                <span className="text-muted">of {c.total}</span>
                <span className="ml-auto hidden h-2 w-40 overflow-hidden rounded-full bg-tile sm:block" aria-hidden>
                  <span className="meter-fill block h-full rounded-full bg-indicator" style={{ width: `${(c.withFile / c.total) * 100}%` }} />
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </Reveal>

      <Reveal className="mt-20">
        <h2 className="mb-5 text-[28px] font-bold text-heading">Explore the hub</h2>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {NAV.filter((s) => s.href !== "/logos").map((s) => (
            <li key={s.href}>
              <Link href={s.href} className="spotlight block h-full rounded-lg bg-bg-subtle p-5 transition-colors duration-[var(--motion-150)] hover:bg-tile">
                <span className="text-lg font-semibold text-heading">{s.title}</span>
                <span className="mt-1 block text-[15px] text-muted">{s.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}
