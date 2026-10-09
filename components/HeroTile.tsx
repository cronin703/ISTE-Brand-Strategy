"use client";

import { useRef } from "react";

/** Hero logo tile: brand glow and grain, tilting gently toward the pointer (mouse only, not with reduced motion). */
export function HeroTile({ children, className = "", style }: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${((x - 0.5) * 6).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${((0.5 - y) * 6).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    for (const p of ["--rx", "--ry", "--gx", "--gy"]) el.style.removeProperty(p);
  }

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={`hero-tile ${className}`} style={style}>
      {children}
    </div>
  );
}
