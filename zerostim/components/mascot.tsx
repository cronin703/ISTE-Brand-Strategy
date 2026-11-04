import { useId } from "react";

// "Penny" — ZeroStim's coin mascot. Her face follows the week:
// great = at or above the starting amount, ok = most of it, oops = under half.

export type Mood = "great" | "ok" | "oops";

export function moodFor(payoutCents: number, baseCents: number): Mood {
  if (payoutCents >= baseCents) return "great";
  if (payoutCents >= baseCents / 2) return "ok";
  return "oops";
}

export function Mascot({ mood = "great", size = 120, className }: { mood?: Mood; size?: number; className?: string }) {
  const gid = `penny-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <radialGradient id={gid} cx="38%" cy="30%" r="75%">
          <stop offset="0" stopColor="#FFE680" />
          <stop offset="0.55" stopColor="#FFC21A" />
          <stop offset="1" stopColor="#F29A00" />
        </radialGradient>
      </defs>
      {/* white sticker edge, then ink outline */}
      <circle cx="60" cy="62" r="54" fill="#fff" />
      <circle cx="60" cy="60" r="46" fill={`url(#${gid})`} stroke="#15131A" strokeWidth="7" />
      <circle cx="60" cy="60" r="36" fill="none" stroke="#E08A00" strokeWidth="3" strokeDasharray="2 6" strokeLinecap="round" />
      {/* shine */}
      <path d="M33 44c4-9 12-15 21-17" fill="none" stroke="#FFF6C9" strokeWidth="6" strokeLinecap="round" />
      {/* eyes */}
      {mood === "great" ? (
        <g fill="none" stroke="#15131A" strokeWidth="6" strokeLinecap="round">
          <path d="M40 58q7-9 14 0" />
          <path d="M66 58q7-9 14 0" />
        </g>
      ) : (
        <g>
          <ellipse cx="47" cy="56" rx="7" ry={mood === "oops" ? 8 : 9} fill="#15131A" />
          <ellipse cx="73" cy="56" rx="7" ry={mood === "oops" ? 8 : 9} fill="#15131A" />
          <circle cx="49.5" cy="52.5" r="2.5" fill="#fff" />
          <circle cx="75.5" cy="52.5" r="2.5" fill="#fff" />
        </g>
      )}
      {/* cheeks */}
      <circle cx="36" cy="70" r="5" fill="#FF6FA8" opacity="0.8" />
      <circle cx="84" cy="70" r="5" fill="#FF6FA8" opacity="0.8" />
      {/* mouth */}
      {mood === "great" && <path d="M46 70q14 16 28 0z" fill="#15131A" stroke="#15131A" strokeWidth="4" strokeLinejoin="round" />}
      {mood === "ok" && <path d="M49 74q11 7 22 0" fill="none" stroke="#15131A" strokeWidth="5" strokeLinecap="round" />}
      {mood === "oops" && <path d="M49 78q5-5 11 0t11 0" fill="none" stroke="#15131A" strokeWidth="5" strokeLinecap="round" />}
    </svg>
  );
}

export const MOOD_LINE: Record<Mood, string> = {
  great: "Strong week. Keep it going.",
  ok: "Still time to earn a bonus.",
  oops: "Tough week. Fresh start Monday.",
};
