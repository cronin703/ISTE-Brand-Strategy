import Link from "next/link";
import { getKid } from "@/lib/family";
import { LoginForm } from "./form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ who?: string }> }) {
  const { who = "parent" } = await searchParams;
  const kid = getKid(who);
  const isParent = !kid;

  return (
    <main className="page">
      <header className="topbar">
        <Link href="/" className="brand"><img src="/icon.svg" alt="" />ZeroStim</Link>
      </header>
      <div>
        <h1>{isParent ? "Parent log in" : `Hi, ${kid.name}`}</h1>
        <p className="muted">{isParent ? "Manage chores, tallies, and payouts." : "Type your PIN to see your week."}</p>
      </div>
      <LoginForm who={isParent ? "parent" : kid.id} isParent={isParent} />
      <Link href="/" className="btn btn-ghost">Not you? Go back</Link>
    </main>
  );
}
