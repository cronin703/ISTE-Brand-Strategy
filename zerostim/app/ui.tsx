"use client";

import { useOptimistic } from "react";
import { useFormStatus } from "react-dom";
import { changeTally, kidBonus, kidToggleChore, toggleChore } from "./actions";

/** Submit button that dims while its form is saving. */
export function Pending({ className, children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();
  return (
    <button {...rest} className={className} aria-busy={pending || undefined} disabled={rest.disabled || pending}>
      {children}
    </button>
  );
}

function Hidden({ fields }: { fields: Record<string, string | number> }) {
  return (
    <>
      {Object.entries(fields).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
    </>
  );
}

function Check() {
  return (
    <svg className="check" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export type ChoreState = "none" | "pending" | "done";

function Clock() {
  return (
    <svg className="check" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M12 8v4.5l3 2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

const STATE_WORDS: Record<ChoreState, string> = { none: "not done", pending: "waiting for Mom or Dad", done: "done" };

/**
 * One day tile in the chore grid. Flips instantly, then saves.
 * Mom: empty -> done, waiting -> done (approve), done -> empty.
 * Kid: empty -> waiting, waiting -> empty; done is locked.
 */
export function DayToggle(p: {
  state: ChoreState;
  as: "mom" | "kid";
  label: string;
  short: string;
  className: string;
  fields: Record<string, string>;
}) {
  const [state, setState] = useOptimistic(p.state);
  const next = (s: ChoreState): ChoreState =>
    p.as === "mom" ? (s === "done" ? "none" : "done") : s === "none" ? "pending" : s === "pending" ? "none" : "done";
  const locked = p.as === "kid" && state === "done";
  return (
    <form
      action={async (fd) => {
        setState(next(state));
        await (p.as === "mom" ? toggleChore(fd) : kidToggleChore(fd));
      }}
    >
      <Hidden fields={p.fields} />
      <button
        className={`${p.className} is-${state}`}
        aria-pressed={state === "done" ? true : state === "pending" ? "mixed" : false}
        aria-label={`${p.label}: ${STATE_WORDS[state]}${p.as === "mom" && state === "pending" ? ". Tap to approve" : ""}`}
        disabled={locked}
      >
        {state === "done" ? <Check /> : state === "pending" ? <Clock /> : p.short}
      </button>
    </form>
  );
}

/** Read-only day tile. */
export function DayStatic({ state, label, short, className }: { state: ChoreState; label: string; short: string; className: string }) {
  return (
    <span className={`${className} is-${state}`} role="img" aria-label={`${label}: ${STATE_WORDS[state]}`}>
      {state === "done" ? <Check /> : state === "pending" ? <Clock /> : short}
    </span>
  );
}

/** − count + stepper for a deduction or bonus. Count updates instantly, then saves. */
export function Stepper(p: { count: number; itemLabel: string; fields: Record<string, string> }) {
  const [count, setCount] = useOptimistic(p.count);
  const act = (delta: number) => async (fd: FormData) => {
    setCount(Math.max(0, count + delta));
    await changeTally(fd);
  };
  return (
    <div className="stepper">
      <form action={act(-1)}>
        <Hidden fields={{ ...p.fields, delta: -1 }} />
        <button className="step" disabled={count === 0} aria-label={`Remove one: ${p.itemLabel}`}>−</button>
      </form>
      <span className="count" aria-live="polite" aria-label={`${count} logged`}>
        <span key={count} className="tick">{count}</span>
      </span>
      <form action={act(1)}>
        <Hidden fields={{ ...p.fields, delta: 1 }} />
        <button className="step step-add" aria-label={`Add one: ${p.itemLabel}`}>+</button>
      </form>
    </div>
  );
}

/** Dashboard chore row: the whole row is the button. Kid taps wait for Mom or Dad; parent taps approve. */
export function ChoreRow(p: { state: ChoreState; as: "mom" | "kid"; label: string; fields: Record<string, string>; disabled?: boolean }) {
  const [state, setState] = useOptimistic(p.state);
  const next = (s: ChoreState): ChoreState =>
    p.as === "mom" ? (s === "done" ? "none" : "done") : s === "none" ? "pending" : s === "pending" ? "none" : "done";
  const locked = p.disabled || (p.as === "kid" && state === "done");
  return (
    <li className={`is-${state}`}>
      <form
        action={async (fd) => {
          setState(next(state));
          await (p.as === "mom" ? toggleChore(fd) : kidToggleChore(fd));
        }}
      >
        <Hidden fields={p.fields} />
        <button
          className="dash-row"
          aria-pressed={state === "done" ? true : state === "pending" ? "mixed" : false}
          aria-label={`${p.label}: ${STATE_WORDS[state]}${p.as === "mom" && state === "pending" ? ". Tap to approve" : ""}`}
          disabled={locked}
        >
          <span className="dash-icon" aria-hidden="true">{state === "done" ? "✓" : state === "pending" ? <Clock /> : ""}</span>
          <span className="dash-row-label">{p.label}</span>
          {state === "pending" && <span className="dash-row-tag">Waiting</span>}
        </button>
      </form>
    </li>
  );
}

/** Dashboard bonus row: kids mark it (waits for approval); a parent's tap counts it right away. */
export function BonusRow(p: {
  as: "mom" | "kid";
  label: string;
  amount: string;
  approved: number;
  waiting: number;
  fields: Record<string, string>;
  disabled?: boolean;
}) {
  const [counts, setCounts] = useOptimistic({ approved: p.approved, waiting: p.waiting });
  return (
    <li className="bonus-row">
      <span className="bonus-text">
        <span>{p.label}</span>
        <span className="amt plus">+{p.amount}</span>
        {(counts.approved > 0 || counts.waiting > 0) && (
          <span className="muted small">
            {counts.approved > 0 && `${counts.approved} counted`}
            {counts.approved > 0 && counts.waiting > 0 && ", "}
            {counts.waiting > 0 && `${counts.waiting} waiting`}
          </span>
        )}
      </span>
      <form
        action={async (fd) => {
          setCounts(p.as === "mom" ? { ...counts, approved: counts.approved + 1 } : { ...counts, waiting: counts.waiting + 1 });
          await (p.as === "mom" ? changeTally(fd) : kidBonus(fd));
        }}
      >
        <Hidden fields={{ ...p.fields, delta: 1 }} />
        <button className="btn btn-small" disabled={p.disabled} aria-label={`${p.as === "mom" ? "Add" : "I did"}: ${p.label}`}>
          {p.as === "mom" ? "+ Add" : "I did this"}
        </button>
      </form>
    </li>
  );
}
