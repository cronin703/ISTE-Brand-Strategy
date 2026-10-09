"use client";

import { AnimatePresence, LayoutGroup, LazyMotion, MotionConfig, m as motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { LOGO_TYPES } from "@/lib/logoTypes";
import type { LogoType, Mark } from "@/lib/types";
import { LogoCard } from "./LogoCard";

type StatusFilter = "active" | "all" | "retired";
type FileFilter = "any" | "has" | "missing";

const loadFeatures = () => import("@/lib/motionFeatures").then((mod) => mod.default);
const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const EASE_IN = [0.7, 0, 0.84, 0] as const;

export function LogoLibrary({ marks }: { marks: Mark[] }) {
  const [type, setType] = useState<LogoType | "all">("all");
  const [status, setStatus] = useState<StatusFilter>("active");
  const [file, setFile] = useState<FileFilter>("any");
  const [query, setQuery] = useState("");
  const firstPaint = useRef(true);

  // Read filters from the URL once, then keep the URL in sync so views can be shared.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get("type");
    const match = LOGO_TYPES.find((x) => x.slug === t);
    if (match) setType(match.type);
    const s = p.get("status");
    if (s === "all" || s === "retired") setStatus(s);
    const f = p.get("file");
    if (f === "has" || f === "missing") setFile(f);
    const q = p.get("q");
    if (q) setQuery(q);
    const id = window.setTimeout(() => (firstPaint.current = false), 500);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const p = new URLSearchParams();
    if (type !== "all") p.set("type", LOGO_TYPES.find((x) => x.type === type)!.slug);
    if (status !== "active") p.set("status", status);
    if (file !== "any") p.set("file", file);
    if (query) p.set("q", query);
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}#library` : window.location.pathname + window.location.hash);
  }, [type, status, file, query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return marks.filter(
      (m) =>
        (type === "all" || m.logoType === type) &&
        (status === "all" || (status === "active" ? m.status === "Active" : m.status === "Retired")) &&
        (file === "any" || (file === "has" ? m.hasLogo : !m.hasLogo)) &&
        (!q || [m.name, ...m.aliases].some((s) => s.toLowerCase().includes(q))),
    );
  }, [marks, type, status, file, query]);

  const groups = useMemo(
    () =>
      LOGO_TYPES.map((t) => ({ info: t, items: filtered.filter((m) => m.logoType === t.type) })).filter(
        (g) => g.items.length > 0,
      ),
    [filtered],
  );

  const typeCounts = useMemo(() => {
    const scope = marks.filter(
      (m) => status === "all" || (status === "active" ? m.status === "Active" : m.status === "Retired"),
    );
    return Object.fromEntries(LOGO_TYPES.map((t) => [t.type, scope.filter((m) => m.logoType === t.type).length]));
  }, [marks, status]);

  const reset = () => {
    setType("all");
    setStatus("active");
    setFile("any");
    setQuery("");
  };

  let cardIndex = 0;

  return (
    <LazyMotion features={loadFeatures} strict>
    <MotionConfig reducedMotion="user">
      <div className="glass glass-strong z-20 -mx-4 mb-6 border-b lg:sticky lg:top-16 border-border px-4 py-3 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
        <div className="flex flex-col gap-3">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0" role="group" aria-label="Filter by logo type">
            <Chip pressed={type === "all"} onClick={() => setType("all")}>
              All types
            </Chip>
            {LOGO_TYPES.map((t) => (
              <Chip
                key={t.slug}
                pressed={type === t.type}
                onClick={() => setType(type === t.type ? "all" : t.type)}
                disabled={typeCounts[t.type] === 0}
              >
                {t.plural}
                <span className="ml-1.5 tabular-nums opacity-70">{typeCounts[t.type]}</span>
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <label className="relative flex-1 basis-56 sm:max-w-xs">
              <span className="sr-only">Filter logos by name</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter by name"
                className="h-9 w-full rounded-md border border-border-strong bg-bg px-3 text-sm text-heading placeholder:text-muted"
              />
            </label>
            <Select
              label="Status"
              value={status}
              onChange={(v) => setStatus(v as StatusFilter)}
              options={[
                ["active", "Active"],
                ["all", "Active and retired"],
                ["retired", "Retired only"],
              ]}
            />
            <Select
              label="File"
              value={file}
              onChange={(v) => setFile(v as FileFilter)}
              options={[
                ["any", "Any"],
                ["has", "Has a file"],
                ["missing", "Logo needed"],
              ]}
            />
            <p className="text-sm text-muted sm:ml-auto" aria-live="polite">
              <span className="font-semibold text-heading tabular-nums">{filtered.length}</span> of {marks.length} marks
            </p>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-strong px-6 py-16 text-center">
          <p className="text-lg font-semibold text-heading">No marks match these filters.</p>
          <p className="mt-1 text-muted">Retired marks are hidden unless you choose them under Status.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-5 h-9 rounded-md bg-action px-4 text-sm font-semibold text-on-action hover:bg-action-hover"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <LayoutGroup>
          <AnimatePresence initial={false} mode="popLayout">
            {groups.map(({ info, items }) => (
              <motion.section
                key={info.slug}
                layout="position"
                aria-labelledby={`group-${info.slug}`}
                className="mb-12 first:mt-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15, ease: EASE_OUT } }}
                exit={{ opacity: 0, transition: { duration: 0.15, ease: EASE_IN } }}
                transition={{ layout: { duration: 0.2, ease: EASE_OUT } }}
              >
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h3 id={`group-${info.slug}`} className="text-xl font-semibold text-heading">
                    {info.plural} <span className="text-base font-normal text-muted tabular-nums">{items.length}</span>
                  </h3>
                  <a href={`#type-${info.slug}`} className="link text-sm">
                    Rules for {info.plural.toLowerCase()}
                  </a>
                </div>
                <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  <AnimatePresence initial={false} mode="popLayout">
                    {items.map((m) => {
                      const i = cardIndex++;
                      return (
                        <motion.li
                          key={m.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1, transition: { duration: 0.15, ease: EASE_OUT } }}
                          exit={{ opacity: 0, transition: { duration: 0.15, ease: EASE_IN } }}
                          transition={{ layout: { duration: 0.2, ease: EASE_OUT } }}
                        >
                          <LogoCard mark={m} priority={i < 4} reveal={firstPaint.current} />
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              </motion.section>
            ))}
          </AnimatePresence>
        </LayoutGroup>
      )}
    </MotionConfig>
    </LazyMotion>
  );
}

function Chip({
  pressed,
  onClick,
  children,
  disabled,
}: {
  pressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-full border px-3 text-sm font-medium transition-colors duration-[var(--motion-150)] disabled:cursor-not-allowed disabled:opacity-50 ${
        pressed
          ? "border-transparent bg-heading text-bg"
          : "border-border-strong text-text hover:border-heading hover:text-heading"
      }`}
    >
      {children}
    </button>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border border-border-strong bg-bg px-2 text-sm font-medium text-heading"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
