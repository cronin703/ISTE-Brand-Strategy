import { useId } from "react";
import type { Mood } from "@/lib/penny";

// "Penny" — ZeroStim's coin mascot. A placeholder design until we create the
// real character together; moods are driven by lib/penny.ts.

export type { Mood };

export function Mascot({ mood = "great", size = 120, className }: { mood?: Mood; size?: number; className?: string }) {
  const gid = `penny-${useId().replace(/:/g, "")}`;
  const ink = "#15131A";
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} data-mood={mood} aria-hidden="true">
      <defs>
        <radialGradient id={gid} cx="38%" cy="30%" r="75%">
          <stop offset="0" stopColor="#FFE680" />
          <stop offset="0.55" stopColor="#FFC21A" />
          <stop offset="1" stopColor="#F29A00" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="62" r="54" fill="#fff" />
      <circle cx="60" cy="60" r="46" fill={`url(#${gid})`} stroke={ink} strokeWidth="7" />
      <circle cx="60" cy="60" r="36" fill="none" stroke="#E08A00" strokeWidth="3" strokeDasharray="2 6" strokeLinecap="round" />
      <path d="M33 44c4-9 12-15 21-17" fill="none" stroke="#FFF6C9" strokeWidth="6" strokeLinecap="round" />

      {/* eyes */}
      {mood === "great" ? (
        <g fill="none" stroke={ink} strokeWidth="6" strokeLinecap="round">
          <path d="M40 58q7-9 14 0" />
          <path d="M66 58q7-9 14 0" />
        </g>
      ) : (
        <g>
          <ellipse cx="47" cy="57" rx="7" ry={mood === "mad" ? 6 : 8.5} fill={ink} />
          <ellipse cx="73" cy="57" rx="7" ry={mood === "mad" ? 6 : 8.5} fill={ink} />
          <circle cx="49.5" cy="54" r="2.5" fill="#fff" />
          <circle cx="75.5" cy="54" r="2.5" fill="#fff" />
        </g>
      )}

      {/* brows: angry slant when mad, worried tilt when sad */}
      {mood === "mad" && (
        <g stroke={ink} strokeWidth="5.5" strokeLinecap="round">
          <path d="M37 42l16 7" />
          <path d="M83 42l-16 7" />
        </g>
      )}
      {mood === "sad" && (
        <g stroke={ink} strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M39 47l13-5" />
          <path d="M81 47l-13-5" />
        </g>
      )}

      {/* cheeks */}
      {mood !== "mad" && (
        <g fill="#FF6FA8" opacity="0.8">
          <circle cx="36" cy="71" r="5" />
          <circle cx="84" cy="71" r="5" />
        </g>
      )}

      {/* mouth */}
      {mood === "great" && <path d="M46 70q14 16 28 0z" fill={ink} stroke={ink} strokeWidth="4" strokeLinejoin="round" />}
      {mood === "ok" && <path d="M49 74q11 7 22 0" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" />}
      {mood === "mad" && <path d="M48 80q12-9 24 0" fill="none" stroke={ink} strokeWidth="5.5" strokeLinecap="round" />}
      {mood === "sad" && (
        <>
          <path d="M49 80q11-7 22 0" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" />
          <path d="M84 62q4 7 0 10q-4-3 0-10z" fill="#5BC0FF" stroke={ink} strokeWidth="2" />
        </>
      )}
    </svg>
  );
}
