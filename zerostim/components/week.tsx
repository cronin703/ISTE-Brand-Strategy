import { money, type Kid } from "@/lib/family";
import type { Rules } from "@/lib/settings";
import { DAY_LONG, DAY_SHORT, today, weekDays } from "@/lib/dates";
import type { WeekSummary } from "@/lib/calc";
import { DayStatic, DayToggle, Pending, Stepper, type ChoreState } from "@/app/ui";
import { approveAll, approveEntry, kidBonus, rejectEntry } from "@/app/actions";
import { Mascot } from "./mascot";
import type { WeekView } from "@/lib/load";

/** The loud part of every kid screen: name, payout, mascot. */
export function PayoutPoster(p: {
  kid: Kid;
  s: WeekSummary;
  paid: boolean;
  heading: string;
  penny: WeekView["penny"];
  meta?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const { s, penny } = p;
  return (
    <section className="poster" aria-labelledby="payout-h">
      <div className="poster-top">
        <div>
          <h1 className="display poster-name">{p.heading}</h1>
          {(penny.streak ?? 0) > 0 && (
            <span className="streak-chip" aria-label={`${penny.streak}-day streak`}>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-6 1-9.5z" fill="currentColor" /></svg>
              {penny.streak}-day streak
            </span>
          )}
        </div>
        <Mascot mood={penny.mood} size={104} className="mascot" />
      </div>
      <p className={`penny-says penny-${penny.mood}`}>
        <span className="sr-only">Penny says: </span>
        {penny.line}
      </p>
      <div>
        <h2 id="payout-h" className="poster-label">
          Payout this week {p.paid && <span className="paid-chip">Paid</span>}
        </h2>
        <p key={s.payoutCents} className="display poster-amount" aria-live="polite">{money(s.payoutCents)}</p>
      </div>
      <dl className="math math-4">
        <div><dt>Start</dt><dd>{money(s.startCents)}</dd></div>
        <div><dt>Missed chores</dt><dd>{s.missedCents ? `-${money(s.missedCents)}` : "$0.00"}</dd></div>
        <div><dt>Deductions</dt><dd>{s.deductionCents ? `-${money(s.deductionCents)}` : "$0.00"}</dd></div>
        <div><dt>Bonuses</dt><dd>+{money(s.bonusCents)}</dd></div>
      </dl>
      <p className="poster-note">
        {s.days.filter((d) => d.active).length < 7
          ? `Short week: ${s.days.filter((d) => d.active).length} days at ${money(s.dailyCents)} a day.`
          : `${money(s.dailyCents)} a day.`}{" "}
        Each chore not signed off by Mom or Dad comes off when the day ends.
      </p>
      {s.bonusRawCents > s.bonusCapCents && (
        <p className="poster-note">Bonuses earned {money(s.bonusRawCents)}. The weekly max is {money(s.bonusCapCents)}.</p>
      )}
      <p className="poster-note">
        {penny.todayTotal !== undefined &&
          `Today: ${penny.todayDone} of ${penny.todayTotal} chores${penny.todayPending ? ` (${penny.todayPending} waiting for Mom or Dad)` : ""}. `}
        This week: {s.choresDone} of {s.choresPossible}.
      </p>
      {p.meta}
      {p.children}
    </section>
  );
}

/**
 * mode "mom": every day tappable (approve / check / uncheck).
 * mode "kid": only today is tappable; marks wait for Mom.
 * mode "view": read-only.
 */
export function ChoreGrid({ kid, s, mode }: { kid: Kid; s: WeekSummary; mode: "mom" | "kid" | "view" }) {
  const days = weekDays(s.weekStart);
  const t = today();
  const hint =
    mode === "mom"
      ? "Tap to check. Tap a clock to approve."
      : mode === "kid" && days.includes(t) && t >= s.trackingStart
        ? "Tap today's chores when they're done. Mom or Dad signs off."
        : null;
  return (
    <section className="panel" aria-labelledby="chores-h">
      <div className="panel-head">
        <h2 id="chores-h">Daily responsibilities</h2>
        {hint && <span className="muted small">{hint}</span>}
      </div>
      <div className="day-head" aria-hidden="true">
        {DAY_SHORT.map((d, i) => <span key={d} className={days[i] === t ? "is-today" : undefined}>{d}</span>)}
      </div>
      {kid.chores.map((c) => (
        <div className="chore" key={c.id}>
          <span className="chore-name">{c.label}</span>
          <div className="days">
            {days.map((date, i) => {
              const key = `${c.id}|${date}`;
              const state: ChoreState = s.choreDone.has(key) ? "done" : s.chorePending.has(key) ? "pending" : "none";
              const inactive = date < s.trackingStart;
              const cls = ["day", date === t && "today", date > t && "future", inactive && "inactive"].filter(Boolean).join(" ");
              const label = `${c.label}, ${DAY_LONG[i]}${inactive ? " (before ZeroStim started)" : ""}`;
              const tappable = !inactive && (mode === "mom" || (mode === "kid" && date === t));
              return tappable ? (
                <DayToggle
                  key={date}
                  as={mode === "mom" ? "mom" : "kid"}
                  state={state}
                  short={DAY_SHORT[i]}
                  className={cls}
                  label={label}
                  fields={(mode === "mom" ? { kidId: kid.id, week: s.weekStart, date, choreId: c.id } : { kidToken: kid.token, choreId: c.id }) as Record<string, string>}
                />
              ) : (
                <DayStatic key={date} state={state} short={DAY_SHORT[i]} className={cls} label={label} />
              );
            })}
          </div>
        </div>
      ))}
      <p className="legend muted small" aria-hidden="true">
        <span className="legend-dot is-done" /> Done
        <span className="legend-dot is-pending" /> Waiting for Mom or Dad
      </p>
    </section>
  );
}

/** Mom or Dad's sign-off list: chores and bonuses the kid marked, waiting for approval. */
export function WaitingForMom({ kid, s, rules }: { kid: Kid; s: WeekSummary; rules: Rules }) {
  const items = s.pendingItems
    .map((it) => ({
      ...it,
      label:
        it.kind === "chore"
          ? kid.chores.find((c) => c.id === it.itemId)?.label
          : rules.bonuses.find((b) => b.id === it.itemId)?.label,
      cents: it.kind === "bonus" ? rules.bonuses.find((b) => b.id === it.itemId)?.cents : undefined,
    }))
    .filter((x) => x.label);
  if (!items.length) return null;
  const hidden = (extra: Record<string, string> = {}) =>
    Object.entries({ kidId: kid.id, week: s.weekStart, ...extra }).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />);
  return (
    <section className="panel panel-waiting" aria-labelledby="waiting-h">
      <div className="panel-head">
        <h2 id="waiting-h">Waiting for Mom or Dad ({items.length})</h2>
        <form action={approveAll}>
          {hidden()}
          <Pending className="btn btn-solid">Approve all</Pending>
        </form>
      </div>
      <ul className="waiting-list">
        {items.map((it) => (
          <li key={it.id}>
            <span>
              {it.kind === "bonus" && <span className="kind-tag">Bonus +{money(it.cents ?? 0)}</span>}
              {it.label}
              <span className="muted small"> {DAY_LONG[weekDays(s.weekStart).indexOf(it.date)]}</span>
            </span>
            <span className="waiting-actions">
              <form action={rejectEntry}>
                {hidden({ id: it.id })}
                <Pending className="btn btn-small" aria-label={`Not done: ${it.label}`}>Not done</Pending>
              </form>
              <form action={approveEntry}>
                {hidden({ id: it.id })}
                <Pending className="btn btn-small btn-solid" aria-label={`Approve: ${it.label}`}>Approve</Pending>
              </form>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Tallies({
  kid,
  s,
  rules,
  kind,
  editable,
  kidCanMark = false,
}: {
  kid: Kid;
  s: WeekSummary;
  rules: Rules;
  kind: "deduction" | "bonus";
  editable: boolean;
  /** Kid's own page: "I did this" buttons for bonuses, waiting for Mom or Dad. */
  kidCanMark?: boolean;
}) {
  const items = kind === "deduction" ? rules.deductions : rules.bonuses;
  if (items.length === 0) return null;
  const title = kind === "deduction" ? "Respect & responsibility" : "Bonuses";
  const sub = kind === "deduction" ? "Deductions" : `Up to ${money(s.bonusCapCents)} a week`;
  const id = `${kind}-h`;
  return (
    <section className={`panel panel-${kind}`} aria-labelledby={id}>
      <div className="panel-head">
        <h2 id={id}>{title}</h2>
        <span className="muted small">{sub}</span>
      </div>
      <div>
        {items.map((item) => {
          const count = s.tallies[`${kind}|${item.id}`] ?? 0;
          const waiting = s.pendingTallies[`${kind}|${item.id}`] ?? 0;
          return (
            <div className="tally" key={item.id}>
              <div>
                <div>{item.label}</div>
                <div className={`amt ${kind === "deduction" ? "minus" : "plus"}`}>
                  {kind === "deduction" ? "-" : "+"}{money(item.cents)} each
                </div>
              </div>
              {editable ? (
                <Stepper count={count} itemLabel={item.label} fields={{ kidId: kid.id, week: s.weekStart, kind, itemId: item.id }} />
              ) : kidCanMark && kind === "bonus" ? (
                <div className="kid-bonus">
                  {(count > 0 || waiting > 0) && (
                    <span className="muted small">
                      {count > 0 && `${count} approved`}
                      {count > 0 && waiting > 0 && ", "}
                      {waiting > 0 && `${waiting} waiting`}
                    </span>
                  )}
                  {waiting > 0 && (
                    <form action={kidBonus}>
                      <input type="hidden" name="kidToken" value={kid.token} />
                      <input type="hidden" name="itemId" value={item.id} />
                      <input type="hidden" name="delta" value="-1" />
                      <Pending className="btn btn-small" aria-label={`Undo: ${item.label}`}>Undo</Pending>
                    </form>
                  )}
                  <form action={kidBonus}>
                    <input type="hidden" name="kidToken" value={kid.token} />
                    <input type="hidden" name="itemId" value={item.id} />
                    <input type="hidden" name="delta" value="1" />
                    <Pending className="btn btn-small btn-solid">I did this</Pending>
                  </form>
                </div>
              ) : (
                <span className={`count-badge${count ? " has" : ""}`} aria-label={`${count} this week${waiting ? `, ${waiting} waiting` : ""}`}>
                  ×{count}
                  {waiting > 0 && <span className="waiting-dot"> +{waiting}?</span>}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
