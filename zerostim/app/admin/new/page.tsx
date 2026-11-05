import { requireAdmin } from "@/lib/auth";
import { addDays, today } from "@/lib/dates";
import { loadDefaults } from "@/lib/settings";
import { tempPassword } from "@/lib/password";
import { KidCountFields } from "@/components/kid-count-fields";
import { createFamily } from "../../actions";
import { Pending } from "../../ui";

export default async function NewFamily({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const d = await loadDefaults();
  return (
    <>
      <div className="enter-1">
        <h1 className="history-title">New family</h1>
        <p className="muted" style={{ marginTop: 8 }}>Kids start with your default chores, deductions and bonuses. The family can change them later.</p>
      </div>
      {sp.error && <p className="notice notice-bad" role="alert">{sp.error}</p>}
      <form action={createFamily} className="settings">
        <section className="panel" aria-labelledby="nf-fam">
          <h2 id="nf-fam">Family</h2>
          <div className="field">
            <label htmlFor="familyName">Family name</label>
            <input id="familyName" name="familyName" className="text-input" placeholder="The Smiths" maxLength={60} required />
          </div>
          <div className="field">
            <label htmlFor="startDate">First day that counts</label>
            <input id="startDate" name="startDate" type="date" className="date-input" defaultValue={addDays(today(), 1)} required />
          </div>
        </section>
        <section className="panel" aria-labelledby="nf-parent">
          <h2 id="nf-parent">First parent login</h2>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" className="text-input" maxLength={40} required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className="text-input" autoComplete="off" required />
          </div>
          <div className="field">
            <label htmlFor="password">Temporary password</label>
            <input id="password" name="password" type="text" className="text-input" defaultValue={tempPassword()} minLength={8} autoComplete="off" required />
            <p className="muted small">Copy this before you save. Send it with the email so they can log in, then they can change it in Settings.</p>
          </div>
        </section>
        <section className="panel" aria-labelledby="nf-kids">
          <h2 id="nf-kids">Kids</h2>
          <KidCountFields defaultCount={d.kidCount} defaultBase={(d.baseCents / 100).toFixed(2)} />
        </section>
        <Pending className="btn btn-solid" style={{ width: "100%" }}>Create family</Pending>
      </form>
    </>
  );
}
