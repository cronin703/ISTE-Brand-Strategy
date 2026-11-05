import { requireAdmin } from "@/lib/auth";
import { loadDefaults } from "@/lib/settings";
import { ListEditor } from "@/components/list-editor";
import { saveDefaults } from "../../actions";
import { Pending } from "../../ui";

const dollars = (c: number) => (c / 100).toFixed(2);

export default async function AdminDefaults({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const d = await loadDefaults();
  return (
    <>
      <div className="enter-1">
        <h1 className="history-title">Defaults</h1>
        <p className="muted" style={{ marginTop: 8 }}>What new families start with. Existing families keep their own settings.</p>
      </div>
      {sp.saved && <p className="notice notice-good" role="status">Defaults saved.</p>}
      {sp.error && <p className="notice notice-bad" role="alert">{sp.error}</p>}
      <form action={saveDefaults} className="settings">
        <section className="panel" aria-labelledby="df-kids">
          <h2 id="df-kids">Kids</h2>
          <div className="field">
            <label htmlFor="kidCount">Kids per new family</label>
            <select id="kidCount" name="kidCount" className="text-input" defaultValue={d.kidCount} style={{ maxWidth: 120 }}>
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="base">Weekly allowance per kid</label>
            <span className="money-input money-input-lg"><span aria-hidden="true">$</span><input id="base" name="base" inputMode="decimal" defaultValue={dollars(d.baseCents)} required /></span>
          </div>
        </section>
        <section className="panel" aria-labelledby="df-chores">
          <h2 id="df-chores">Daily chores</h2>
          <ListEditor prefix="chore" initial={d.chores.map((c) => ({ id: c.id, label: c.label }))} addLabel="Add a chore" itemName="chore" />
        </section>
        <section className="panel" aria-labelledby="df-ded">
          <h2 id="df-ded">Deductions</h2>
          <ListEditor prefix="ded" withAmount initial={d.deductions.map((x) => ({ id: x.id, label: x.label, amount: dollars(x.cents) }))} addLabel="Add a deduction" itemName="deduction" />
        </section>
        <section className="panel" aria-labelledby="df-bon">
          <h2 id="df-bon">Bonuses</h2>
          <ListEditor prefix="bon" withAmount initial={d.bonuses.map((x) => ({ id: x.id, label: x.label, amount: dollars(x.cents) }))} addLabel="Add a bonus" itemName="bonus" />
          <div className="field">
            <label htmlFor="bonusCap">Most bonus money per week</label>
            <span className="money-input money-input-lg"><span aria-hidden="true">$</span><input id="bonusCap" name="bonusCap" inputMode="decimal" defaultValue={dollars(d.bonusCapCents)} required /></span>
          </div>
        </section>
        <Pending className="btn btn-solid" style={{ width: "100%" }}>Save defaults</Pending>
      </form>
    </>
  );
}
