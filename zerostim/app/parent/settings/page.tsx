import { KIDS, money } from "@/lib/family";
import { addDays, formatRange, today, weekStart } from "@/lib/dates";
import { kidIn, loadSettingsBook } from "@/lib/settings";
import { Avatar } from "@/components/avatar";
import { saveSettings } from "../../actions";
import { Pending } from "../../ui";
import { ListEditor } from "@/components/list-editor";

const dollars = (c: number) => (c / 100).toFixed(2);
const longDay = (d: string) =>
  new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${d}T12:00:00Z`));

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
        <section className="panel" aria-labelledby="set-start">
          <h2 id="set-start">Start date</h2>
          <div className="field">
            <label htmlFor="startDate">First day that counts</label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              className="date-input"
              defaultValue={book.trackingStart}
              required
            />
            <p className="muted small">
              {book.trackingStart > current
                ? `ZeroStim starts ${longDay(book.trackingStart)}. Nothing counts before then, and Penny won't nag.`
                : `Counting since ${longDay(book.trackingStart)}. Days before this don't count.`}{" "}
              If the first week is short, its chores still add up to the full weekly amount.
            </p>
          </div>
        </section>

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
                <p className="muted small">All the week&apos;s chores add up to this. That&apos;s {money(Math.round(kid.baseCents / 7))} a day, or {money(Math.round(kid.baseCents / 7 / Math.max(1, kid.chores.length)))} per chore. Anything not signed off comes off.</p>
              </div>
              <div className="field">
                <span className="field-label" id={`chores-l-${k.id}`}>Daily chores</span>
                <ListEditor
                  prefix={`chore_${k.id}`}
                  initial={kid.chores.map((c) => ({ id: c.id, label: c.label }))}
                  addLabel="Add a chore"
                  itemName="chore"
                />
              </div>
            </section>
          );
        })}

        <section className="panel" aria-labelledby="set-ded">
          <h2 id="set-ded">Deductions</h2>
          <ListEditor prefix="ded" withAmount initial={s.deductions.map((d) => ({ id: d.id, label: d.label, amount: dollars(d.cents) }))} addLabel="Add a deduction" itemName="deduction" />
        </section>

        <section className="panel" aria-labelledby="set-bon">
          <h2 id="set-bon">Bonuses</h2>
          <ListEditor prefix="bon" withAmount initial={s.bonuses.map((b) => ({ id: b.id, label: b.label, amount: dollars(b.cents) }))} addLabel="Add a bonus" itemName="bonus" />
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
