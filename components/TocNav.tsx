"use client";

import { useEffect, useRef, useState } from "react";

/** "On this page": smooth-scrolls to a section and slides a marker to the one being read. */
export function TocNav({ toc }: { toc: { id: string; label: string }[] }) {
  const [active, setActive] = useState<string | undefined>(toc[0]?.id);
  const listRef = useRef<HTMLUListElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);

  // Scroll-spy: the last heading above the upper third of the viewport is the current one.
  useEffect(() => {
    const heads = toc.map((t) => document.getElementById(t.id)).filter((h): h is HTMLElement => !!h);
    function update() {
      const line = window.innerHeight * 0.33;
      let current: string | undefined = heads[0]?.id;
      for (const h of heads) if (h.getBoundingClientRect().top <= line) current = h.id;
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = heads.at(-1)?.id;
      setActive(current);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [toc]);

  useEffect(() => {
    const list = listRef.current;
    const mark = markRef.current;
    const link = list?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!list || !mark || !link) return;
    mark.style.setProperty("--y", `${link.offsetTop}px`);
    mark.style.height = `${link.offsetHeight}px`;
    mark.style.opacity = "1";
    requestAnimationFrame(() => mark.classList.add("toc-mark-ready"));
  }, [active]);

  function go(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    setActive(id);
  }

  return (
    <nav aria-label="On this page" className="sticky top-28 hidden h-fit w-52 shrink-0 xl:block">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">On this page</p>
      <ul ref={listRef} className="relative space-y-2 border-l border-border text-sm">
        <span ref={markRef} aria-hidden className="toc-mark" />
        {toc.map((t) => (
          <li key={t.id}>
            <a
              href={`#${t.id}`}
              data-id={t.id}
              aria-current={active === t.id ? "location" : undefined}
              onClick={(e) => go(e, t.id)}
              className={`-ml-px block border-l border-transparent pl-4 transition-colors duration-[var(--motion-150)] hover:border-border-strong hover:text-heading ${
                active === t.id ? "font-medium text-heading" : "text-muted"
              }`}
            >
              {t.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
