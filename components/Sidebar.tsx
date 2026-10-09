"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NAV } from "@/lib/nav";
import { ChevronIcon } from "./icons";

function isCurrent(pathname: string, href: string) {
  return pathname === href;
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NAV.map((s) => [s.href, pathname.startsWith(s.href)])),
  );
  // Expand the section you navigate into; leave the others as the reader set them.
  useEffect(() => {
    const current = NAV.find((s) => pathname.startsWith(s.href));
    if (current) setOpen((o) => (o[current.href] ? o : { ...o, [current.href]: true }));
  }, [pathname]);

  // One highlight pill that slides to the current item (replaces the per-link highlight once JS runs).
  const navRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const nav = navRef.current;
    const pill = pillRef.current;
    if (!nav || !pill) return;
    nav.dataset.pill = "";
    let ready = false;
    let rot = Number(pill.dataset.rot ?? 0);
    function place() {
      const link = nav!.querySelector<HTMLElement>('[aria-current="page"]');
      const visible = link && link.offsetParent && !link.closest("[inert]");
      if (!visible) {
        pill!.style.opacity = "0";
        return;
      }
      const n = nav!.getBoundingClientRect();
      const r = link.getBoundingClientRect();
      const y = r.top - n.top;
      // Roll the "+" a quarter turn toward the direction of travel, only when the current page changes
      // (not when sections open or close and shift the pill).
      const href = link.getAttribute("href") ?? "";
      if (pill!.dataset.href && pill!.dataset.href !== href) rot += y > Number(pill!.dataset.y) ? 90 : -90;
      pill!.dataset.href = href;
      pill!.dataset.y = String(y);
      pill!.dataset.rot = String(rot);
      pill!.style.setProperty("--rot", `${rot}deg`);
      pill!.style.setProperty("--y", `${y}px`);
      pill!.style.setProperty("--x", `${r.left - n.left}px`);
      pill!.style.width = `${r.width}px`;
      pill!.style.height = `${r.height}px`;
      pill!.style.opacity = "1";
      if (!ready) {
        ready = true;
        requestAnimationFrame(() => pill!.classList.add("nav-pill-ready"));
      }
    }
    place();
    const ro = new ResizeObserver(place);
    ro.observe(nav.firstElementChild as Element);
    return () => ro.disconnect();
  }, [pathname, open]);

  return (
    <nav ref={navRef} aria-label="Main" className="relative px-3 py-6 text-[15px]">
      <span ref={pillRef} aria-hidden className="nav-pill" />
      <ul className="relative space-y-1">
        <li>
          <NavLink href="/" current={pathname === "/"} onNavigate={onNavigate}>
            Home
          </NavLink>
        </li>
        {NAV.map((section) => {
          const expanded = open[section.href];
          const id = `nav-${section.href.slice(1)}`;
          const inSection = pathname.startsWith(section.href);
          return (
            <li key={section.href} className="pt-1">
              {section.pages.length === 0 ? (
                <NavLink href={section.href} current={isCurrent(pathname, section.href)} onNavigate={onNavigate} strong>
                  {section.title}
                </NavLink>
              ) : (
                <>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={id}
                    onClick={() => setOpen((o) => ({ ...o, [section.href]: !o[section.href] }))}
                    className={`nav-liquid flex w-full items-center justify-between rounded-md px-3 py-2 text-left font-semibold ${
                      inSection ? "text-heading" : "text-text"
                    }`}
                  >
                    {section.title}
                    <ChevronIcon
                      width={16}
                      height={16}
                      className={`transition-transform duration-[var(--motion-150)] ease-[var(--ease-out)] ${
                        expanded ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                  <div className="nav-group" data-open={expanded || undefined} inert={!expanded}>
                  <ul id={id} className="space-y-0.5 overflow-hidden pt-0.5">
                    {section.href !== section.pages[0].href && (
                      <li>
                        <NavLink href={section.href} current={isCurrent(pathname, section.href)} onNavigate={onNavigate} nested>
                          Overview
                        </NavLink>
                      </li>
                    )}
                    {section.pages.map((p) => (
                      <li key={p.href}>
                        <NavLink
                          href={p.href}
                          current={
                            isCurrent(pathname, p.href) ||
                            (p.href === "/logos" && pathname.startsWith("/logos/") && pathname !== "/logos/archive")
                          }
                          onNavigate={onNavigate}
                          nested
                        >
                          {p.title}
                          {p.placeholder && <span className="ml-2 text-xs font-normal text-muted">Soon</span>}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function NavLink({
  href,
  current,
  children,
  onNavigate,
  nested,
  strong,
}: {
  href: string;
  current: boolean;
  children: React.ReactNode;
  onNavigate?: () => void;
  nested?: boolean;
  strong?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={current ? "page" : undefined}
      className={`nav-liquid relative flex items-center rounded-md py-1.5 pr-3 ${nested ? "pl-6" : "pl-3"} ${
        strong ? "py-2 font-semibold" : ""
      } ${current ? "bg-tile font-semibold text-heading" : "text-text"}`}
    >
      {current && (
        <span aria-hidden data-plus className="nav-bar" />
      )}
      {children}
    </Link>
  );
}
