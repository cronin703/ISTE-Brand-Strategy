export interface NavPage {
  title: string;
  href: string;
  description: string;
  keywords?: string[];
  placeholder?: boolean;
}
export interface NavSection {
  title: string;
  href: string;
  description: string;
  pages: NavPage[];
}

export const NAV: NavSection[] = [
  {
    title: "Get started",
    href: "/get-started",
    description: "What the hub is for, how to request a logo, and who to ask.",
    pages: [],
  },
  {
    title: "Logos",
    href: "/logos",
    description: "Every current ISTE+ASCD mark, its rules, and its files.",
    pages: [
      { title: "Logo library", href: "/logos", description: "Logo types, usage rules and every active mark.", keywords: ["download", "lockup", "mark"] },
      { title: "Archive", href: "/logos/archive", description: "Retired marks. Do not use them in new work.", keywords: ["retired", "old"] },
    ],
  },
  {
    title: "Foundations",
    href: "/foundations",
    description: "Color, type, imagery and accessibility for everything ISTE+ASCD makes.",
    pages: [
      { title: "Color", href: "/foundations/color", description: "Working palette with contrast pairs. Click a swatch to copy it.", keywords: ["hex", "palette", "navy", "blue"] },
      { title: "Typography", href: "/foundations/typography", description: "Typeface, sizes and how to set text.", keywords: ["font", "inter", "type"] },
      { title: "Photography", href: "/foundations/photography", description: "How ISTE+ASCD photography should feel.", placeholder: true, keywords: ["images", "photos"] },
      { title: "Iconography and illustration", href: "/foundations/iconography", description: "Icon style and abstract motifs.", placeholder: true, keywords: ["icons"] },
      { title: "Accessibility", href: "/foundations/accessibility", description: "The baseline every piece of work meets.", keywords: ["wcag", "a11y", "alt text", "contrast"] },
    ],
  },
  {
    title: "Content",
    href: "/content",
    description: "How ISTE+ASCD sounds, and how to write its names.",
    pages: [
      { title: "Voice and tone", href: "/content/voice-and-tone", description: "Inspirational, professional, peer to peer.", keywords: ["writing", "copy"] },
      { title: "Naming and trademark use", href: "/content/naming", description: "ISTE vs ISTE+ASCD, program names, trademarks.", keywords: ["names", "trademark"] },
      { title: "Boilerplate", href: "/content/boilerplate", description: "Approved descriptions to copy into press and partner materials.", keywords: ["about", "press"] },
    ],
  },
  {
    title: "Resources",
    href: "/resources",
    description: "Changelog and what is coming next.",
    pages: [
      { title: "What's new", href: "/resources/whats-new", description: "Dated changes to the hub and the marks.", keywords: ["changelog", "updates"] },
      { title: "Templates", href: "/resources/templates", description: "Slides, documents, social and email signatures. Phase 2.", placeholder: true, keywords: ["slides", "deck", "signature"] },
    ],
  },
];

export const BRAND_EMAIL = "cronin703@gmail.com";
export const requestMailto = (subject = "Logo or lockup request") =>
  `mailto:${BRAND_EMAIL}?subject=${encodeURIComponent(subject)}`;

export function allPages(): NavPage[] {
  const out: NavPage[] = [{ title: "Home", href: "/", description: "ISTE Brand Hub home." }];
  for (const s of NAV) {
    out.push({ title: s.title, href: s.href, description: s.description });
    for (const p of s.pages) if (p.href !== s.href) out.push(p);
  }
  return out;
}
