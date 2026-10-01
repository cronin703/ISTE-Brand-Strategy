import { NAV } from "@/lib/nav";
import { CardGrid, LinkCard, PageHeader } from "./Page";

export function SectionLanding({ href, lead }: { href: string; lead?: string }) {
  const section = NAV.find((s) => s.href === href)!;
  return (
    <div className="px-4 pt-10 sm:px-8 lg:px-12 lg:pt-12">
      <div className="max-w-[1100px]">
        <PageHeader title={section.title} lead={lead ?? section.description} />
        <CardGrid>
          {section.pages.map((p, i) => (
            <LinkCard key={p.href} href={p.href} title={p.title} description={p.description} index={i} tag={p.placeholder ? "Soon" : undefined} />
          ))}
        </CardGrid>
      </div>
    </div>
  );
}
