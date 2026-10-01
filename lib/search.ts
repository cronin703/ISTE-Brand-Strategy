import "server-only";
import type { SearchItem } from "@/components/SearchPalette";
import { allMarks } from "./logos";
import { allPages } from "./nav";

export function searchIndex(): SearchItem[] {
  const pages: SearchItem[] = allPages().map((p) => ({
    title: p.title,
    href: p.href,
    kind: "Page",
    detail: p.description,
    keywords: p.keywords ?? [],
  }));
  const logos: SearchItem[] = allMarks().map((m) => ({
    title: m.name,
    href: `/logos/${m.id}`,
    kind: "Logo",
    detail: `${m.logoType}${m.hasLogo ? "" : " · logo needed"}`,
    keywords: [...m.aliases, m.logoType, m.auditGroup],
    retired: m.status === "Retired",
  }));
  return [...logos, ...pages];
}
