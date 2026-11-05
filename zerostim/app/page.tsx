import Link from "next/link";
import { money } from "@/lib/family";
import { currentParent, deviceFamily } from "@/lib/auth";
import { dbConfigured, type KidRow } from "@/lib/db";
import { addDays, DAY_SHORT, formatRange, formatShort, today, weekStart } from "@/lib/dates";
import { loadFamily, loadWeek, type FamilyCtx, type WeekView } from "@/lib/load";
import { Logo } from "@/components/logo";
import { Avatar } from "@/components/avatar";
import { Mascot } from "@/components/mascot";
import { SetupNeeded } from "@/components/setup-needed";
import { approveAll } from "./actions";
import { BonusRow, ChoreRow, Pending } from "./ui";
import { PushToggle } from "@/components/push-toggle";
import { vapidPublicKey } from "@/lib/push";

// The landing screen: both kids at a glance, by day, week or month.
// Open to the family (no login); approve buttons only show for Mom or Dad.

type View = "day" | "week" | "month";
const VIEWS: { id: View; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

const longDate = (d: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { ...opts, timeZone: "UTC" }).format(new Date(`${d}T12:00:00Z`));

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  if (!dbConfigured()) return <SetupNeeded />;
  const sp = await searchParams;
  const view: View = sp.view === "week" || sp.view === "month" ? sp.view : "day";
  const me = await currentParent();
  const isMom = Boolean(me);
  const family = me?.family ?? (await deviceFamily());
  if (!family) return <Welcome />;
  const ctx = await loadFamily(family);
  const t = today();
  const week = weekStart(t);
  const views = await Promise.all(ctx.kids.map((k) => loadWeek(ctx, k, week)));
  const TRACKING_START = family.trackingStart;
  const beforeStart = t < TRACKING_START;

  const title =
    view === "day" ? longDate(t, { weekday: "long" }) : view === "week" ? "This week" : longDate(t, { month: "long" });
  const sub =
    view === "day"
      ? `${formatShort(t)}. Week of ${formatRange(week)}.`
      : view === "week"
        ? `${formatRange(week)}. Fresh start every Monday.`
        : longDate(t, { year: "numeric" });

  return (
    <main className="page" data-world="parent">
      <header className="topbar topbar-dash">
        <Logo />
        <nav className="seg seg-bar" aria-label="Dashboard view">
          {VIEWS.map((v) => (
            <Link key={v.id} href={v.id === "day" ? "/" : `/?view=${v.id}`} aria-current={v.id === view ? "page" : undefined}>
              {v.label}
            </Link>
          ))}
        </nav>
        {isMom ? (
          <Link href="/parent" className="btn btn-solid">Manage</Link>
        ) : (
          <Link href="/login" className="btn">Mom or Dad</Link>
        )}
      </header>

      <div className="enter-1 dash-title">
        <h1 className="home-title">{title}</h1>
        <p className="muted">{sub}</p>
      </div>

      {beforeStart && (
        <p className="notice">
          ZeroStim starts {addDays(t, 1) === TRACKING_START ? "tomorrow morning" : `on ${formatShort(TRACKING_START)}`}. Nothing counts until then.
        </p>
      )}

      {isMom && <PushToggle vapidKey={vapidPublicKey()} compact />}

      {views.length === 0 && (
        <p className="notice">No kids yet. {isMom ? "Add them in Settings." : "Ask Mom or Dad to add you."}</p>
      )}

      <div className="dash enter-2">
        {view === "day" && views.map((v) => <DayCard key={v.kid.id} v={v} t={t} isMom={isMom} week={week} />)}
        {view === "week" && views.map((v) => <WeekCard key={v.kid.id} v={v} t={t} isMom={isMom} week={week} />)}
        {view === "month" && (await Promise.all(ctx.kids.map((k) => loadMonth(ctx, k, t)))).map((m) => <MonthCard key={m.kidId} m={m} t={t} />)}
      </div>
    </main>
  );
}

