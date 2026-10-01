import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage, H2, P, PageHeader } from "@/components/Page";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = { title: "Accessibility" };

const toc = [
  { id: "baseline", label: "The baseline" },
  { id: "color", label: "Color and contrast" },
  { id: "images", label: "Logos and images" },
  { id: "motion", label: "Motion" },
  { id: "checklist", label: "Checklist" },
];

export default function AccessibilityPage() {
  return (
    <ContentPage toc={toc}>
      <PageHeader title="Accessibility" lead="ISTE+ASCD serves every learner. Everything we publish meets WCAG 2.2 AA." />
      <Reveal>
        <H2 id="baseline">The baseline</H2>
        <P>
          WCAG 2.2 level AA is the minimum for web pages, documents, slides, email and social posts. It covers contrast,
          text alternatives, keyboard use and motion, and it applies to partner and agency work made for us too.
        </P>
      </Reveal>
      <Reveal>
        <H2 id="color">Color and contrast</H2>
        <P>
          Text needs 4.5:1 against its background, or 3:1 when it is large. Our bright accent blue doesn’t reach 4.5:1 on
          white, so use the darker accent for links and small text. The <Link href="/foundations/color#pairs">contrast
          pairs</Link> show which combinations pass.
        </P>
        <P>Never use color alone to carry meaning. Add a word, an icon or a pattern.</P>
      </Reveal>
      <Reveal>
        <H2 id="images">Logos and images</H2>
        <P>
          Give every logo the mark’s name as alt text, for example “ISTE Standards, Educators”. Each logo page has its alt
          text ready to copy. Describe photos by what they show and why they’re there. Leave purely decorative images with
          empty alt text.
        </P>
      </Reveal>
      <Reveal>
        <H2 id="motion">Motion</H2>
        <P>
          Keep motion short and purposeful: 100 to 300ms, easing out on enter. Nothing loops forever. When someone turns
          on reduced motion, replace movement with an instant change or a short fade, and never carry meaning through
          motion alone.
        </P>
      </Reveal>
      <Reveal>
        <H2 id="checklist">Checklist</H2>
        <ul className="space-y-2 text-text">
          {[
            "Text meets 4.5:1 contrast (3:1 when large)",
            "Every logo and meaningful image has alt text",
            "Everything works with a keyboard, with a visible focus ring",
            "Headings are in order and links say where they go",
            "Color is never the only signal",
            "Motion respects reduced-motion settings",
            "Videos have captions; audio has a transcript",
            "Layouts work from 375px wide with no sideways scrolling",
          ].map((t) => (
            <li key={t} className="flex gap-3 rounded-md bg-bg-subtle px-4 py-2.5">
              <span aria-hidden className="font-bold text-success">✓</span>
              {t}
            </li>
          ))}
        </ul>
      </Reveal>
    </ContentPage>
  );
}
