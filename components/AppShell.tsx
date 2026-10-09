"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BrandMark } from "./BrandMark";
import { CloseIcon, MenuIcon, SearchIcon } from "./icons";
import dynamic from "next/dynamic";
import type { SearchItem } from "./SearchPalette";
import { SidebarNav } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { MotionFx } from "./MotionFx";
import { PointerFx } from "./PointerFx";
import { useFocusTrap } from "./useFocusTrap";

// The palette (and Fuse) load on first open.
const SearchPalette = dynamic(() => import("./SearchPalette").then((m) => m.SearchPalette), { ssr: false });

export function AppShell({ searchItems, children }: { searchItems: SearchItem[]; children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawer, setDrawer] = useState<"closed" | "open" | "closing">("closed");
  const [isMac, setIsMac] = useState(true);
  const drawerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closeDrawer = useCallback(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return setDrawer("closed");
    setDrawer("closing");
    window.setTimeout(() => setDrawer("closed"), 150);
  }, []);

  // Header turns to glass once the page scrolls.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const onScroll = () => el.toggleAttribute("data-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      } else if (e.key === "/" && !/INPUT|TEXTAREA/.test((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    // Warm the palette chunk once the page is idle so the first open is instant.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 2000));
    idle(() => void import("./SearchPalette"));
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setDrawer("closed");
  }, [pathname]);

  useFocusTrap(drawerRef, drawer === "open", closeDrawer);

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded-md bg-action px-4 py-2 font-semibold text-on-action focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
      >
        Skip to content
      </a>
      <header ref={headerRef} className="header-glass sticky top-0 z-40 h-16 border-b border-border">
        <div className="flex h-full items-center gap-2 px-3 sm:px-4">
          <button
            type="button"
            className="grid size-10 place-items-center rounded-md text-heading hover:bg-tile lg:hidden"
            aria-label="Open navigation"
            aria-expanded={drawer === "open"}
            onClick={() => setDrawer("open")}
          >
            <MenuIcon />
          </button>
          <Link href="/" className="flex items-center gap-3 rounded-md pr-2" aria-label="ISTE Brand Hub home">
            <BrandMark className="h-8 w-auto" title="ISTE+ASCD" />
            <span className="hidden border-l border-border pl-3 text-[15px] font-semibold text-heading sm:block">
              Brand Hub
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-keyshortcuts="Meta+K Control+K"
              className="flex h-10 items-center gap-2 rounded-md border border-border px-3 text-sm text-muted hover:border-border-strong md:w-64"
            >
              <SearchIcon width={18} height={18} />
              <span className="hidden md:inline">Search</span>
              <span className="sr-only md:hidden">Search</span>
              <kbd className="ml-auto hidden rounded border border-border px-1.5 text-xs md:block" aria-hidden>
                {isMac ? "⌘" : "Ctrl"} K
              </kbd>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1440px]">
        <div className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-[264px] shrink-0 overflow-y-auto border-r border-border lg:block">
          <SidebarNav />
        </div>
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 outline-none">
          {children}
        </main>
      </div>

      {drawer !== "closed" && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="overlay-in absolute inset-0 bg-[var(--overlay)]" onClick={closeDrawer} aria-hidden />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className={`${drawer === "open" ? "drawer-in" : "drawer-out"} absolute inset-y-0 left-0 w-[300px] max-w-[85vw] overflow-y-auto bg-bg shadow-2xl`}
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <span className="font-semibold text-heading">Brand Hub</span>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close navigation"
                className="grid size-10 place-items-center rounded-md text-heading hover:bg-tile"
              >
                <CloseIcon />
              </button>
            </div>
            <SidebarNav onNavigate={closeDrawer} />
          </div>
        </div>
      )}

      <PointerFx />
      <MotionFx />
      {searchOpen && <SearchPalette items={searchItems} open={searchOpen} onClose={closeSearch} />}
    </>
  );
}
