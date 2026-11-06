import Link from "next/link";
import { Logo } from "@/components/logo";
import { Mascot } from "@/components/mascot";
import { login } from "../actions";
import { LoginForm } from "./form";

// Parent login (email + password). Kids don't log in; they use their private link.
export default function LoginPage() {
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
        <LoginForm action={login} withEmail />
      </div>
      <p className="muted small" style={{ textAlign: "center" }}>Forgot your password? Ask the other parent in your family or the person who set up ZeroStim for you.</p>
      <p className="muted small" style={{ textAlign: "center" }}><Link href="/privacy">Privacy policy</Link></p>
    </main>
  );
}
