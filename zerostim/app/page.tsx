import Link from "next/link";
import { KIDS, money } from "@/lib/family";
import { getSession } from "@/lib/auth";
import { dbConfigured } from "@/lib/db";
import { formatRange, formatShort, today, weekStart } from "@/lib/dates";
import { loadWeek } from "@/lib/load";
import { Logo } from "@/components/logo";
import { Avatar } from "@/components/avatar";
import { Mascot } from "@/components/mascot";
import { SetupNeeded } from "@/components/setup-needed";
import { approveAll } from "./actions";
import { Pending } from "./ui";

// The landing screen: both kids at a glance. Open to the family (no login);
// Mom's approve buttons only appear when she's logged in.
export default async function Dashboard() {
  if (!dbConfigured()) return <SetupNeeded />;
  const isMom = (await getSession())?.role === "parent";
  const t = today();
  const week = weekStart(t);
  const views = await Promise.all(KIDS.map((k) => loadWeek(k.id, week)));
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" }).format(new Date(`${t}T12:00:00Z`));

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

      <div className="enter-1">
        <h1 className="home-title">{weekday}</h1>
        <p className="muted" style={{ marginTop: 6 }}>{formatShort(t)}. Week of {formatRange(week)}.</p>
      </div>

      <div className="dash enter-2">
        {views.map(({ kid, summary: s, penny, paid }) => {
          const total = penny.todayTotal ?? 0;
          const done = (penny.todayDone ?? 0) - (penny.todayPending ?? 0);
          const pend = penny.todayPending ?? 0;
          const todays = kid.chores.map((c) => {
            const key = `${c.id}|${t}`;
            return { ...c, state: s.choreDone.has(key) ? "done" : s.chorePending.has(key) ? "pending" : "none" } as const;
          });
          return (
            <section key={kid.id} className="dash-card" data-kid={kid.id} aria-labelledby={`dash-${kid.id}`}>
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

              <div className="dash-money">
                <div>
                  <p className="dash-label">This week so far {paid && <span className="paid-chip">Paid</span>}</p>
                  <p className="display dash-amount">{money(s.payoutCents)}</p>
                </div>
                <dl className="dash-math">
                  <div><dt>Start</dt><dd>{money(s.baseCents)}</dd></div>
                  <div><dt>Lost</dt><dd className="amt minus">{s.deductionCents ? `-${money(s.deductionCents)}` : "$0.00"}</dd></div>
                  <div><dt>Bonus</dt><dd className="amt plus">+{money(s.bonusCents)}</dd></div>
                </dl>
              </div>

              <div className="dash-today">
                <p className="dash-label">
                  Today: {done} of {total} signed off{pend ? `, ${pend} waiting for Mom or Dad` : ""}
                </p>
                <div
                  className="dash-bar"
                  role="img"
                  aria-label={`${done} of ${total} chores signed off today, ${pend} waiting for Mom or Dad`}
                >
                  <span className="bar-done" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
                  <span className="bar-pending" style={{ width: `${total ? (pend / total) * 100 : 0}%` }} />
                </div>
                <ul className="dash-list">
                  {todays.map((c) => (
                    <li key={c.id} className={`is-${c.state}`}>
                      <span className="dash-icon" aria-hidden="true">{c.state === "done" ? "✓" : c.state === "pending" ? "…" : ""}</span>
                      <span>{c.label}</span>
                      <span className="sr-only">: {c.state === "done" ? "done" : c.state === "pending" ? "waiting for Mom or Dad" : "to do"}</span>
                    </li>
                  ))}
                </ul>
              </div>

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
            </section>
          );
        })}
      </div>
    </main>
  );
}
