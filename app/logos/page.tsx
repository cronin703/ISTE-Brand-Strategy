import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { DoDont, DoDontGrid } from "@/components/DoDont";
import { LogoLibrary } from "@/components/LogoLibrary";
import { Callout, H2, H3 } from "@/components/Page";
import { Reveal } from "@/components/Reveal";
import { allMarks, counts } from "@/lib/logos";
import { LOGO_TYPES } from "@/lib/logoTypes";
import { requestMailto } from "@/lib/nav";

export const metadata: Metadata = {
  title: "Logos",
  description: "Every active ISTE+ASCD mark, the rules for each logo type, and the files.",
};

export default function LogosPage() {
  const c = counts();
  return (
    <div className="px-4 pt-10 sm:px-8 lg:px-12 lg:pt-12">
      <header className="mb-8 max-w-[820px]">
        <h1 className="text-[32px] font-bold leading-tight tracking-[-0.01em] text-heading sm:text-[40px]">Logos</h1>
        <p className="mt-3 max-w-[62ch] text-lg text-muted">
          Find the right ISTE+ASCD mark, download it, and check the rules for its type. Retired marks live in the{" "}
          <Link className="link" href="/logos/archive">Archive</Link>.
        </p>
        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <Stat label="Active marks" value={c.active} />
          <Stat label="Retired" value={c.retired} />
          <Stat label="Still need a file" value={c.missing} />
        </dl>
      </header>

      <ul className="mb-10 grid max-w-[1100px] gap-3 text-[15px] md:grid-cols-3">
        {[
          ["Download, don’t rebuild", "Use the supplied file. Never type a name next to a logo to make a lockup."],
          ["Check the status", "Active marks only. If a page says Retired, use what it points to."],
          ["Stand-in files", "Some files are crops or web copies. The detail page says so. Ask for a master for print."],
        ].map(([t, d]) => (
          <li key={t} className="rounded-lg bg-bg-subtle px-4 py-3">
            <p className="font-semibold text-heading">{t}</p>
            <p className="mt-0.5 text-muted">{d}</p>
          </li>
        ))}
      </ul>

      <section id="library" aria-labelledby="library-title" className="scroll-mt-20">
        <h2 id="library-title" className="sr-only">Logo library</h2>
        <LogoLibrary marks={allMarks()} />
      </section>

      <div className="max-w-[1100px]">
        <Reveal>
          <H2 id="logo-types">Logo types and their rules</H2>
          <p className="mb-8 max-w-[68ch] text-text">
            Every mark belongs to one type. The type tells you when to use it and what you can and can’t change. The
            structure follows the logo types on atlassian.design.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {LOGO_TYPES.map((t) => (
              <article id={`type-${t.slug}`} key={t.slug} className="scroll-mt-40 rounded-lg border border-border p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold text-heading">{t.plural}</h3>
                  <span className="text-xs text-muted">Like Atlassian’s {t.atlassian.toLowerCase()}</span>
                </div>
                <p className="mt-1 text-[15px] text-muted">{t.summary}</p>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] text-text marker:text-border-strong">
                  {t.rules.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <H2 id="do-and-dont">Do and don’t</H2>
          <p className="mb-6 max-w-[68ch] text-text">
            These apply to every mark. They’re shown with the master brand.
          </p>
          <DoDontGrid>
            <DoDont kind="do" caption="Use the full-color mark on white or a light neutral, with clear space on every side.">
              <BrandMark className="h-24 w-auto" />
            </DoDont>
            <DoDont kind="do" caption="Use the reversed mark on ISTE navy or a dark photo." tileClass="bg-navy reversed-mark">
              <BrandMark className="h-24 w-auto" />
            </DoDont>
            <DoDont kind="dont" caption="Stretch, squash or rotate the mark.">
              <BrandMark className="h-20 w-auto scale-x-[1.45] -rotate-6" />
            </DoDont>
            <DoDont kind="dont" caption="Re-color it, even in brand colors.">
              <BrandMark className="h-24 w-auto hue-rotate-[140deg] saturate-200" />
            </DoDont>
            <DoDont kind="dont" caption="Place it on a busy pattern or a low-contrast color." tileClass="bg-[repeating-linear-gradient(45deg,#28a8d4_0_14px,#7dd3f5_14px_28px)]">
              <BrandMark className="h-24 w-auto" />
            </DoDont>
            <DoDont kind="dont" caption="Add shadows, outlines, glows or other effects.">
              <BrandMark className="h-24 w-auto drop-shadow-[6px_6px_0_rgba(250,167,59,0.9)]" />
            </DoDont>
          </DoDontGrid>
        </Reveal>

        <Reveal>
          <H2 id="alt-text">Alt text</H2>
          <p className="mb-3 max-w-[68ch] text-text">
            Use the mark’s name as its alt text, for example “ISTE+ASCD” or “ISTE Standards, Educators”. Don’t add
            “logo” or describe colors. If the logo is a link, describe where it goes instead, for example “ISTE+ASCD
            home”. Every detail page has the alt text ready to copy.
          </p>
        </Reveal>

        <Reveal>
          <H2 id="request">Need a mark that isn’t here?</H2>
          <Callout title={`${c.missing} marks still need a master file.`}>
            They show “Logo needed” in the library. If you have one, or need a new lockup, email the brand team.{" "}
            <a className="link" href={requestMailto()}>Request a logo or lockup</a>
          </Callout>
        </Reveal>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="sr-only">{label}</dt>
      <dd className="text-2xl font-bold text-heading tabular-nums">{value}</dd>
      <span aria-hidden className="text-muted">{label.toLowerCase()}</span>
    </div>
  );
}
