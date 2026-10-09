import type { Metadata } from "next";
import Link from "next/link";
import { LogoCard } from "@/components/LogoCard";
import { Callout, PageHeader } from "@/components/Page";
import { retiredMarks } from "@/lib/logos";

export const metadata: Metadata = {
  title: "Archive",
  description: "Retired ISTE marks. Do not use them in new work.",
};

export default function ArchivePage() {
  const marks = retiredMarks();
  return (
    <div className="px-4 pt-10 sm:px-8 lg:px-12 lg:pt-12">
      <PageHeader
        title="Archive"
        lead={`${marks.length} marks retired by the brand audit. They stay here so you can recognize them and swap them out of old materials.`}
        crumbs={[{ label: "Logos", href: "/logos" }]}
      />
      <Callout tone="danger" title="Retired, do not use.">
        Don’t use these marks in anything new, and replace them when you update older work. Files aren’t offered for
        download. Each page says what to use instead, or use the{" "}
        <Link className="link" href="/logos/iste-iste-ascd">ISTE+ASCD master brand</Link>.
      </Callout>
      <h2 className="sr-only">Retired marks</h2>
      <ul className="mt-8 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {marks.map((m, i) => (
          <li key={m.id} className="card-enter" style={{ "--i": i } as React.CSSProperties}>
            <LogoCard mark={m} priority={i < 4} />
          </li>
        ))}
      </ul>
    </div>
  );
}
