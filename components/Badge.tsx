import type { Decision, Status } from "@/lib/types";

const base = "inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold";

export function StatusBadge({ status }: { status: Status }) {
  return status === "Active" ? (
    <span className={`${base} bg-success-bg text-success`}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      Active
    </span>
  ) : (
    <span className={`${base} bg-danger-bg text-danger`}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      Retired, do not use
    </span>
  );
}

const decisionHint: Record<Decision, string> = {
  Keep: "Published as is once a master file is confirmed",
  Refresh: "Being redrawn before it is published",
  Merge: "Being folded into another mark",
  Rename: "Moving to a new name",
  Retire: "Retired by the audit",
};

export function DecisionBadge({ decision }: { decision: Decision }) {
  return (
    <span className={`${base} border border-border text-text`} title={decisionHint[decision]}>
      Audit: {decision}
    </span>
  );
}

export function NeutralBadge({ children }: { children: React.ReactNode }) {
  return <span className={`${base} bg-tile text-text`}>{children}</span>;
}

export { decisionHint };
