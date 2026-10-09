"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

  return (
    <nav aria-label="Main" className="px-3 py-6 text-[15px]">
      <ul className="space-y-1">
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
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left font-semibold hover:bg-tile ${
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
                  <ul id={id} hidden={!expanded} className="mt-0.5 space-y-0.5">
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
      className={`relative flex items-center rounded-md py-1.5 pr-3 hover:bg-tile ${nested ? "pl-6" : "pl-3"} ${
        strong ? "py-2 font-semibold" : ""
      } ${current ? "bg-tile font-semibold text-heading" : "text-text"}`}
    >
      {current && (
        <span aria-hidden className="indicator-in absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-indicator" />
      )}
      {children}
    </Link>
  );
}
