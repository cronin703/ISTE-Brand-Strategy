import type { Metadata } from "next";
import Link from "next/link";
import { Callout, ContentPage, H2, P, PageHeader } from "@/components/Page";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = { title: "Naming and trademark use" };

const toc = [
  { id: "organization", label: "The organization" },
  { id: "programs", label: "Program names" },
  { id: "trademarks", label: "Trademarks" },
];

export default function Page() {
  return (
    <ContentPage toc={toc}>
      <PageHeader title="Naming and trademark use" lead="Write our names the same way every time." />
      <Callout tone="warn" title="Draft guidance.">
        Pending brand team approval, including whether ASCD marks are in scope for this hub.
      </Callout>
      <Reveal>
        <H2 id="organization">The organization</H2>
        <ul className="list-disc space-y-2 pl-5 text-text marker:text-border-strong">
          <li><strong className="text-heading">ISTE+ASCD</strong>: the combined organization. No spaces around the plus sign.</li>
          <li><strong className="text-heading">ISTE</strong>: use alone when the program or product is ISTE’s, such as ISTE Standards or ISTE Certification.</li>
          <li>Spell out once, on first use in formal writing: International Society for Technology in Education (ISTE).</li>
          <li>Always capitals. Never “Iste” or “the ISTE”.</li>
        </ul>
      </Reveal>
      <Reveal>
        <H2 id="programs">Program names</H2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[520px] text-left text-[15px]">
            <thead className="bg-bg-subtle text-heading">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Write</th>
                <th scope="col" className="px-4 py-3 font-semibold">Not</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["ISTELive 26", "ISTE Live 2026, Iste live"],
                ["ISTE Standards", "ISTE standards, the ISTE Standard"],
                ["ISTE Standards for Educators", "Educator ISTE Standards"],
                ["ISTE Certified Educator", "ISTE certified teacher"],
                ["EdSurge", "Ed Surge, Edsurge"],
              ].map(([a, b]) => (
                <tr key={a}>
                  <td className="px-4 py-3 font-semibold text-heading">{a}</td>
                  <td className="px-4 py-3 text-muted line-through decoration-danger/60">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>
          Each mark’s page shows the name exactly as it should be written. Retired names (for example ISTE U or Ed
          Influencers) shouldn’t appear in new work. See the <Link href="/logos/archive">Archive</Link>.
        </P>
      </Reveal>
      <Reveal>
        <H2 id="trademarks">Trademarks</H2>
        <ul className="list-disc space-y-2 pl-5 text-text marker:text-border-strong">
          <li>Use ™ or ® on the first prominent use in marketing materials, not every time.</li>
          <li>Use names as adjectives where you can: “ISTE Standards framework”, not “ISTE’s”.</li>
          <li>Partners may use our names to describe a real relationship. They may not imply endorsement without a seal or agreement.</li>
        </ul>
      </Reveal>
    </ContentPage>
  );
}
