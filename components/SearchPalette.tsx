"use client";

import Fuse from "fuse.js";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { SearchIcon } from "./icons";
import { useFocusTrap } from "./useFocusTrap";

export interface SearchItem {
  title: string;
  href: string;
  kind: "Page" | "Logo";
  detail: string;
  keywords: string[];
  retired?: boolean;
}

const SUGGESTED = ["/logos/iste-iste-ascd", "/logos", "/foundations/color", "/get-started", "/content/naming"];

export function SearchPalette({ items, open, onClose }: { items: SearchItem[]; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: [
          { name: "title", weight: 3 },
          { name: "keywords", weight: 2 },
          { name: "detail", weight: 1 },
        ],
        threshold: 0.38,
        ignoreLocation: true,
      }),
    [items],
  );

  const results = useMemo(() => {
    if (!query.trim()) {
      return SUGGESTED.map((h) => items.find((i) => i.href === h)).filter(Boolean) as SearchItem[];
    }
    // Active marks rank above retired ones with a similar score.
    return fuse
      .search(query.trim(), { limit: 30 })
      .sort((a, b) => (a.score ?? 0) + (a.item.retired ? 0.15 : 0) - ((b.score ?? 0) + (b.item.retired ? 0.15 : 0)))
      .slice(0, 12)
      .map((r) => r.item);
  }, [query, fuse, items]);

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    if (open) {
      setQuery("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useFocusTrap(panelRef, open, onClose);

  if (!open) return null;

  function go(item: SearchItem | undefined) {
    if (!item) return;
    onClose();
    router.push(item.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active]);
    }
  }

  const optionId = (i: number) => `${listId}-opt-${i}`;

  return (
    <div className="fixed inset-0 z-50">
      <div className="overlay-in absolute inset-0 bg-[var(--overlay)]" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search the brand hub"
        className="panel-in relative mx-auto mt-[10vh] w-[calc(100%-2rem)] max-w-[640px] overflow-hidden rounded-xl border border-border bg-bg shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b-2 border-border px-4 focus-within:border-indicator">
          <SearchIcon className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results.length ? optionId(active) : undefined}
            aria-autocomplete="list"
            aria-label="Search pages and logos"
            placeholder="Search logos and pages"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            className="h-14 w-full bg-transparent text-base text-heading outline-none placeholder:text-muted"
          />
          <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-xs text-muted sm:block">Esc</kbd>
        </div>
        <p className="px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-muted" aria-hidden>
          {query.trim() ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Suggested"}
        </p>
        <ul id={listId} role="listbox" aria-label="Results" className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
          {results.map((r, i) => (
            <li
              key={r.href}
              id={optionId(i)}
              role="option"
              aria-selected={i === active}
              onMouseMove={() => setActive(i)}
              onClick={() => go(r)}
              className={`flex cursor-pointer items-center justify-between gap-4 rounded-md px-3 py-2.5 ${
                i === active ? "bg-tile" : ""
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate font-medium text-heading">{r.title}</span>
                <span className="block truncate text-sm text-muted">{r.detail}</span>
              </span>
              <span
                className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                  r.retired ? "bg-danger-bg text-danger" : "border border-border text-muted"
                }`}
              >
                {r.retired ? "Retired" : r.kind}
              </span>
            </li>
          ))}
        </ul>
        {query.trim() && results.length === 0 && (
          <div className="px-4 pb-6 text-sm text-muted">
            <p className="font-medium text-heading">No matches for “{query}”.</p>
            <p className="mt-1">
              Try a program name such as “Standards” or “ISTELive”, or{" "}
              <a className="link" href="/get-started#request">
                request a logo
              </a>
              .
            </p>
          </div>
        )}
        <div className="flex gap-4 border-t border-border px-4 py-2.5 text-xs text-muted" aria-hidden>
          <span>↑ ↓ to move</span>
          <span>Enter to open</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}
