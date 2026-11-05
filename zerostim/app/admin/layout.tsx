import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { logout } from "../actions";

// The app owner's area. Not linked from anywhere in the app.
export const metadata: Metadata = { title: "ZeroStim admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = (await getSession())?.role === "admin";
  return (
    <main className="page admin" data-world="grape">
      <header className="topbar">
        <span className="brand">
          <Logo />
          <span className="admin-tag">Admin</span>
        </span>
        {isAdmin && (
          <form action={logout}>
            <button className="btn">Log out</button>
          </form>
        )}
      </header>
      {isAdmin && (
        <nav className="seg" aria-label="Admin">
          <Link href="/admin">Families</Link>
          <Link href="/admin/new">New family</Link>
          <Link href="/admin/defaults">Defaults</Link>
        </nav>
      )}
      {children}
    </main>
  );
}
