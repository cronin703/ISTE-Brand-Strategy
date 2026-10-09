import type { Metadata } from "next";
import { CopyButton } from "@/components/CopyButton";
import { Callout, ContentPage, H2, PageHeader } from "@/components/Page";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = { title: "Boilerplate" };

const BLOCKS = [
  {
    id: "short",
    title: "One line",
    text: "ISTE+ASCD is a nonprofit that helps educators use technology to transform learning.",
  },
  {
    id: "medium",
    title: "Short paragraph",
    text: "ISTE+ASCD is a nonprofit that helps educators use technology to transform learning. Through the ISTE Standards, professional learning, certification and community, it works toward a world where all students engage in transformative learning experiences that spark their imagination and prepare them to thrive in learning and life.",
  },
  {
    id: "tagline",
    title: "Tagline",
    text: "Education, Transformed.",
  },
];

const toc = BLOCKS.map((b) => ({ id: b.id, label: b.title }));

export default function Page() {
  return (
    <ContentPage toc={toc}>
      <PageHeader title="Boilerplate" lead="Approved descriptions to copy into press releases, partner pages and event programs." />
      <Callout tone="warn" title="Draft text.">
        Built from ISTE’s published mission and vision. Confirm with the brand team before external use.
      </Callout>
      {BLOCKS.map((b) => (
        <Reveal key={b.id}>
          <H2 id={b.id}>{b.title}</H2>
          <figure className="rounded-lg border border-border bg-bg-subtle p-5">
            <blockquote className="max-w-[68ch] text-[17px] leading-relaxed text-heading">{b.text}</blockquote>
            <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
              {b.text.split(/\s+/).length} words
              <CopyButton text={b.text} what={`${b.title} boilerplate`} />
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </ContentPage>
  );
}
