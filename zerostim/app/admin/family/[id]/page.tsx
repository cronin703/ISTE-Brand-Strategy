import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatShort } from "@/lib/dates";
import { tempPassword } from "@/lib/password";
import { Avatar } from "@/components/avatar";
import { adminAddKid, adminAddParent, adminDeleteFamily, adminImpersonate, adminRemoveParent, adminRenameFamily, adminResetPassword } from "../../../actions";
import Link from "next/link";
import { Pending } from "../../../ui";

const SAVED: Record<string, string> = {
  parent: "Parent added. Send them the email and password.",
  password: "Password reset. Send them the new one.",
  removed: "Removed.",
  kid: "Kid added.",
  name: "Saved.",
};

export default async function AdminFamily({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string; saved?: string; error?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const family = await db().getFamily(id);
  if (!family) notFound();
  const [parents, kids] = await Promise.all([db().listParents(id), db().listKids(id)]);
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3100";
  const base = `${h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")}://${host}`;
  const fid = <input type="hidden" name="familyId" value={family.id} />;

  return (
    <>
      <div className="enter-1">
        <h1 className="history-title">{family.name}</h1>
        <p className="muted" style={{ marginTop: 8 }}>Starts {formatShort(family.trackingStart)}.</p>
      </div>
      {sp.created && (
        <p className="notice notice-good" role="status">
          Family created. Send the parent the login page ({base}/login), their email and the temporary password.
        </p>
      )}
      {sp.saved && SAVED[sp.saved] && <p className="notice notice-good" role="status">{SAVED[sp.saved]}</p>}
      {sp.error && <p className="notice notice-bad" role="alert">{sp.error}</p>}

      <section className="panel" aria-labelledby="af-parents">
        <h2 id="af-parents">Parents</h2>
        {parents.length === 0 && <p className="muted">No parent logins yet.</p>}
        <ul className="people">
          {parents.map((p) => (
            <li key={p.id} className="people-admin">
              <span>
                <strong>{p.name}</strong>
                <span className="muted small break" style={{ display: "block" }}>{p.email}</span>
              </span>
              <form action={adminImpersonate}>
                <input type="hidden" name="parentId" value={p.id} />
                <Pending className="btn btn-small btn-solid">View as {p.name}</Pending>
              </form>
              <details className="danger-lite">
                <summary>Manage</summary>
                <form action={adminResetPassword} className="danger-form">
                  {fid}
                  <input type="hidden" name="parentId" value={p.id} />
                  <label htmlFor={`rp-${p.id}`} className="small">New password</label>
                  <input id={`rp-${p.id}`} name="password" className="text-input" defaultValue={tempPassword()} minLength={8} autoComplete="off" />
                  <Pending className="btn btn-small">Reset password</Pending>
                </form>
                <form action={adminRemoveParent}>
                  {fid}
                  <input type="hidden" name="parentId" value={p.id} />
                  <Pending className="btn btn-small btn-danger">Remove {p.name}</Pending>
                </form>
              </details>
            </li>
          ))}
        </ul>
        <form action={adminAddParent} className="add-box">
          {fid}
          <h3>Add a parent</h3>
          <div className="field"><label htmlFor="ap-name">Name</label><input id="ap-name" name="name" className="text-input" required /></div>
          <div className="field"><label htmlFor="ap-email">Email</label><input id="ap-email" name="email" type="email" className="text-input" autoComplete="off" required /></div>
          <div className="field"><label htmlFor="ap-pw">Temporary password</label><input id="ap-pw" name="password" className="text-input" defaultValue={tempPassword()} minLength={8} autoComplete="off" required /></div>
          <Pending className="btn btn-solid">Add parent</Pending>
        </form>
      </section>

      <section className="panel" aria-labelledby="af-kids">
        <h2 id="af-kids">Kids</h2>
        <ul className="people">
          {kids.map((k) => (
            <li key={k.id}>
              <span className="share-head"><Avatar color={k.color} name={k.name} size={32} /> {k.name}</span>
              <Link href={`/k/${k.token}`} className="btn btn-small">Open {k.name}&apos;s page</Link>
            </li>
          ))}
        </ul>
        <form action={adminAddKid} className="add-box">
          {fid}
          <h3>Add a kid</h3>
          <div className="field"><label htmlFor="ak-name">Name</label><input id="ak-name" name="name" className="text-input" required /></div>
          <div className="field">
            <label htmlFor="ak-base">Weekly allowance</label>
            <span className="money-input money-input-lg"><span aria-hidden="true">$</span><input id="ak-base" name="base" inputMode="decimal" defaultValue="10.00" required /></span>
          </div>
          <Pending className="btn btn-solid">Add kid</Pending>
        </form>
      </section>

      <section className="panel" aria-labelledby="af-links">
        <h2 id="af-links">Links</h2>
        <p className="small">Family dashboard: <span className="break">{base}/f/{family.token}</span></p>
        <p className="muted small">Parents find kid links and QR codes on their Share tab.</p>
      </section>

      <section className="panel" aria-labelledby="af-name">
        <h2 id="af-name">Family name</h2>
        <form action={adminRenameFamily} className="add-box" style={{ borderTop: 0, paddingTop: 0 }}>
          {fid}
          <label htmlFor="af-rename" className="sr-only">Family name</label>
          <input id="af-rename" name="name" className="text-input" defaultValue={family.name} maxLength={60} />
          <Pending className="btn">Rename</Pending>
        </form>
      </section>

      <details className="panel danger">
        <summary>Delete this family</summary>
        <form action={adminDeleteFamily} className="danger-form">
          {fid}
          <p className="small">Deletes the family, its parent logins, kids and all their history. This can&apos;t be undone.</p>
          <label htmlFor="af-del" className="small">Type <strong>{family.name}</strong> to confirm</label>
          <input id="af-del" name="confirm" className="text-input" autoComplete="off" />
          <Pending className="btn btn-danger">Delete {family.name}</Pending>
        </form>
      </details>
    </>
  );
}
