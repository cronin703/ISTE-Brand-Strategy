import { withBase } from "@/lib/basePath";

// Hero background photo. Replace public/hero/classroom.webp to change it (about 1200px wide is plenty: it is blurred).
const PHOTO = "/hero/classroom.webp";

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
