import { money, type Kid } from "@/lib/family";
import type { Rules } from "@/lib/settings";
import { DAY_LONG, DAY_SHORT, today, weekDays } from "@/lib/dates";
import type { WeekSummary } from "@/lib/calc";
import { DayStatic, DayToggle, Stepper } from "@/app/ui";
import { Mascot, MOOD_LINE, moodFor } from "./mascot";

/** The loud part of every kid screen: name, payout, mascot. */
export function PayoutPoster(p: { kid: Kid; s: WeekSummary; paid: boolean; heading: string; children?: React.ReactNode }) {
  const { kid, s } = p;
  const mood = moodFor(s.payoutCents, s.baseCents);
  return (
    <section className="poster" aria-labelledby="payout-h">
      <div className="poster-top">
        <div>
          <h1 className="display poster-name">{p.heading}</h1>
          <p className="poster-sub">{MOOD_LINE[mood]}</p>
        </div>
        <Mascot mood={mood} size={104} className="mascot" />
      </div>
      <div>
        <h2 id="payout-h" className="poster-label">
          Payout this week {p.paid && <span className="paid-chip">Paid</span>}
        </h2>
        <p key={s.payoutCents} className="display poster-amount" aria-live="polite">{money(s.payoutCents)}</p>
      </div>
      <dl className="math">
        <div><dt>Start</dt><dd>{money(s.baseCents)}</dd></div>
        <div><dt>Deductions</dt><dd>{s.deductionCents ? `-${money(s.deductionCents)}` : "$0.00"}</dd></div>
        <div><dt>Bonuses</dt><dd>+{money(s.bonusCents)}</dd></div>
      </dl>
      {s.bonusRawCents > s.bonusCapCents && (
        <p className="poster-note">Bonuses earned {money(s.bonusRawCents)}. The weekly max is {money(s.bonusCapCents)}.</p>
      )}
      <p className="poster-note">Chores done: {s.choresDone} of {s.choresPossible} so far</p>
      {p.children}
    </section>
  );
}

export function ChoreGrid({ kid, s, editable }: { kid: Kid; s: WeekSummary; editable: boolean }) {
  const days = weekDays(s.weekStart);
  const t = today();
  return (
    <section className="panel" aria-labelledby="chores-h">
      <div className="panel-head">
        <h2 id="chores-h">Daily responsibilities</h2>
        {editable && <span className="muted small">Tap a day to check it off</span>}
      </div>
      <div className="day-head" aria-hidden="true">
        {DAY_SHORT.map((d, i) => <span key={d} className={days[i] === t ? "is-today" : undefined}>{d}</span>)}
      </div>
      {kid.chores.map((c) => (
        <div className="chore" key={c.id}>
          <span className="chore-name">{c.label}</span>
          <div className="days">
            {days.map((date, i) => {
              const done = s.choreDone.has(`${c.id}|${date}`);
              const cls = ["day", date === t && "today", date > t && "future"].filter(Boolean).join(" ");
              return editable ? (
                <DayToggle
                  key={date}
                  done={done}
                  short={DAY_SHORT[i]}
                  className={cls}
                  label={`${c.label}, ${DAY_LONG[i]}`}
                  fields={{ kidId: kid.id, week: s.weekStart, date, choreId: c.id }}
                />
              ) : (
                <DayStatic
                  key={date}
                  done={done}
                  short={DAY_SHORT[i]}
                  className={cls}
                  label={`${c.label}, ${DAY_LONG[i]}, ${done ? "done" : "not done"}`}
                />
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

export function Tallies({ kid, s, rules, kind, editable }: { kid: Kid; s: WeekSummary; rules: Rules; kind: "deduction" | "bonus"; editable: boolean }) {
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
              ) : (
                <span className={`count-badge${count ? " has" : ""}`} aria-label={`${count} this week`}>×{count}</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
