import Link from "next/link";
import { KIDS, getKid, HOUSE_RULES, money } from "@/lib/family";
import { addDays, formatRange, isValidDate, today, weekStart } from "@/lib/dates";
import { loadWeek } from "@/lib/load";
import { ChoreGrid, PayoutPoster, Tallies } from "@/components/week";
import { KidTabs } from "@/components/kid-tabs";
import { togglePaid } from "../actions";
import { Pending } from "../ui";

export default async function ParentWeek({ searchParams }: { searchParams: Promise<{ kid?: string; week?: string }> }) {
  const sp = await searchParams;
  const kid = getKid(sp.kid ?? "") ?? KIDS[0];
  const current = weekStart(today());
  const week = isValidDate(sp.week) ? weekStart(sp.week) : current;
  const { summary, paid } = await loadWeek(kid, week);
  const weekQ = week === current ? "" : `&week=${week}`;

  return (
    <div data-world={kid.id} style={{ display: "contents" }}>
      <KidTabs base="/parent" current={kid.id} query={weekQ} />

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

      <PayoutPoster kid={kid} s={summary} paid={paid} heading={kid.name}>
        <form action={togglePaid}>
          <input type="hidden" name="kidId" value={kid.id} />
          <input type="hidden" name="week" value={week} />
          <Pending className={`btn btn-onposter${paid ? " is-paid" : ""}`}>
            {paid ? "Undo paid" : `Mark ${money(summary.payoutCents)} as paid`}
          </Pending>
        </form>
      </PayoutPoster>

      <ChoreGrid kid={kid} s={summary} editable />
      <Tallies kid={kid} s={summary} kind="deduction" editable />
      <Tallies kid={kid} s={summary} kind="bonus" editable />

      <section className="panel" aria-labelledby="rules-h">
        <h2 id="rules-h">House rules</h2>
        <ul className="rules">{HOUSE_RULES.map((r) => <li key={r}>{r}</li>)}</ul>
      </section>
    </div>
  );
}
