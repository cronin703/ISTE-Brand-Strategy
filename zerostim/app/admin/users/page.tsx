import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { tempPassword } from "@/lib/password";
import { adminCreateUser, adminRemoveParent, adminResetPassword, adminUpdateUser } from "../../actions";
import { Pending } from "../../ui";

const SAVED: Record<string, string> = {
  parent: "Login added. Send them the login page, their email and the password.",
  updated: "Saved.",
  password: "Password reset. Send them the new one.",
  removed: "Login removed.",
};

/** Every parent login across all families. */
export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const [users, families] = await Promise.all([db().listAllParents(), db().listFamilies()]);
  const familyOptions = families.map((f) => <option key={f.id} value={f.id}>{f.name}</option>);

  return (
    <>
      <div className="enter-1">
        <h1 className="history-title">Users</h1>
        <p className="muted" style={{ marginTop: 8 }}>
          {users.length} parent {users.length === 1 ? "login" : "logins"} across {families.length} {families.length === 1 ? "family" : "families"}.
        </p>
      </div>
      {sp.saved && SAVED[sp.saved] && <p className="notice notice-good" role="status">{SAVED[sp.saved]}</p>}
      {sp.error && <p className="notice notice-bad" role="alert">{sp.error}</p>}

      <section className="panel" aria-labelledby="u-add">
        <h2 id="u-add">Add a login</h2>
        {families.length === 0 ? (
          <p className="muted">Create a family first. <Link href="/admin/new">New family</Link></p>
        ) : (
          <form action={adminCreateUser} className="add-box" style={{ borderTop: 0, paddingTop: 0 }}>
            <div className="field">
              <label htmlFor="nu-family">Family</label>
              <select id="nu-family" name="familyId" className="text-input">{familyOptions}</select>
            </div>
            <div className="field"><label htmlFor="nu-name">Name</label><input id="nu-name" name="name" className="text-input" maxLength={40} required /></div>
            <div className="field"><label htmlFor="nu-email">Email</label><input id="nu-email" name="email" type="email" className="text-input" autoComplete="off" required /></div>
            <div className="field">
              <label htmlFor="nu-pw">Temporary password</label>
              <input id="nu-pw" name="password" className="text-input" defaultValue={tempPassword()} minLength={8} autoComplete="off" required />
              <p className="muted small">Copy it before you save. They can change it in Settings after logging in.</p>
            </div>
            <Pending className="btn btn-solid">Add login</Pending>
          </form>
        )}
      </section>

      <ul className="admin-list">
        {users.map((u) => (
          <li key={u.id} className="panel user-card">
            <form action={adminUpdateUser} className="user-edit">
              <input type="hidden" name="parentId" value={u.id} />
              <div className="field"><label htmlFor={`un-${u.id}`}>Name</label><input id={`un-${u.id}`} name="name" className="text-input" defaultValue={u.name} maxLength={40} /></div>
              <div className="field"><label htmlFor={`ue-${u.id}`}>Email</label><input id={`ue-${u.id}`} name="email" type="email" className="text-input" defaultValue={u.email} /></div>
              <div className="field">
                <label htmlFor={`uf-${u.id}`}>Family</label>
                <select id={`uf-${u.id}`} name="familyId" className="text-input" defaultValue={u.familyId}>{familyOptions}</select>
              </div>
              <Pending className="btn">Save {u.name}</Pending>
            </form>
            <details className="danger-lite">
              <summary>Password and removal</summary>
              <form action={adminResetPassword} className="danger-form">
                <input type="hidden" name="parentId" value={u.id} />
                <input type="hidden" name="back" value="users" />
                <label htmlFor={`up-${u.id}`} className="small">New password</label>
                <input id={`up-${u.id}`} name="password" className="text-input" defaultValue={tempPassword()} minLength={8} autoComplete="off" />
                <Pending className="btn btn-small">Reset password</Pending>
              </form>
              <form action={adminRemoveParent}>
                <input type="hidden" name="parentId" value={u.id} />
                <input type="hidden" name="back" value="users" />
                <Pending className="btn btn-small btn-danger">Remove {u.name}&apos;s login</Pending>
              </form>
            </details>
          </li>
        ))}
      </ul>
    </>
  );
}
