import Link from "next/link";
import { KIDS, money } from "@/lib/family";
import { getSession } from "@/lib/auth";
import { dbConfigured } from "@/lib/db";
import { addDays, DAY_SHORT, formatRange, formatShort, today, weekStart } from "@/lib/dates";
import { loadWeek, type WeekView } from "@/lib/load";
import { Logo } from "@/components/logo";
import { Avatar } from "@/components/avatar";
import { Mascot } from "@/components/mascot";
import { SetupNeeded } from "@/components/setup-needed";
import { approveAll } from "./actions";
import { Pending } from "./ui";

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
  const isMom = (await getSession())?.role === "parent";
  const t = today();
  const week = weekStart(t);
  const views = await Promise.all(KIDS.map((k) => loadWeek(k.id, week)));
  const TRACKING_START = views[0].summary.trackingStart;
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
      <header className="topbar">
        <Logo />
        {isMom ? (
          <Link href="/parent" className="btn btn-solid">Manage</Link>
        ) : (
          <Link href="/login" className="btn">Mom or Dad</Link>
        )}
      </header>

      <nav className="seg" aria-label="Dashboard view">
        {VIEWS.map((v) => (
          <Link key={v.id} href={v.id === "day" ? "/" : `/?view=${v.id}`} aria-current={v.id === view ? "page" : undefined}>
            {v.label}
          </Link>
        ))}
      </nav>

      <div className="enter-1">
        <h1 className="home-title">{title}</h1>
        <p className="muted" style={{ marginTop: 6 }}>{sub}</p>
      </div>

      {beforeStart && (
        <p className="notice">
          ZeroStim starts {addDays(t, 1) === TRACKING_START ? "tomorrow morning" : `on ${formatShort(TRACKING_START)}`}. Nothing counts until then.
        </p>
      )}

      <div className="dash enter-2">
        {view === "day" && views.map((v) => <DayCard key={v.kid.id} v={v} t={t} isMom={isMom} week={week} />)}
        {view === "week" && views.map((v) => <WeekCard key={v.kid.id} v={v} t={t} isMom={isMom} week={week} />)}
        {view === "month" && (await Promise.all(KIDS.map((k) => loadMonth(k.id, t)))).map((m) => <MonthCard key={m.kidId} m={m} t={t} />)}
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
          <Avatar id={kid.id} name={kid.name} size={44} />
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
      <Link href={`/kid/${kid.id}`} prefetch={false} className="btn btn-solid">
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
  const todays = kid.chores.map((c) => {
    const key = `${c.id}|${t}`;
    return { ...c, state: s.choreDone.has(key) ? "done" : s.chorePending.has(key) ? "pending" : "none" } as const;
  });
  const bonusesWaiting = s.pendingItems.filter((p) => p.kind === "bonus" && p.date === t);
  return (
    <section className="dash-card" data-kid={kid.id} aria-labelledby={`dash-${kid.id}`}>
      <CardHead v={v} />
      <Money v={v} />
      <div className="dash-today">
        <p className="dash-label">
          {day.active
            ? `Today: ${day.approved} of ${day.total} signed off${day.pending ? `, ${day.pending} waiting for Mom or Dad` : ""}`
            : "Today doesn't count yet"}
        </p>
        {day.active && (
          <p className="small">
            Keeping <strong>{money(Math.round(day.keptCents))}</strong> of today&apos;s {money(Math.round(day.dailyCents))} so far.
          </p>
        )}
        <div className="dash-bar" role="img" aria-label={`${day.approved} of ${day.total} chores signed off today, ${day.pending} waiting`}>
          <span className="bar-done" style={{ width: `${day.total ? (day.approved / day.total) * 100 : 0}%` }} />
          <span className="bar-pending" style={{ width: `${day.total ? (day.pending / day.total) * 100 : 0}%` }} />
        </div>
        <ul className="dash-list">
          {todays.map((c) => (
            <li key={c.id} className={`is-${c.state}`}>
              <span className="dash-icon" aria-hidden="true">{c.state === "done" ? "✓" : c.state === "pending" ? "…" : ""}</span>
              <span>{c.label}</span>
              <span className="sr-only">: {c.state === "done" ? "done" : c.state === "pending" ? "waiting for Mom or Dad" : "to do"}</span>
            </li>
          ))}
          {bonusesWaiting.map((b) => (
            <li key={b.id} className="is-pending">
              <span className="dash-icon" aria-hidden="true">+</span>
              <span>Bonus: {rules.bonuses.find((x) => x.id === b.itemId)?.label}</span>
              <span className="sr-only">: waiting for Mom or Dad</span>
            </li>
          ))}
        </ul>
      </div>
      <Actions v={v} isMom={isMom} week={week} />
    </section>
  );
}

function WeekCard({ v, t, isMom, week }: { v: WeekView; t: string; isMom: boolean; week: string }) {
  const { kid, summary: s } = v;
  return (
    <section className="dash-card" data-kid={kid.id} aria-labelledby={`dash-${kid.id}`}>
      <CardHead v={v} />
      <Money v={v} />
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
    </section>
  );
}

/* ---------------- Month ---------------- */

type MonthData = {
  kidId: string;
  name: string;
  firstWeekday: number; // 0 = Monday
  days: { date: string; active: boolean; ratio: number; status: string }[];
  weeks: { start: string; payoutCents: number; startCents: number; future: boolean }[];
  earnedCents: number;
  fullDays: number;
  activeDays: number;
};

async function loadMonth(kidId: string, t: string): Promise<MonthData> {
  const first = `${t.slice(0, 8)}01`;
  const next = new Date(`${first}T12:00:00Z`);
  next.setUTCMonth(next.getUTCMonth() + 1);
  const last = addDays(next.toISOString().slice(0, 10), -1);
  const weekStarts: string[] = [];
  for (let w = weekStart(first); w <= last; w = addDays(w, 7)) weekStarts.push(w);
  const loaded = await Promise.all(weekStarts.map((w) => loadWeek(kidId, w)));
  const days = loaded
    .flatMap((v) => v.summary.days)
    .filter((d) => d.date >= first && d.date <= last)
    .map((d) => ({ date: d.date, active: d.active, status: d.status, ratio: d.total ? d.approved / d.total : 0 }));
  const counted = days.filter((d) => d.active && (d.status === "past" || d.status === "today"));
  return {
    kidId,
    name: loaded[0].kid.name,
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
    <section className="dash-card" data-kid={m.kidId} aria-labelledby={`dash-${m.kidId}`}>
      <div className="dash-who">
        <Avatar id={m.kidId} name={m.name} size={44} />
        <h2 id={`dash-${m.kidId}`} className="display dash-name">{m.name}</h2>
      </div>
      <dl className="dash-math dash-math-2">
        <div><dt>This month so far</dt><dd>{money(m.earnedCents)}</dd></div>
        <div><dt>Perfect days</dt><dd>{m.fullDays} of {m.activeDays}</dd></div>
      </dl>
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
      <Link href={`/kid/${m.kidId}`} prefetch={false} className="btn btn-solid">Open {m.name}&apos;s page</Link>
    </section>
  );
}
