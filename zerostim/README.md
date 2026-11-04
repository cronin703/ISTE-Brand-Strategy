# ZeroStim

Weekly allowance tracker for Thomas and Carter, based on the paper allowance charts.

- **Parent** logs in with a password and manages each kid's week: check off daily chores, tally deductions and bonuses, mark the week paid.
- **Kids** pick their name and enter a PIN to see their own week (read-only). They can't see each other's page or the parent screens.
- **History** shows the last 8 weeks per kid: payout, chore completion %, and most common deductions.

Rules from the chart are built in: start amount ($15 Thomas / $10 Carter), bonuses capped at $3/week, payout never below $0, fresh start every Monday. Edit kids, chores, and amounts in `lib/family.ts`.

## Run locally

```bash
cd zerostim
npm install
npm run dev
```

Open http://localhost:3100. Dev logins: parent password `parent`, Thomas PIN `1111`, Carter PIN `2222`. Data is saved to `.data/db.json` (no database needed locally).

## Deploy (Vercel + Postgres)

1. In Vercel, create a new project from this repo and set **Root Directory** to `zerostim`.
2. Add a Postgres database (Storage tab → Neon). This sets `DATABASE_URL` automatically. Tables are created on first use.
3. Add environment variables (see `.env.example`): `PARENT_PASSWORD`, `KID_PIN_THOMAS`, `KID_PIN_CARTER`, `SESSION_SECRET` (`openssl rand -hex 32`), and `FAMILY_TZ` if you're not on Eastern time.
4. Deploy. On each phone, open the site and use **Add to Home Screen**; it opens full-screen like an app.

## How data is stored

Two tables. `entries` is an append-only log: one row per chore check, deduction, or bonus, with kid, date, and time. `payouts` records what was paid each week. Every number on screen is computed from the log, so new analytics can be added later without changing how data is collected.

## Path to a mobile app

The UI is mobile-first and installable as a home-screen web app today. Next step options:
- **Capacitor**: wrap this same web app as iOS/Android apps. Fastest; adds push notifications.
- **Expo (React Native)**: native app that calls the same data. More work, more native feel.
