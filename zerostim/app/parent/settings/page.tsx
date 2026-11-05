import { KIDS, money, type Item } from "@/lib/family";
import { addDays, formatRange, today, weekStart } from "@/lib/dates";
import { kidIn, loadSettingsBook } from "@/lib/settings";
import { Avatar } from "@/components/avatar";
import { saveSettings } from "../../actions";
import { Pending } from "../../ui";

const dollars = (c: number) => (c / 100).toFixed(2);

function ItemRows({ prefix, items, blanks }: { prefix: string; items: Item[]; blanks: number }) {
  const rows = [...items, ...Array.from({ length: blanks }, () => ({ id: "", label: "", cents: 0 }))];
  return (
    <div className="item-rows">
      <input type="hidden" name={`${prefix}_count`} value={rows.length} />
      <div className="item-row item-row-head" aria-hidden="true">
        <span>What</span>
        <span>Amount</span>
      </div>
      {rows.map((it, i) => (
        <div className="item-row" key={`${prefix}-${i}`}>
          <input type="hidden" name={`${prefix}_id_${i}`} value={it.id} />
          <label className="sr-only" htmlFor={`${prefix}_label_${i}`}>Name for line {i + 1}</label>
          <input
            id={`${prefix}_label_${i}`}
            name={`${prefix}_label_${i}`}
            defaultValue={it.label}
            placeholder={it.id ? "" : "Add another"}
            maxLength={80}
          />
          <label className="sr-only" htmlFor={`${prefix}_amt_${i}`}>Amount for item {i + 1}</label>
          <span className="money-input">
            <span aria-hidden="true">$</span>
            <input
              id={`${prefix}_amt_${i}`}
              name={`${prefix}_amt_${i}`}
              inputMode="decimal"
              defaultValue={it.id ? dollars(it.cents) : ""}
              placeholder="0.00"
            />
          </span>
        </div>
      ))}
      <p className="muted small">Clear a name to remove that line.</p>
    </div>
  );
}

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const sp = await searchParams;
  const current = weekStart(today());
  const next = addDays(current, 7);
  const book = await loadSettingsBook();
  // Show what applies going forward: next week's version if one is scheduled.
  const showing = book.latestWeek && book.latestWeek > current ? next : current;
  const s = book.at(showing);

  return (
    <div data-world="parent" style={{ display: "contents" }}>
      <div className="enter-1">
        <h1 className="history-title">Settings</h1>
        <p className="muted" style={{ marginTop: 8 }}>Set amounts and chores before the week starts. Past weeks keep the rules they had.</p>
      </div>

      {sp.saved && (
        <p className="notice notice-good" role="status">Saved. These rules apply from the week of {formatRange(sp.saved)}.</p>
      )}
      {sp.error && <p className="notice notice-bad" role="alert">{sp.error}</p>}
      {showing === next && !sp.saved && (
        <p className="notice">You&apos;re seeing next week&apos;s rules ({formatRange(next)}). This week still uses the earlier ones.</p>
      )}

      <form action={saveSettings} className="settings">
        {KIDS.map((k) => {
          const kid = kidIn(s, k.id)!;
          return (
            <section key={k.id} className="panel" data-kid={k.id} aria-labelledby={`set-${k.id}`}>
              <div className="share-head">
                <Avatar id={k.id} name={k.name} size={40} />
                <h2 id={`set-${k.id}`}>{k.name}</h2>
              </div>
              <div className="field">
                <label htmlFor={`base_${k.id}`}>Starting allowance each week</label>
                <span className="money-input money-input-lg">
                  <span aria-hidden="true">$</span>
                  <input id={`base_${k.id}`} name={`base_${k.id}`} inputMode="decimal" defaultValue={dollars(kid.baseCents)} required />
                </span>
              </div>
              <div className="field">
                <label htmlFor={`chores_${k.id}`}>Daily chores</label>
                <textarea id={`chores_${k.id}`} name={`chores_${k.id}`} rows={kid.chores.length + 1} defaultValue={kid.chores.map((c) => c.label).join("\n")} />
                <p className="muted small">One chore per line.</p>
              </div>
            </section>
          );
        })}

        <section className="panel" aria-labelledby="set-ded">
          <h2 id="set-ded">Deductions</h2>
          <ItemRows prefix="ded" items={s.deductions} blanks={2} />
        </section>

        <section className="panel" aria-labelledby="set-bon">
          <h2 id="set-bon">Bonuses</h2>
          <ItemRows prefix="bon" items={s.bonuses} blanks={2} />
          <div className="field">
            <label htmlFor="bonusCap">Most bonus money a kid can earn in a week</label>
            <span className="money-input money-input-lg">
              <span aria-hidden="true">$</span>
              <input id="bonusCap" name="bonusCap" inputMode="decimal" defaultValue={dollars(s.bonusCapCents)} required />
            </span>
          </div>
        </section>

        <section className="panel save-bar" aria-labelledby="set-apply">
          <h2 id="set-apply">When should this start?</h2>
          <div className="choice">
            <label>
              <input type="radio" name="applyFrom" value="this" defaultChecked={showing === current} />
              <span><strong>This week</strong><span className="muted small">{formatRange(current)}. Updates this week&apos;s payout now.</span></span>
            </label>
            <label>
              <input type="radio" name="applyFrom" value="next" defaultChecked={showing === next} />
              <span><strong>Next week</strong><span className="muted small">{formatRange(next)}. This week stays as is.</span></span>
            </label>
          </div>
          <Pending className="btn btn-solid" style={{ width: "100%" }}>Save settings</Pending>
          <p className="muted small">Starting amounts now: {KIDS.map((k) => `${k.name} ${money(kidIn(s, k.id)!.baseCents)}`).join(", ")}.</p>
        </section>
      </form>
    </div>
  );
}