function CardHead({ v }: { v: WeekView }) {
  const { kid, penny } = v;
  return (
    <>
      <div className="dash-top">
        <div className="dash-who">
          <Avatar color={kid.color} name={kid.name} size={44} />
          <div>
            <h2 id={`dash-${kid.id}`} className="display dash-name">{kid.name}</h2>
            {(penny.streak ?? 0) > 0 && <span className="streak-chip">{penny.streak}-day streak</span>}
          </div>
        </div>
        <Mascot mood={penny.mood} size={64} className="mascot" />
      </div>
      <p className={`penny-says penny-${penny.mood}`}>
        <span className="sr-only">Penny says: </span>
        {penny.line}
      </p>
    </>
  );
}

function Money({ v }: { v: WeekView }) {
  const s = v.summary;
  return (
    <div className="dash-money">
      <div>
        <p className="dash-label">On track this week {v.paid && <span className="paid-chip">Paid</span>}</p>
        <p className="display dash-amount">{money(s.payoutCents)}</p>
      </div>
      <dl className="dash-math">
        <div><dt>Start</dt><dd>{money(s.startCents)}</dd></div>
        <div><dt>Missed</dt><dd className="amt minus">{s.missedCents ? `-${money(s.missedCents)}` : "$0.00"}</dd></div>
        <div><dt>Lost</dt><dd className="amt minus">{s.deductionCents ? `-${money(s.deductionCents)}` : "$0.00"}</dd></div>
        <div><dt>Bonus</dt><dd className="amt plus">+{money(s.bonusCents)}</dd></div>
      </dl>
    </div>
  );
}

function Actions({ v, isMom, week }: { v: WeekView; isMom: boolean; week: string }) {
  const { kid, summary: s } = v;
  return (
    <div className="dash-actions">
      <Link href={isMom ? `/kid/${kid.id}` : `/k/${kid.token}`} prefetch={false} className="btn btn-solid">
        {isMom ? `Open ${kid.name}'s page` : `I'm ${kid.name}`}
      </Link>
      {isMom && s.pendingCount > 0 && (
        <form action={approveAll}>
          <input type="hidden" name="kidId" value={kid.id} />
          <input type="hidden" name="week" value={week} />
          <Pending className="btn">Approve {s.pendingCount}</Pending>
        </form>
      )}
    </div>
  );
}

