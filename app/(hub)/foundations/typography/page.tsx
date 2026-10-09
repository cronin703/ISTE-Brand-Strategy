import type { Metadata } from "next";
import brand from "@/data/brand.json";
import { Callout, ContentPage, H2, P, PageHeader } from "@/components/Page";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = { title: "Typography" };

const toc = [
  { id: "typeface", label: "Typeface" },
  { id: "scale", label: "Type scale" },
  { id: "setting", label: "Setting text" },
];

const SCALE = [
  { name: "Display", size: 40, weight: 700, lh: 1.15, sample: "Education, Transformed." },
  { name: "Heading 2", size: 28, weight: 700, lh: 1.2, sample: "Spark curiosity in every classroom" },
  { name: "Heading 3", size: 20, weight: 600, lh: 1.3, sample: "Standards that grow with educators" },
  { name: "Body", size: 16, weight: 400, lh: 1.6, sample: "ISTE+ASCD helps educators use technology to transform learning, with standards, certification and community." },
  { name: "Small", size: 14, weight: 400, lh: 1.5, sample: "Captions, labels and supporting detail." },
];

export default function TypographyPage() {
  return (
    <ContentPage toc={toc}>
      <PageHeader title="Typography" lead="A clean sans-serif with bold headings, clear size steps and plenty of room to breathe." />
      <Callout tone="warn" title="Working values.">
        The official typeface is still to be confirmed by the brand team (including its web licence). Until then, use
        Inter. This site is set in it.
      </Callout>

      <Reveal>
        <H2 id="typeface">Typeface</H2>
        <div className="rounded-lg border border-border p-6 sm:p-8">
          <p className="text-[64px] font-bold leading-none text-heading sm:text-[88px]" aria-hidden>Aa</p>
          <p className="mt-4 text-xl font-semibold text-heading">Inter</p>
          <p className="text-muted">Fallback: system-ui sans. Weights 400, 600 and 700.</p>
          <p className="mt-4 break-words text-lg text-text" aria-hidden>
            ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
          </p>
        </div>
        <P>{brand.typography.approach}</P>
      </Reveal>

      <Reveal>
        <H2 id="scale">Type scale</H2>
        <ul className="divide-y divide-border rounded-lg border border-border">
          {SCALE.map((s) => (
            <li key={s.name} className="grid gap-2 p-5 sm:grid-cols-[150px_1fr] sm:gap-6">
              <div className="text-sm text-muted">
                <p className="font-semibold text-heading">{s.name}</p>
                <p className="font-mono">{s.size}px / {s.weight}</p>
              </div>
              <p className="min-w-0 break-words text-heading" style={{ fontSize: s.size, fontWeight: s.weight, lineHeight: s.lh }}>
                {s.sample}
              </p>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal>
        <H2 id="setting">Setting text</H2>
        <ul className="list-disc space-y-2 pl-5 text-text marker:text-border-strong">
          <li>Headings in bold navy, with a clear size jump from body text.</li>
          <li>Body at 16px or larger on screen, in gray or navy, with a line length of 60 to 75 characters.</li>
          <li>Sentence case for headings and buttons. No all-caps paragraphs.</li>
          <li>No serif, script, condensed or tightly tracked styles.</li>
          <li>Left-align text. Don’t justify it.</li>
        </ul>
      </Reveal>
    </ContentPage>
  );
}
