import { BONUSES, BONUS_CAP_CENTS, DEDUCTIONS, money, type Kid } from "@/lib/family";
import { DAY_LONG, DAY_SHORT, today, weekDays } from "@/lib/dates";
import type { WeekSummary } from "@/lib/calc";
import { changeTally, toggleChore } from "@/app/actions";
import { Pending } from "@/app/ui";

export function PayoutCard({ kid, s, paid, editable }: { kid: Kid; s: WeekSummary; paid: boolean; editable?: React.ReactNode }) {
  return (
    <section className="card payout" aria-labelledby="payout-h">
      <div className="card-head">
        <h2 id="payout-h" className="muted small">{kid.name}&apos;s payout this week</h2>
        {paid && <span className="pill pill-good">Paid</span>}
      </div>
      <p className="amount">{money(s.payoutCents)}</p>
      <dl className="math">
        <div><dt>Start</dt><dd>{money(s.baseCents)}</dd></div>
        <div><dt>Deductions</dt><dd className="amt minus">{s.deductionCents ? `-${money(s.deductionCents)}` : "$0.00"}</dd></div>
        <div><dt>Bonuses</dt><dd className="amt plus">+{money(s.bonusCents)}</dd></div>
      </dl>
      {s.bonusRawCents > BONUS_CAP_CENTS && (
        <p className="notice">Bonuses earned {money(s.bonusRawCents)}; the weekly max is {money(BONUS_CAP_CENTS)}.</p>
      )}
      <p className="muted small">
        Chores done: {s.choresDone} of {s.choresPossible} so far
      </p>
      {editable}
    </section>
  );
}

export function ChoreGrid({ kid, s, editable }: { kid: Kid; s: WeekSummary; editable: boolean }) {
  const days = weekDays(s.weekStart);
  const t = today();
  return (
    <section className="card" aria-labelledby="chores-h">
      <div className="card-head">
        <h2 id="chores-h">Daily responsibilities</h2>
        {editable && <span className="muted small">Tap a day to check it off</span>}
      </div>
      <div className="day-head" aria-hidden="true">
        {DAY_SHORT.map((d) => <span key={d}>{d}</span>)}
      </div>
      {kid.chores.map((c) => (
        <div className="chore" key={c.id}>
          <span>{c.label}</span>
          <div className="days">
            {days.map((date, i) => {
              const done = s.choreDone.has(`${c.id}|${date}`);
              const cls = ["day", date === t && "today", date > t && "future", !editable && done && "done"].filter(Boolean).join(" ");
              const label = `${c.label}, ${DAY_LONG[i]}${done ? ", done" : ", not done"}`;
              if (!editable) {
                return (
                  <span key={date} className={cls} role="img" aria-label={label}>
                    {done ? "✓" : DAY_SHORT[i]}
                  </span>
                );
              }
              return (
                <form key={date} action={toggleChore}>
                  <input type="hidden" name="kidId" value={kid.id} />
                  <input type="hidden" name="week" value={s.weekStart} />
                  <input type="hidden" name="date" value={date} />
                  <input type="hidden" name="choreId" value={c.id} />
                  <Pending className={cls} aria-pressed={done} aria-label={`${c.label}, ${DAY_LONG[i]}`}>
                    {done ? "✓" : DAY_SHORT[i]}
                  </Pending>
                </form>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

export function Tallies({ kid, s, kind, editable }: { kid: Kid; s: WeekSummary; kind: "deduction" | "bonus"; editable: boolean }) {
  const items = kind === "deduction" ? DEDUCTIONS : BONUSES;
  const title = kind === "deduction" ? "Respect & responsibility deductions" : `Optional bonuses (max ${money(BONUS_CAP_CENTS)}/week)`;
  const id = `${kind}-h`;
  return (
    <section className="card" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
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
                <div className="stepper">
                  <TallyButton kid={kid} week={s.weekStart} kind={kind} itemId={item.id} delta={-1} disabled={count === 0} label={`Remove one: ${item.label}`} />
                  <span className="count" aria-label={`${count} logged`}>{count}</span>
                  <TallyButton kid={kid} week={s.weekStart} kind={kind} itemId={item.id} delta={1} label={`Add one: ${item.label}`} />
                </div>
              ) : (
                <span className="count" aria-label={`${count} this week`}><strong>×{count}</strong></span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TallyButton(p: { kid: Kid; week: string; kind: string; itemId: string; delta: number; disabled?: boolean; label: string }) {
  return (
    <form action={changeTally}>
      <input type="hidden" name="kidId" value={p.kid.id} />
      <input type="hidden" name="week" value={p.week} />
      <input type="hidden" name="kind" value={p.kind} />
      <input type="hidden" name="itemId" value={p.itemId} />
      <input type="hidden" name="delta" value={p.delta} />
      <Pending className="step" disabled={p.disabled} aria-label={p.label}>
        {p.delta > 0 ? "+" : "−"}
      </Pending>
    </form>
  );
}
