import Link from "next/link";
import { HOUSE_RULES, money } from "@/lib/family";
import { requireParent } from "@/lib/auth";
import { addDays, dateOf, daysBetween, formatRange, isValidDate, today, weekStart } from "@/lib/dates";
import { loadFamily, loadWeek } from "@/lib/load";
import { ChoreGrid, PayoutPoster, Tallies, WaitingForMom } from "@/components/week";
import { KidTabs } from "@/components/kid-tabs";
import { togglePaid } from "../actions";
import { Pending } from "../ui";

function lastOpened(name: string, iso: string | null) {
  if (!iso) return `${name} hasn't opened ZeroStim yet.`;
  const d = daysBetween(dateOf(iso), today());
  return `${name} last opened ZeroStim ${d <= 0 ? "today" : d === 1 ? "yesterday" : `${d} days ago`}.`;
}

export default async function ParentWeek({ searchParams }: { searchParams: Promise<{ kid?: string; week?: string }> }) {
  const sp = await searchParams;
  const { family } = await requireParent();
  const ctx = await loadFamily(family);
  const row = ctx.kids.find((k) => k.id === sp.kid) ?? ctx.kids[0];
  if (!row) {
    return (
      <div className="panel">
        <h1 className="history-title">No kids yet</h1>
        <p className="muted">Add your kids in Settings to start tracking.</p>
        <Link href="/parent/settings?tab=family" className="btn btn-solid">Add a kid</Link>
      </div>
    );
  }
  const current = weekStart(today());
  const week = isValidDate(sp.week) ? weekStart(sp.week) : current;
  const { kid, rules, summary, paid, penny } = await loadWeek(ctx, row, week);
  const weekQ = week === current ? "" : `&week=${week}`;

  return (
    <div data-world={kid.color} style={{ display: "contents" }}>
      <KidTabs kids={ctx.kids} base="/parent" current={kid.id} query={weekQ} />

      <nav className="weeknav" aria-label="Week">
        <Link className="btn" href={`/parent?kid=${kid.id}&week=${addDays(week, -7)}`} aria-label="Previous week">←</Link>
        <div className="label">
          <div>{week === current ? "This week" : "Week of"}</div>
          <div className="muted small">{formatRange(week)}</div>
        </div>
        {week < current ? (
          <Link className="btn" href={`/parent?kid=${kid.id}&week=${addDays(week, 7)}`} aria-label="Next week">→</Link>
        ) : (
          <span className="btn" aria-hidden="true" style={{ visibility: "hidden" }}>→</span>
        )}
      </nav>

      <PayoutPoster
        kid={kid}
        s={summary}
        paid={paid}
        penny={penny}
        heading={kid.name}
        meta={week === current && <p className="poster-note">{lastOpened(kid.name, penny.lastSeen ?? null)}</p>}
      >
        <form action={togglePaid}>
          <input type="hidden" name="kidId" value={kid.id} />
          <input type="hidden" name="week" value={week} />
          <Pending className={`btn btn-onposter${paid ? " is-paid" : ""}`}>
            {paid ? "Undo paid" : `Mark ${money(summary.payoutCents)} as paid`}
          </Pending>
        </form>
      </PayoutPoster>

      <div className="week-links">
        <Link href={`/kid/${kid.id}`} className="btn">See {kid.name}&apos;s view</Link>
        <Link href="/parent/settings" className="btn">Edit chores &amp; amounts</Link>
      </div>

      <WaitingForMom kid={kid} s={summary} rules={rules} />
      <ChoreGrid kid={kid} s={summary} mode="mom" />
      <Tallies kid={kid} s={summary} rules={rules} kind="deduction" editable />
      <Tallies kid={kid} s={summary} rules={rules} kind="bonus" editable />

      <section className="panel" aria-labelledby="rules-h">
        <h2 id="rules-h">House rules</h2>
        <ul className="rules">{HOUSE_RULES.map((r) => <li key={r}>{r}</li>)}</ul>
      </section>
    </div>
  );
}
