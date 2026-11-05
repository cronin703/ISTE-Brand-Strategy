import { requireParent } from "@/lib/auth";
import { dbConfigured } from "@/lib/db";
import { Logo } from "@/components/logo";
import { SetupNeeded } from "@/components/setup-needed";
import { ParentTabs } from "@/components/parent-tabs";
import { logout } from "../actions";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  if (!dbConfigured()) return <SetupNeeded />;
  await requireParent();
  return (
    <>
      <main className="page page-with-tabs">
        <header className="topbar">
          <Logo href="/" />
          <form action={logout}>
            <button className="btn">Log out</button>
          </form>
        </header>
        {children}
      </main>
      <ParentTabs />
    </>
  );
}
