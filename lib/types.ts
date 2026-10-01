export type LogoType =
  | "Master brand"
  | "Program or product"
  | "Standards"
  | "Initiative"
  | "Event"
  | "Partner lockup"
  | "Badge or seal"
  | "Media or publication";

export type Status = "Active" | "Retired";
export type Decision = "Keep" | "Refresh" | "Merge" | "Rename" | "Retire";

export interface RawMark {
  id: string;
  order: number;
  sheetRow: number;
  name: string;
  auditGroup: string;
  logoType: LogoType;
  productActive: string;
  decision: Decision;
  status: Status;
  owner: string;
  confirmed: boolean;
  tagline: string;
  notes: string;
  fileNotes: string;
  sourceUrl: string;
  matchConfidence: string;
  drive: { fileId?: string; viewUrl?: string; imageUrl?: string };
  localFiles: string[];
  hasLogo: boolean;
}

export interface LogoFile {
  path: string;
  name: string;
  ext: string;
  bytes: number;
}

/** A mark prepared for the UI. Only serialisable fields, so it can cross to client components. */
export interface Mark {
  id: string;
  name: string;
  logoType: LogoType;
  auditGroup: string;
  decision: Decision;
  status: Status;
  owner: string;
  notes: string;
  fileNotes: string;
  sourceUrl: string;
  hasLogo: boolean;
  /** Drive thumbnail sized for cards, if the mark is in Drive. */
  driveThumb: string | null;
  /** Drive image at full preview size, if the mark is in Drive. */
  driveImage: string | null;
  /** Local WebP preview for cards. */
  localThumb: string | null;
  /** Best local file for the large preview (SVG first). */
  localImage: string | null;
  files: LogoFile[];
  aliases: string[];
  dated: boolean;
}
