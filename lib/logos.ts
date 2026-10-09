import "server-only";
import { statSync } from "node:fs";
import path from "node:path";
import raw from "@/data/logos.json";
import { withBase } from "./basePath";
import type { LogoType, Mark, RawMark } from "./types";

export const LOGO_TYPE_ORDER: LogoType[] = [
  "Master brand",
  "Program or product",
  "Standards",
  "Initiative",
  "Event",
  "Partner lockup",
  "Badge or seal",
  "Media or publication",
];

export const dataSource = {
  source: raw.source,
  driveFolder: raw.driveFolder,
  exported: raw.exported,
};

function fileInfo(p: string) {
  const abs = path.join(process.cwd(), "public", p);
  const ext = path.extname(p).slice(1).toUpperCase().replace("JPEG", "JPG");
  let bytes = 0;
  try {
    bytes = statSync(abs).size;
  } catch {}
  return { path: withBase(p), name: path.basename(p), ext, bytes };
}

function aliasesFor(name: string): string[] {
  const out = new Set<string>();
  const plain = name.replace(/[()"]/g, "").replace(/,/g, "");
  out.add(plain);
  if (/ISTE Live/i.test(name)) out.add("ISTELive");
  if (/\+/.test(name)) out.add(name.replace(/\+/g, " and "));
  if (/^ISTE /.test(name)) out.add(name.replace(/^ISTE /, ""));
  return [...out].filter((a) => a !== name);
}

function toMark(m: RawMark): Mark {
  const files = m.localFiles.map(fileInfo);
  const first = m.localFiles[0];
  const svg = m.localFiles.find((f) => f.endsWith(".svg"));
  const thumbName = first ? path.parse(first).name : null;
  const driveImage = m.drive?.fileId ? m.drive.imageUrl ?? null : null;
  return {
    id: m.id,
    name: m.name,
    logoType: m.logoType,
    auditGroup: m.auditGroup,
    decision: m.decision,
    status: m.status,
    owner: m.owner,
    notes: m.notes,
    fileNotes: m.fileNotes,
    sourceUrl: m.sourceUrl,
    hasLogo: m.hasLogo,
    driveImage,
    driveThumb: driveImage ? driveImage.replace(/sz=w\d+/, "sz=w640") : null,
    localThumb: thumbName ? withBase(`/thumbs/${thumbName}.webp`) : null,
    localImage: withBase(svg ?? first ?? "") || null,
    files,
    aliases: aliasesFor(m.name),
    dated: /dated|annual/i.test(`${m.name} ${m.notes} ${m.fileNotes}`),
  };
}

const marks: Mark[] = (raw.marks as RawMark[])
  .slice()
  .sort((a, b) => a.order - b.order)
  .map(toMark);

export const allMarks = () => marks;
export const activeMarks = () => marks.filter((m) => m.status === "Active");
export const retiredMarks = () => marks.filter((m) => m.status === "Retired");
export const getMark = (id: string) => marks.find((m) => m.id === id);
export const relatedMarks = (mark: Mark) =>
  marks.filter((m) => m.id !== mark.id && m.auditGroup === mark.auditGroup && m.status === mark.status).slice(0, 4);

export const counts = () => ({
  total: marks.length,
  active: activeMarks().length,
  retired: retiredMarks().length,
  withFile: marks.filter((m) => m.hasLogo).length,
  missing: marks.filter((m) => !m.hasLogo).length,
});
