import Link from "next/link";
import { requireParent } from "@/lib/auth";
import { logout } from "../actions";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  await requireParent();
  return (
    <main className="page">
      <header className="topbar">
        <Link href="/parent" className="brand" aria-label="ZeroStim home"><img src="/icon.svg" alt="" /><span className="brand-text">ZeroStim</span></Link>
        <nav className="topnav" aria-label="Parent">
          <Link href="/parent" className="btn btn-ghost">Week</Link>
          <Link href="/parent/history" className="btn btn-ghost">History</Link>
          <form action={logout}><button className="btn btn-ghost">Log out</button></form>
        </nav>
      </header>
      {children}
    </main>
  );
}
