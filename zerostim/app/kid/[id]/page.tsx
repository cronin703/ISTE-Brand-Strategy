import Link from "next/link";
import { notFound } from "next/navigation";
import { getKid, HOUSE_RULES } from "@/lib/family";
import { formatRange, today, weekStart } from "@/lib/dates";
import { getSession } from "@/lib/auth";
import { loadWeek } from "@/lib/load";
import { ChoreGrid, PayoutPoster, Tallies } from "@/components/week";
import { Logo } from "@/components/logo";
import { dbConfigured } from "@/lib/db";
import { SetupNeeded } from "@/components/setup-needed";
import { Avatar } from "@/components/avatar";
import { MarkSeen } from "@/components/mark-seen";

// Kids don't log in: their page is open to anyone with the link, and read-only.
export default async function KidPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getKid(id)) notFound();
  if (!dbConfigured()) return <SetupNeeded />;
  const isParent = (await getSession())?.role === "parent";
  const week = weekStart(today());
  const { kid, rules, summary, paid, penny } = await loadWeek(id, week);

  return (
    <main className="page" data-world={kid.id}>
      {!isParent && <MarkSeen kidId={kid.id} />}
      <header className="topbar">
        <Logo href="/" />
        {isParent ? (
          <Link href={`/parent?kid=${kid.id}`} className="btn btn-solid">Back to manage</Link>
        ) : (
          <Link href="/" className="btn" style={{ gap: 8, paddingLeft: 6 }}>
            <Avatar id={kid.id} name={kid.name} size={32} />
            Home
          </Link>
        )}
      </header>
      <PayoutPoster kid={kid} s={summary} paid={paid} penny={penny} heading={`Hi ${kid.name}`} />
      <p className="muted small" style={{ textAlign: "center" }}>Week of {formatRange(week)}. Fresh start every Monday.</p>
      <ChoreGrid kid={kid} s={summary} mode={isParent ? "view" : "kid"} />
      <Tallies kid={kid} s={summary} rules={rules} kind="bonus" editable={false} kidCanMark={!isParent && today() >= summary.trackingStart} />
      <Tallies kid={kid} s={summary} rules={rules} kind="deduction" editable={false} />
      <section className="panel" aria-labelledby="rules-h">
        <h2 id="rules-h">House rules</h2>
        <ul className="rules">{HOUSE_RULES.map((r) => <li key={r}>{r}</li>)}</ul>
      </section>
    </main>
  );
}
