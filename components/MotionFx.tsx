"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Cards marked data-reveal rise in as they scroll into view, once. Cards entering together
 * stagger in reading order. Content is visible without JS (styles key off html.js).
 */
export function MotionFx() {
  const pathname = usePathname();
  useEffect(() => {
    const items = [...document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)")];
    if (!items.length) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const entering = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target as HTMLElement)
          .sort((a, b) => {
            const ra = a.getBoundingClientRect();
            const rb = b.getBoundingClientRect();
            return Math.abs(ra.top - rb.top) > 8 ? ra.top - rb.top : ra.left - rb.left;
          });
        entering.forEach((el, i) => {
          el.style.transitionDelay = `${Math.min(i, 6) * 70}ms`;
          el.classList.add("is-in");
          io.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