function DayCard({ v, t, isMom, week }: { v: WeekView; t: string; isMom: boolean; week: string }) {
  const { kid, summary: s, rules } = v;
  const day = s.days.find((d) => d.date === t)!;
  const as = isMom ? "mom" : "kid";
  const started = day.active;
  const choreFields = (choreId: string): Record<string, string> =>
    isMom ? { kidId: kid.id, week, date: t, choreId } : { kidToken: kid.token, choreId };
  return (
    <section className="dash-card" data-kid={kid.color} aria-labelledby={`dash-${kid.id}`}>
      <div className="dash-col">
        <CardHead v={v} />
        <Money v={v} />
        {rules.bonuses.length > 0 && (
          <div className="dash-bonuses">
            <p className="dash-label">Bonuses <span className="muted">(up to {money(s.bonusCapCents)} a week)</span></p>
            <ul className="bonus-list">
              {rules.bonuses.map((b) => (
                <BonusRow
                  key={b.id}
                  as={as}
                  label={b.label}
                  amount={money(b.cents)}
                  approved={s.tallies[`bonus|${b.id}`] ?? 0}
                  waiting={s.pendingTallies[`bonus|${b.id}`] ?? 0}
                  fields={(isMom ? { kidId: kid.id, week, kind: "bonus", itemId: b.id } : { kidToken: kid.token, itemId: b.id }) as Record<string, string>}
                  disabled={!started}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="dash-col">
        <div className="dash-today">
          <p className="dash-label">
            {started
              ? `Today: ${day.approved} of ${day.total} signed off${day.pending ? `, ${day.pending} waiting for Mom or Dad` : ""}`
              : "Today doesn't count yet"}
          </p>
          {started && (
            <p className="small">
              Keeping <strong>{money(Math.round(day.keptCents))}</strong> of today&apos;s {money(Math.round(day.dailyCents))} so far.
              {isMom ? " Tap a chore to approve it." : " Tap a chore when it's done."}
            </p>
          )}
          <div className="dash-bar" role="img" aria-label={`${day.approved} of ${day.total} chores signed off today, ${day.pending} waiting`}>
            <span className="bar-done" style={{ width: `${day.total ? (day.approved / day.total) * 100 : 0}%` }} />
            <span className="bar-pending" style={{ width: `${day.total ? (day.pending / day.total) * 100 : 0}%` }} />
          </div>
          <ul className="dash-list" aria-label={`${kid.name}'s chores today`}>
            {kid.chores.map((c) => {
              const key = `${c.id}|${t}`;
              const state = s.choreDone.has(key) ? "done" : s.chorePending.has(key) ? "pending" : "none";
              return <ChoreRow key={c.id} as={as} state={state} label={c.label} fields={choreFields(c.id)} disabled={!started} />;
            })}
          </ul>
        </div>
        <Actions v={v} isMom={isMom} week={week} />
      </div>
    </section>
  );
}

function WeekCard({ v, t, isMom, week }: { v: WeekView; t: string; isMom: boolean; week: string }) {
  const { kid, summary: s } = v;
  return (
    <section className="dash-card" data-kid={kid.color} aria-labelledby={`dash-${kid.id}`}>
      <div className="dash-col">
        <CardHead v={v} />
        <Money v={v} />
      </div>
      <div className="dash-col">
      <div className="week-strip" role="list" aria-label={`${kid.name}'s days this week`}>
        {s.days.map((d, i) => {
          const label = !d.active
            ? "before start"
            : d.status === "future"
              ? "coming up"
              : `${d.approved} of ${d.total} signed off${d.pending ? `, ${d.pending} waiting` : ""}, kept ${money(Math.round(d.keptCents))}`;
          const ratio = d.total ? d.approved / d.total : 0;
          return (
            <div key={d.date} role="listitem" className={`ws-day ws-${d.status}${d.date === t ? " ws-today" : ""}`} aria-label={`${DAY_SHORT[i]}: ${label}`}>
              <span className="ws-name" aria-hidden="true">{DAY_SHORT[i]}</span>
              <span className="ws-fill" aria-hidden="true">
                <span style={{ transform: `scaleY(${d.active && d.status !== "future" ? ratio : 0})` }} />
              </span>
              <span className="ws-money" aria-hidden="true">
                {!d.active ? "–" : d.status === "future" ? "" : money(Math.round(d.keptCents)).replace(".00", "")}
              </span>
            </div>
          );
        })}
      </div>
      <p className="muted small">
        {s.choresDone} of {s.choresPossible} chores signed off so far.
        {s.pendingCount ? ` ${s.pendingCount} waiting for Mom or Dad.` : ""}
      </p>
      <Actions v={v} isMom={isMom} week={week} />
      </div>
    </section>
  );
}

/* ---------------- Month ---------------- */

type MonthData = {
  kidId: string;
  color: KidRow["color"];
  token: string;
  name: string;
  firstWeekday: number; // 0 = Monday
  days: { date: string; active: boolean; ratio: number; status: string }[];
  weeks: { start: string; payoutCents: number; startCents: number; future: boolean }[];
  earnedCents: number;
  fullDays: number;
  activeDays: number;
};

async function loadMonth(ctx: FamilyCtx, row: KidRow, t: string): Promise<MonthData> {
  const first = `${t.slice(0, 8)}01`;
  const next = new Date(`${first}T12:00:00Z`);
  next.setUTCMonth(next.getUTCMonth() + 1);
  const last = addDays(next.toISOString().slice(0, 10), -1);
  const weekStarts: string[] = [];
  for (let w = weekStart(first); w <= last; w = addDays(w, 7)) weekStarts.push(w);
  const loaded = await Promise.all(weekStarts.map((w) => loadWeek(ctx, row, w)));
  const days = loaded
    .flatMap((v) => v.summary.days)
    .filter((d) => d.date >= first && d.date <= last)
    .map((d) => ({ date: d.date, active: d.active, status: d.status, ratio: d.total ? d.approved / d.total : 0 }));
  const counted = days.filter((d) => d.active && (d.status === "past" || d.status === "today"));
  return {
    kidId: row.id,
    color: row.color,
    token: row.token,
    name: row.name,
    firstWeekday: (new Date(`${first}T12:00:00Z`).getUTCDay() + 6) % 7,
    days,
    weeks: loaded
      .map((v) => ({
        start: v.summary.weekStart,
        payoutCents: v.summary.payoutCents,
        startCents: v.summary.startCents,
        future: v.summary.weekStart > weekStart(t),
      }))
      .filter((w) => w.start >= first),
    // Only weeks that have started; future weeks aren't earned yet.
    earnedCents: loaded
      .filter((v) => v.summary.weekStart >= first && v.summary.weekStart <= weekStart(t))
      .reduce((s, v) => s + v.summary.payoutCents, 0),
    fullDays: counted.filter((d) => d.ratio === 1).length,
    activeDays: counted.length,
  };
}

function MonthCard({ m, t }: { m: MonthData; t: string }) {
  return (
    <section className="dash-card" data-kid={m.color} aria-labelledby={`dash-${m.kidId}`}>
      <div className="dash-col">
      <div className="dash-who">
        <Avatar color={m.color} name={m.name} size={44} />
        <h2 id={`dash-${m.kidId}`} className="display dash-name">{m.name}</h2>
      </div>
      <dl className="dash-math dash-math-2">
        <div><dt>This month so far</dt><dd>{money(m.earnedCents)}</dd></div>
        <div><dt>Perfect days</dt><dd>{m.fullDays} of {m.activeDays}</dd></div>
      </dl>
      </div>
      <div className="dash-col">
      <div className="cal" aria-hidden="true">
        {DAY_SHORT.map((d) => <span key={d} className="cal-head">{d}</span>)}
        {Array.from({ length: m.firstWeekday }, (_, i) => <span key={`pad-${i}`} />)}
        {m.days.map((d) => (
          <span
            key={d.date}
            className={`cal-day${d.date === t ? " cal-today" : ""}${!d.active || d.status === "future" ? " cal-off" : ""}`}
            style={{ ["--r" as string]: d.active && d.status !== "future" ? d.ratio : 0 }}
          >
            {Number(d.date.slice(8))}
          </span>
        ))}
      </div>
      <p className="sr-only">
        {m.name} had {m.fullDays} perfect days out of {m.activeDays} so far this month and earned {money(m.earnedCents)}.
      </p>
      <ul className="month-weeks">
        {m.weeks.map((w) => (
          <li key={w.start}>
            <span>Week of {formatShort(w.start)}</span>
            <span className={w.future ? "muted" : undefined}>
              {w.future ? "Coming up" : w.startCents ? `${money(w.payoutCents)} of ${money(w.startCents)}` : "Before start"}
            </span>
          </li>
        ))}
      </ul>
      <Link href={`/k/${m.token}`} prefetch={false} className="btn btn-solid">Open {m.name}&apos;s page</Link>
      </div>
    </section>
  );
}

/** No family on this device yet: point grown-ups to log in and kids to their link. */
function Welcome() {
  return (
    <main className="page" data-world="parent">
      <header className="topbar">
        <Logo />
        <Link href="/login" className="btn btn-solid">Log in</Link>
      </header>
      <section className="login-hero enter-1">
        <div style={{ flex: 1 }}>
          <h1 className="display">ZeroStim</h1>
          <p>Chores, allowance and a coin named Penny who notices everything.</p>
        </div>
        <Mascot size={88} mood="great" className="mascot" />
      </section>
      <section className="panel enter-2">
        <h2>Mom or Dad</h2>
        <p className="muted">Log in with your email to set up chores and approve them.</p>
        <Link href="/login" className="btn btn-solid">Log in</Link>
      </section>
      <section className="panel enter-2">
        <h2>Kids</h2>
        <p className="muted">Open the link Mom or Dad sent you. After that, this phone remembers your family.</p>
      </section>
    </main>
  );
}
