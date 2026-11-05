import Link from "next/link";
import { notFound } from "next/navigation";
import { getKid, HOUSE_RULES } from "@/lib/family";
import { formatRange, today, weekStart } from "@/lib/dates";
import { requireKidAccess } from "@/lib/auth";
import { loadWeek } from "@/lib/load";
import { ChoreGrid, PayoutPoster, Tallies } from "@/components/week";
import { Logo } from "@/components/logo";
import { logout } from "../../actions";
import { dbConfigured } from "@/lib/db";
import { SetupNeeded } from "@/components/setup-needed";
import { Avatar } from "@/components/avatar";

export default async function KidPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getKid(id)) notFound();
  const session = await requireKidAccess(id);
  if (!dbConfigured()) return <SetupNeeded />;
  const week = weekStart(today());
  const { kid, rules, summary, paid } = await loadWeek(id, week);

  return (
    <main className="page" data-world={kid.id}>
      <header className="topbar">
        <Logo />
        {session.role === "parent" ? (
          <Link href={`/parent?kid=${kid.id}`} className="btn btn-solid">Back to manage</Link>
        ) : (
          <form action={logout} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar id={kid.id} name={kid.name} size={32} />
            <button className="btn btn-ghost">Switch user</button>
          </form>
        )}
      </header>
      <PayoutPoster kid={kid} s={summary} paid={paid} heading={`Hi ${kid.name}`} />
      <p className="muted small" style={{ textAlign: "center" }}>Week of {formatRange(week)}</p>
      <ChoreGrid kid={kid} s={summary} editable={false} />
      <Tallies kid={kid} s={summary} rules={rules} kind="bonus" editable={false} />
      <Tallies kid={kid} s={summary} rules={rules} kind="deduction" editable={false} />
      <section className="panel" aria-labelledby="rules-h">
        <h2 id="rules-h">House rules</h2>
        <ul className="rules">{HOUSE_RULES.map((r) => <li key={r}>{r}</li>)}</ul>
      </section>
    </main>
  );
}
