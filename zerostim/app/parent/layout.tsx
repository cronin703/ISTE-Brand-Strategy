import Link from "next/link";
import { requireParent } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { dbConfigured } from "@/lib/db";
import { SetupNeeded } from "@/components/setup-needed";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  await requireParent();
  if (!dbConfigured()) return <SetupNeeded />;
  return (
    <main className="page">
      <header className="topbar has-nav">
        <Logo href="/parent" />
        <nav className="topnav" aria-label="Parent">
          <Link href="/parent" className="btn btn-ghost">Week</Link>
          <Link href="/parent/history" className="btn btn-ghost">History</Link>
          <Link href="/parent/share" className="btn btn-ghost">Share</Link>
        </nav>
      </header>
      {children}
    </main>
  );
}
