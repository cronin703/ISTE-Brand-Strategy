import Link from "next/link";
import { redirect } from "next/navigation";
import { KIDS } from "@/lib/family";
import { getSession } from "@/lib/auth";
import { Logo } from "@/components/logo";

export default async function Home() {
  const s = await getSession();
  if (s?.role === "parent") redirect("/parent");
  if (s?.role === "kid") redirect(`/kid/${s.kidId}`);

  return (
    <main className="page" data-world="parent">
      <header className="topbar"><Logo /></header>
      <h1 className="home-title enter-1">Who&apos;s checking in?</h1>
      <nav className="who enter-2" aria-label="Choose who you are">
        {KIDS.map((k) => (
          <Link key={k.id} href={`/login?who=${k.id}`} className="who-tile" data-kid={k.id}>
            <span className="puffy">{k.name}</span>
            <span className="hint">See my week</span>
          </Link>
        ))}
        <Link href="/login?who=parent" className="who-tile wide" data-kid="parent">
          <span className="puffy">Parent</span>
          <span className="hint">Manage</span>
        </Link>
      </nav>
    </main>
  );
}
