import { KIDS, getKid, money } from "@/lib/family";
import { formatShort, today, weekStart } from "@/lib/dates";
import { loadHistory } from "@/lib/load";
import { KidTabs } from "@/components/kid-tabs";

const WEEKS = 8;

export default async function History({ searchParams }: { searchParams: Promise<{ kid?: string }> }) {
  const sp = await searchParams;
  const kid = getKid(sp.kid ?? "") ?? KIDS[0];
  const { weeks, entries, rules, baseCents } = await loadHistory(kid.id, weekStart(today()), WEEKS);
  const max = Math.max(1, baseCents + rules.bonusCapCents, ...weeks.map((w) => w.payoutCents));
  const totalPaid = weeks.reduce((n, w) => n + (w.paid?.amountCents ?? 0), 0);
  const choreDone = weeks.reduce((n, w) => n + w.choresDone, 0);
  const chorePossible = weeks.reduce((n, w) => n + w.choresPossible, 0);

  const dedCounts = rules.deductions.map((d) => ({ ...d, n: entries.filter((e) => e.kind === "deduction" && e.itemId === d.id).length }))
    .filter((d) => d.n > 0)
    .sort((a, b) => b.n - a.n);
  const dedMax = Math.max(1, ...dedCounts.map((d) => d.n));
  const hasData = entries.length > 0;

  return (
    <div data-world={kid.id} style={{ display: "contents" }}>
      <KidTabs base="/parent/history" current={kid.id} />
      <h1 className="history-title enter-1">{kid.name}&apos;s last {WEEKS} weeks</h1>
      <dl className="stats enter-2">
        <div className="stat"><dt>Paid out</dt><dd>{money(totalPaid)}</dd></div>
        <div className="stat"><dt>Chores done</dt><dd>{chorePossible ? Math.round((choreDone / chorePossible) * 100) : 0}%</dd></div>
      </dl>

      {!hasData && (
        <p className="notice">Nothing logged yet. Check off chores and tally deductions on This week, and trends show up here.</p>
      )}

      <section className="panel" aria-labelledby="pay-h">
        <h2 id="pay-h">Weekly payout</h2>
        <div className="bars">
          {weeks.map((w) => (
            <div className="bar-row" key={w.weekStart}>
              <span className="muted">{formatShort(w.weekStart)}</span>
              <div className="bar" role="img" aria-label={`Week of ${formatShort(w.weekStart)}: ${money(w.payoutCents)}`}>
                <span style={{ width: `${(w.payoutCents / max) * 100}%` }} />
              </div>
              <span style={{ textAlign: "right" }}>{money(w.payoutCents)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel" aria-labelledby="tbl-h">
        <h2 id="tbl-h">Week by week</h2>
        <div className="scroll-x">
          <table className="table">
            <thead>
              <tr><th>Week</th><th>Chores</th><th>Deduct.</th><th>Bonus</th><th>Payout</th></tr>
            </thead>
            <tbody>
              {[...weeks].reverse().map((w) => (
                <tr key={w.weekStart}>
                  <td>{formatShort(w.weekStart)}</td>
                  <td>{w.choresPossible ? `${Math.round((w.choresDone / w.choresPossible) * 100)}%` : "—"}</td>
                  <td className="amt minus">{w.deductionCents ? `-${money(w.deductionCents)}` : "—"}</td>
                  <td className="amt plus">{w.bonusCents ? `+${money(w.bonusCents)}` : "—"}</td>
                  <td>{money(w.payoutCents)}{w.paid ? " ✓" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted small">✓ means marked paid</p>
      </section>

      <section className="panel" aria-labelledby="ded-h">
        <h2 id="ded-h">Most common deductions</h2>
        {dedCounts.length === 0 ? (
          <p className="muted small">No deductions in the last {WEEKS} weeks.</p>
        ) : (
          <div className="bars">
            {dedCounts.map((d) => (
              <div key={d.id} style={{ display: "grid", gap: 4 }}>
                <span className="small">{d.label}</span>
                <div className="bar-row" style={{ gridTemplateColumns: "1fr 40px" }}>
                  <div className="bar minus"><span style={{ width: `${(d.n / dedMax) * 100}%` }} /></div>
                  <span style={{ textAlign: "right" }}>×{d.n}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
