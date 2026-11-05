import Link from "next/link";
import { redirect } from "next/navigation";
import { getKid } from "@/lib/family";
import { Logo } from "@/components/logo";
import { Mascot } from "@/components/mascot";
import { LoginForm } from "./form";

// Parent login. Kids don't log in; old kid links forward to their page.
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ who?: string }> }) {
  const { who = "parent" } = await searchParams;
  const kid = getKid(who);
  if (kid) redirect(`/kid/${kid.id}`);

  return (
    <main className="page" data-world="parent">
      <header className="topbar">
        <Logo href="/" />
        <Link href="/" className="btn btn-ghost">Back</Link>
      </header>
      <section className="login-hero enter-1">
        <div style={{ flex: 1 }}>
          <h1 className="display">Mom or Dad</h1>
          <p>Log in to manage chores and payouts.</p>
        </div>
        <Mascot size={88} className="mascot" mood="great" />
      </section>
      <div className="enter-2">
        <LoginForm who="parent" isParent />
      </div>
    </main>
  );
}
