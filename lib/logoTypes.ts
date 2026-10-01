import type { LogoType } from "./types";

export interface LogoTypeInfo {
  type: LogoType;
  slug: string;
  plural: string;
  summary: string;
  atlassian: string;
  rules: string[];
}

/** Draft usage rules per logo type, adapted from the atlassian.design logo pattern. */
export const LOGO_TYPES: LogoTypeInfo[] = [
  {
    type: "Master brand",
    slug: "master-brand",
    plural: "Master brand",
    summary: "The ISTE+ASCD mark. Use it to sign off anything the organization publishes.",
    atlassian: "Company logo",
    rules: [
      "Use it once per piece, usually top left or in the footer.",
      "Keep clear space equal to the height of the “i” leaf on every side.",
      "Minimum size: 24px tall on screen, 0.4 in (10 mm) in print.",
      "Full color on white or light backgrounds. Use the reversed version on navy or photos.",
    ],
  },
  {
    type: "Program or product",
    slug: "program-or-product",
    plural: "Programs and products",
    summary: "The ISTE mark plus a program or product name, built as one locked file.",
    atlassian: "Property logos",
    rules: [
      "Always use the supplied lockup. Never type a program name next to the ISTE logo yourself.",
      "Use the program lockup on that program’s own materials, not as a general ISTE sign-off.",
      "Same clear space and minimum size as the master brand.",
    ],
  },
  {
    type: "Standards",
    slug: "standards",
    plural: "Standards",
    summary: "Marks and diagrams for the ISTE Standards and each audience (Students, Educators, Leaders, Coaches).",
    atlassian: "Property logos",
    rules: [
      "Use the audience lockup that matches the standards you are citing.",
      "Show diagrams whole. Don’t crop, re-color or relabel their sections.",
      "Standards marks may not imply endorsement. Use a Seal of Alignment for that.",
    ],
  },
  {
    type: "Initiative",
    slug: "initiative",
    plural: "Initiatives",
    summary: "Initiatives with their own glyph and color (EdSurge, Course of Mind, DigCit Commit).",
    atlassian: "App logos",
    rules: [
      "Use the initiative’s own colors. Don’t switch them to ISTE navy.",
      "When the context is unclear, add “an ISTE+ASCD initiative” as text nearby. Don’t build it into the logo.",
      "Keep the glyph and wordmark together unless a glyph-only file is supplied.",
    ],
  },
  {
    type: "Event",
    slug: "event",
    plural: "Events",
    summary: "ISTELive and other events, including dated role marks for exhibitors, presenters and sponsors.",
    atlassian: "App logos",
    rules: [
      "Dated marks are valid for one event year. Always use the current year’s file.",
      "Role marks (Exhibitor, Presenter, Sponsor) are only for confirmed participants that year.",
      "Don’t edit the year or the city in a lockup. Request a new file instead.",
    ],
  },
  {
    type: "Partner lockup",
    slug: "partner-lockup",
    plural: "Partner and co-brand lockups",
    summary: "ISTE+ASCD shown with a partner. Each lockup needs sign-off from both sides.",
    atlassian: "Attribution logos",
    rules: [
      "Never compose a co-brand lockup yourself. Request one from the brand team.",
      "Separate the two marks with a thin vertical rule and equal visual weight.",
      "Check the partner agreement before every new use.",
    ],
  },
  {
    type: "Badge or seal",
    slug: "badge-or-seal",
    plural: "Badges and seals",
    summary: "Earned marks: certifications, Seals of Alignment, recognized programs and memberships.",
    atlassian: "No direct equivalent",
    rules: [
      "Only people or products that hold the credential may show it.",
      "Show the date or term on dated seals. Remove the seal when it expires.",
      "Don’t alter the badge shape, text or colors, and don’t use it as a decorative graphic.",
    ],
  },
  {
    type: "Media or publication",
    slug: "media-or-publication",
    plural: "Media and publications",
    summary: "Podcasts, journals and newsletters.",
    atlassian: "No direct equivalent",
    rules: [
      "Use the mark when promoting that title, not as a general ISTE sign-off.",
      "Cover art is not a logo. Use it only to show the publication itself.",
    ],
  },
];

export const typeInfo = (t: LogoType) => LOGO_TYPES.find((x) => x.type === t)!;

/** Retired marks whose audit note names a replacement. */
export const REPLACED_BY: Record<string, string> = {
  "iste-edsurge-co-brand": "edsurge",
  "iste-certification-trainer": "iste-certified-educator",
};
