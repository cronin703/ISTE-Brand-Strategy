"use client";

import { useEffect, useRef } from "react";

/** Fades and rises 8px once as it enters the viewport. Never re-triggers. */
export function Reveal({ children, className = "", as: Tag = "section", id }: {
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div";
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Already on screen at load: show without animating.
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref as never} id={id} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}
