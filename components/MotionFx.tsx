"use client";

import { useEffect } from "react";

/**
 * Cards marked data-reveal rise in as they scroll into view, once. Cards entering together
 * stagger in reading order. Content is visible without JS (styles key off html.js).
 * A MutationObserver picks up cards added later (route changes, re-mounted lists), so none stay hidden.
 */
export function MotionFx() {
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    const seen = new WeakSet<Element>();
    function scan(root: ParentNode) {
      root.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (reduce) el.classList.add("is-in");
        else io.observe(el);
      });
    }
    scan(document);
    let queued = false;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        scan(document);
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);
  return null;
}
