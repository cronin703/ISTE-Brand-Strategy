# ZeroStim

Weekly allowance tracker for Thomas and Carter, based on the paper allowance charts.

- **Parent** logs in with a password and manages each kid's week: check off daily chores, tally deductions and bonuses, mark the week paid.
- **Kids** tap their name to see their week (read-only, no login). Anyone with a kid's link can view it; only the parent can change anything.
- **Penny**, the coin mascot, reacts like Duolingo's owl: proud on a streak, nagging when chores are left, grumpy in the evening, sad when money is lost, and pointed when a kid hasn't opened the app in 2+ days. Logic lives in `lib/penny.ts`.
- **History** shows the last 8 weeks per kid: payout, chore completion %, and most common deductions.

Rules from the chart are built in as defaults (Thomas $10, Carter $15, bonuses capped at $3/week, payout never below $0, fresh balance every Monday). The parent changes amounts, chores, deductions and bonuses on the Settings page, for this week or next; past weeks keep their rules.

## Run locally

```bash
cd zerostim
npm install
npm run dev
```

Open http://localhost:3100. Dev parent password: `parent`. Data is saved to `.data/db.json` (no database needed locally).

## Deploy (Vercel + Postgres)

1. In Vercel, create a new project from this repo and set **Root Directory** to `zerostim`.
2. Add a Postgres database (Storage tab → Neon). This sets `DATABASE_URL` automatically. Tables are created on first use.
3. Add environment variables (see `.env.example`): `PARENT_PASSWORD`, `SESSION_SECRET` (`openssl rand -hex 32`), and `FAMILY_TZ` if you're not on Eastern time.
4. Deploy. On each phone, open the site and use **Add to Home Screen**; it opens full-screen like an app.

## How data is stored

Two tables. `entries` is an append-only log: one row per chore check, deduction, or bonus, with kid, date, and time. `payouts` records what was paid each week. Every number on screen is computed from the log, so new analytics can be added later without changing how data is collected.

## Path to a mobile app

The UI is mobile-first and installable as a home-screen web app today. Next step options:
- **Capacitor**: wrap this same web app as iOS/Android apps. Fastest; adds push notifications.
- **Expo (React Native)**: native app that calls the same data. More work, more native feel.
