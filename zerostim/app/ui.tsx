"use client";

import { useOptimistic } from "react";
import { useFormStatus } from "react-dom";
import { changeTally, toggleChore } from "./actions";

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

/** One day tile in the chore grid. Flips instantly, then saves. */
export function DayToggle(p: {
  done: boolean;
  label: string;
  short: string;
  className: string;
  fields: Record<string, string>;
}) {
  const [done, setDone] = useOptimistic(p.done);
  return (
    <form
      action={async (fd) => {
        setDone(!done);
        await toggleChore(fd);
      }}
    >
      <Hidden fields={p.fields} />
      <button className={p.className} aria-pressed={done} aria-label={p.label}>
        {done ? <Check /> : p.short}
      </button>
    </form>
  );
}

/** Read-only day tile for the kid view. */
export function DayStatic({ done, label, short, className }: { done: boolean; label: string; short: string; className: string }) {
  return (
    <span className={`${className}${done ? " done" : ""}`} role="img" aria-label={label}>
      {done ? <Check /> : short}
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
