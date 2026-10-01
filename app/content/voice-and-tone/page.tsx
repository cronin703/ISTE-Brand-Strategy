import type { Metadata } from "next";
import { ContentPage, H2, P, PageHeader } from "@/components/Page";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = { title: "Voice and tone" };

const toc = [
  { id: "voice", label: "Our voice" },
  { id: "principles", label: "Principles" },
  { id: "examples", label: "Instead of, write" },
  { id: "tone", label: "Tone by context" },
];

export default function Page() {
  return (
    <ContentPage toc={toc}>
      <PageHeader title="Voice and tone" lead="Inspirational yet professional. We speak to educators as peers." />
      <Reveal>
        <H2 id="voice">Our voice</H2>
        <P>
          We believe technology can transform learning, and we say so with confidence. We back aspirational words like
          transform, spark and thrive with real pedagogy and real examples. We don’t hype, and we don’t hide behind jargon.
        </P>
      </Reveal>
      <Reveal>
        <H2 id="principles">Principles</H2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Peer to peer", "Write to educators as colleagues. Never talk down, never lecture."],
            ["Aspiration with evidence", "Pair every big idea with the practice or research behind it."],
            ["Plain and short", "Short sentences, common words. Explain a term the first time you use it."],
            ["Forward-looking", "Focus on what educators can do next, not on what’s broken."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-lg border border-border p-5">
              <p className="font-semibold text-heading">{t}</p>
              <p className="mt-1 text-[15px] text-muted">{d}</p>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal>
        <H2 id="examples">Instead of, write</H2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[520px] text-left text-[15px]">
            <thead className="bg-bg-subtle text-heading">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Instead of</th>
                <th scope="col" className="px-4 py-3 font-semibold">Write</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["Leverage cutting-edge solutions to revolutionize pedagogy.", "Use technology to help every student learn more deeply."],
                ["Teachers must implement the standards.", "The standards give you a framework to build on."],
                ["Utilize our comprehensive suite of offerings.", "Find courses, books and events for your next step."],
                ["Click here", "Download the ISTE Standards"],
              ].map(([a, b]) => (
                <tr key={a}>
                  <td className="px-4 py-3 text-muted"><span className="sr-only">Instead of: </span>{a}</td>
                  <td className="px-4 py-3 text-heading"><span className="sr-only">Write: </span>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
      <Reveal>
        <H2 id="tone">Tone by context</H2>
        <ul className="list-disc space-y-2 pl-5 text-text marker:text-border-strong">
          <li><strong className="text-heading">Events and campaigns:</strong> energetic and inviting. This is where spark and thrive belong.</li>
          <li><strong className="text-heading">Standards and research:</strong> precise and grounded. Let the evidence speak.</li>
          <li><strong className="text-heading">Certification and badges:</strong> clear and exact about what was earned and when.</li>
          <li><strong className="text-heading">Support and errors:</strong> calm and direct. Say what happened and what to do next.</li>
        </ul>
      </Reveal>
    </ContentPage>
  );
}
