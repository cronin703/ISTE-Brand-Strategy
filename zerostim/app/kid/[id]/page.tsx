import Link from "next/link";
import { notFound } from "next/navigation";
import { getKid, HOUSE_RULES } from "@/lib/family";
import { formatRange, today, weekStart } from "@/lib/dates";
import { requireKidAccess } from "@/lib/auth";
import { loadWeek } from "@/lib/load";
import { ChoreGrid, PayoutCard, Tallies } from "@/components/week";
import { logout } from "../../actions";

export default async function KidPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kid = getKid(id);
  if (!kid) notFound();
  const session = await requireKidAccess(kid.id);
  const week = weekStart(today());
  const { summary, paid } = await loadWeek(kid, week);

  return (
    <main className="page">
      <header className="topbar">
        <span className="brand"><img src="/icon.svg" alt="" />ZeroStim</span>
        {session.role === "parent" ? (
          <Link href={`/parent?kid=${kid.id}`} className="btn btn-ghost">Back to manage</Link>
        ) : (
          <form action={logout}><button className="btn btn-ghost">Switch user</button></form>
        )}
      </header>
      <div>
        <h1>Hi {kid.name}!</h1>
        <p className="muted">Here&apos;s your week, {formatRange(week)}.</p>
      </div>
      <PayoutCard kid={kid} s={summary} paid={paid} />
      <ChoreGrid kid={kid} s={summary} editable={false} />
      <Tallies kid={kid} s={summary} kind="bonus" editable={false} />
      <Tallies kid={kid} s={summary} kind="deduction" editable={false} />
      <section className="card" aria-labelledby="rules-h">
        <h2 id="rules-h">House rules</h2>
        <ul className="rules">{HOUSE_RULES.map((r) => <li key={r}>{r}</li>)}</ul>
      </section>
    </main>
  );
}
