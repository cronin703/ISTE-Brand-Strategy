import Link from "next/link";
import { HOUSE_RULES } from "@/lib/family";
import { formatRange, today } from "@/lib/dates";
import type { WeekView } from "@/lib/load";
import { ChoreGrid, PayoutPoster, Tallies } from "./week";
import { Logo } from "./logo";
import { Avatar } from "./avatar";
import { MarkSeen } from "./mark-seen";

/** A kid's own page. `asParent` = Mom or Dad peeking (read-only, doesn't count as a visit). */
export function KidView({ v, asParent }: { v: WeekView; asParent: boolean }) {
  const { kid, rules, summary, paid, penny } = v;
  const started = today() >= summary.trackingStart;
  return (
    <main className="page" data-world={kid.color}>
      {!asParent && <MarkSeen kidToken={kid.token} />}
      <header className="topbar">
        <Logo href="/" />
        {asParent ? (
          <Link href={`/parent?kid=${kid.id}`} className="btn btn-solid">Back to manage</Link>
        ) : (
          <Link href="/" className="btn" style={{ gap: 8, paddingLeft: 6 }}>
            <Avatar color={kid.color} name={kid.name} size={32} />
            Home
          </Link>
        )}
      </header>
      <div className="split">
      <div className="split-a">
      <PayoutPoster kid={kid} s={summary} paid={paid} penny={penny} heading={`Hi ${kid.name}`} />
      <p className="muted small" style={{ textAlign: "center" }}>Week of {formatRange(summary.weekStart)}. Fresh start every Monday.</p>
      </div>
      <div className="split-b">
      <ChoreGrid kid={kid} s={summary} mode={asParent ? "view" : "kid"} />
      <Tallies kid={kid} s={summary} rules={rules} kind="bonus" editable={false} kidCanMark={!asParent && started} />
      <Tallies kid={kid} s={summary} rules={rules} kind="deduction" editable={false} />
      <section className="panel" aria-labelledby="rules-h">
        <h2 id="rules-h">House rules</h2>
        <ul className="rules">{HOUSE_RULES.map((r) => <li key={r}>{r}</li>)}</ul>
      </section>
      </div>
      </div>
    </main>
  );
}
