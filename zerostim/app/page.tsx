import Link from "next/link";
import { redirect } from "next/navigation";
import { KIDS } from "@/lib/family";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const s = await getSession();
  if (s?.role === "parent") redirect("/parent");
  if (s?.role === "kid") redirect(`/kid/${s.kidId}`);

  return (
    <main className="page">
      <header className="topbar">
        <span className="brand"><img src="/icon.svg" alt="" />ZeroStim</span>
      </header>
      <div>
        <h1>Who&apos;s checking in?</h1>
        <p className="muted">Pick your name to see your week.</p>
      </div>
      <nav className="who" aria-label="Choose who you are">
        {KIDS.map((k) => (
          <Link key={k.id} href={`/login?who=${k.id}`}>
            <span className="name">{k.name}</span>
            <span className="muted small">Enter PIN →</span>
          </Link>
        ))}
        <Link href="/login?who=parent">
          <span className="name">Parent</span>
          <span className="muted small">Log in to manage →</span>
        </Link>
      </nav>
    </main>
  );
}
