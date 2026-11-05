"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/parent", label: "Week", icon: "M4 6h16M4 12h16M4 18h10" },
  { href: "/parent/history", label: "History", icon: "M5 19V11M12 19V5M19 19v-6" },
  { href: "/parent/settings", label: "Settings", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4" },
  { href: "/parent/share", label: "Share", icon: "M12 3v12M7 8l5-5 5 5M5 14v5h14v-5" },
];

/** Bottom tab bar for the parent screens (thumb-reachable on phones). */
export function ParentTabs() {
  const path = usePathname();
  return (
    <nav className="bottom-tabs" aria-label="Parent">
      {TABS.map((t) => {
        const active = t.href === "/parent" ? path === "/parent" : path.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d={t.icon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
