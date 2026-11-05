import { COLOR_NAMES, KID_COLORS, money, type KidColor } from "@/lib/family";
import type { Parent } from "@/lib/db";
import type { FamilyCtx } from "@/lib/load";
import { kidIn } from "@/lib/settings";
import { today, weekStart } from "@/lib/dates";
import { addKid, addParent, changePassword, removeKid, removeParent, updateKid } from "@/app/actions";
import { Pending } from "@/app/ui";
import { Avatar } from "./avatar";
import { db } from "@/lib/db";

const SAVED: Record<string, string> = {
  kid: "Saved.",
  parent: "Parent added. Send them their email and password so they can log in.",
  password: "Password changed.",
  removed: "Removed.",
};

function ColorPicker({ name, value, idPrefix }: { name: string; value?: KidColor; idPrefix: string }) {
  return (
    <fieldset className="swatches">
      <legend className="field-label">Color</legend>
      {KID_COLORS.map((c, i) => (
        <label key={c} className="swatch" data-kid={c} title={COLOR_NAMES[c]}>
          <input type="radio" name={name} value={c} defaultChecked={value ? value === c : i === 0} id={`${idPrefix}-${c}`} />
          <span className="sr-only">{COLOR_NAMES[c]}</span>
        </label>
      ))}
    </fieldset>
  );
}

/** Settings > Family: kids, parents, and your own password. */
export async function FamilySettings({ ctx, me, saved, error }: { ctx: FamilyCtx; me: Parent; saved?: string; error?: string }) {
  const parents = await db().listParents(ctx.family.id);
  const s = ctx.book.at(weekStart(today()));
  return (
    <>
      {saved && SAVED[saved] && <p className="notice notice-good" role="status">{SAVED[saved]}</p>}
      {error && <p className="notice notice-bad" role="alert">{error}</p>}

      <section className="panel" aria-labelledby="fam-kids">
        <h2 id="fam-kids">Kids</h2>
        {ctx.kids.length === 0 && <p className="muted">No kids yet. Add one below.</p>}
        {ctx.kids.map((k) => (
          <div key={k.id} className="kid-edit" data-kid={k.color}>
            <form action={updateKid} className="kid-edit-form">
              <input type="hidden" name="kidId" value={k.id} />
              <div className="share-head">
                <Avatar color={k.color} name={k.name} size={40} />
                <div className="field" style={{ flex: 1 }}>
                  <label htmlFor={`kn-${k.id}`}>Name</label>
                  <input id={`kn-${k.id}`} name="name" className="text-input" defaultValue={k.name} maxLength={40} />
                </div>
              </div>
              <ColorPicker name="color" value={k.color} idPrefix={`kc-${k.id}`} />
              <p className="muted small">Weekly allowance {money(kidIn(s, k).baseCents)}. Change it on Chores &amp; money.</p>
              <Pending className="btn">Save {k.name}</Pending>
            </form>
            <details className="danger">
              <summary>Remove {k.name}</summary>
              <form action={removeKid} className="danger-form">
                <input type="hidden" name="kidId" value={k.id} />
                <p className="small">This deletes {k.name}&apos;s chores, bonuses and payout history. It can&apos;t be undone.</p>
                <label htmlFor={`kr-${k.id}`} className="small">Type <strong>{k.name}</strong> to confirm</label>
                <input id={`kr-${k.id}`} name="confirm" className="text-input" autoComplete="off" />
                <Pending className="btn btn-danger">Remove {k.name}</Pending>
              </form>
            </details>
          </div>
        ))}

        <form action={addKid} className="add-box">
          <h3>Add a kid</h3>
          <div className="field">
            <label htmlFor="nk-name">Name</label>
            <input id="nk-name" name="name" className="text-input" maxLength={40} required />
          </div>
          <div className="field">
            <label htmlFor="nk-base">Weekly allowance</label>
            <span className="money-input money-input-lg">
              <span aria-hidden="true">$</span>
              <input id="nk-base" name="base" inputMode="decimal" defaultValue="10.00" required />
            </span>
          </div>
          <ColorPicker name="color" value={KID_COLORS.find((c) => !ctx.kids.some((k) => k.color === c))} idPrefix="nk" />
          <p className="muted small">They start with the default chores. Edit them on Chores &amp; money.</p>
          <Pending className="btn btn-solid">Add kid</Pending>
        </form>
      </section>

      <section className="panel" aria-labelledby="fam-parents">
        <h2 id="fam-parents">Parents</h2>
        <ul className="people">
          {parents.map((p) => (
            <li key={p.id}>
              <span>
                <strong>{p.name}</strong>
                {p.id === me.id && <span className="muted small"> (you)</span>}
                <span className="muted small break" style={{ display: "block" }}>{p.email}</span>
              </span>
              {p.id !== me.id && (
                <form action={removeParent}>
                  <input type="hidden" name="parentId" value={p.id} />
                  <Pending className="btn btn-small" aria-label={`Remove ${p.name}`}>Remove</Pending>
                </form>
              )}
            </li>
          ))}
        </ul>
        <form action={addParent} className="add-box">
          <h3>Add a parent</h3>
          <div className="field">
            <label htmlFor="np-name">Name</label>
            <input id="np-name" name="name" className="text-input" maxLength={40} required />
          </div>
          <div className="field">
            <label htmlFor="np-email">Email</label>
            <input id="np-email" name="email" type="email" className="text-input" autoComplete="off" required />
          </div>
          <div className="field">
            <label htmlFor="np-pw">Password for them</label>
            <input id="np-pw" name="password" type="text" className="text-input" minLength={8} autoComplete="off" required />
            <p className="muted small">At least 8 characters. They can change it after logging in.</p>
          </div>
          <Pending className="btn btn-solid">Add parent</Pending>
        </form>
      </section>

      <section className="panel" aria-labelledby="fam-pw">
        <h2 id="fam-pw">Your password</h2>
        <form action={changePassword} className="add-box" style={{ borderTop: 0, paddingTop: 0 }}>
          <div className="field">
            <label htmlFor="pw-cur">Current password</label>
            <input id="pw-cur" name="current" type="password" className="text-input" autoComplete="current-password" required />
          </div>
          <div className="field">
            <label htmlFor="pw-new">New password</label>
            <input id="pw-new" name="next" type="password" className="text-input" minLength={8} autoComplete="new-password" required />
          </div>
          <Pending className="btn">Change password</Pending>
        </form>
      </section>
    </>
  );
}
