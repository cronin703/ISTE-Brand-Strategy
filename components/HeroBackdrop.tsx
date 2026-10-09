import { withBase } from "@/lib/basePath";

// Placeholder photo (AI-generated in Canva). Swap public/hero/classroom.jpg for an official ISTE+ASCD photo.
const PHOTO = "/hero/classroom.jpg";

/**
 * Blurred classroom photo behind the hero. It drifts and deepens as the page scrolls, driven by
 * CSS scroll-driven animation (no scroll listeners); browsers without support show it still.
 */
export function HeroBackdrop() {
  return (
    <div aria-hidden className="hero-backdrop">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={withBase(PHOTO)} alt="" decoding="async" fetchPriority="low" className="hero-backdrop-img" />
      <div className="hero-backdrop-wash" />
    </div>
  );
}
