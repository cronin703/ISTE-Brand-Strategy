import Link from "next/link";
import { getKid } from "@/lib/family";
import { Logo } from "@/components/logo";
import { Mascot } from "@/components/mascot";
import { LoginForm } from "./form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ who?: string }> }) {
  const { who = "parent" } = await searchParams;
  const kid = getKid(who);
  const isParent = !kid;

  return (
    <main className="page" data-world={isParent ? "parent" : kid.id}>
      <header className="topbar">
        <Logo href="/" />
        <Link href="/" className="btn btn-ghost">Not you?</Link>
      </header>
      <section className="login-hero enter-1">
        <div style={{ flex: 1 }}>
          <h1 className="display">{isParent ? "Parent" : `Hi ${kid.name}`}</h1>
          <p>{isParent ? "Log in to manage chores and payouts." : "Type your PIN to see your week."}</p>
        </div>
        <Mascot size={88} className="mascot" mood="great" />
      </section>
      <div className="enter-2">
        <LoginForm who={isParent ? "parent" : kid.id} isParent={isParent} />
      </div>
    </main>
  );
}
