import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db, dbConfigured } from "@/lib/db";
import { formatShort } from "@/lib/dates";
import { SetupNeeded } from "@/components/setup-needed";

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  if (!dbConfigured()) return <SetupNeeded />;
  await requireAdmin();
  const sp = await searchParams;
  const families = await db().listFamilies();
  return (
    <>
      <div className="enter-1">
        <h1 className="history-title">Families</h1>
        <p className="muted" style={{ marginTop: 8 }}>{families.length} {families.length === 1 ? "family" : "families"} using ZeroStim.</p>
      </div>
      {sp.saved === "deleted" && <p className="notice notice-good" role="status">Family deleted.</p>}
      {families.length === 0 ? (
        <section className="panel">
          <p>No families yet.</p>
          <Link href="/admin/new" className="btn btn-solid">Create the first family</Link>
        </section>
      ) : (
        <ul className="admin-list">
          {families.map((f) => (
            <li key={f.id}>
              <Link href={`/admin/family/${f.id}`} className="panel admin-card">
                <span className="admin-card-name">{f.name}</span>
                <span className="muted small">
                  {f.kidNames.length ? f.kidNames.join(", ") : "No kids"}. {f.parentEmails.length} {f.parentEmails.length === 1 ? "parent" : "parents"}.
                </span>
                <span className="muted small break">{f.parentEmails.join(", ") || "No parent logins"}</span>
                <span className="muted small">Starts {formatShort(f.trackingStart)}. Created {formatShort(f.createdAt.slice(0, 10))}.</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
