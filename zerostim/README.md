# ZeroStim

Weekly allowance and chore tracker for families, based on the paper allowance charts.

- **Families**: each family has its own kids, chores, money rules, start date and history.
- **Parents** log in with email + password (several per family). They check chores, approve what kids mark, log deductions and bonuses, mark weeks paid, and change Settings (Chores & money, Family).
- **Kids** don't log in. Each kid has a private link (`/k/<token>`) where they check off today's chores and mark bonuses; nothing counts until a parent approves it. Opening a kid link remembers the family on that device, so `/` shows the family dashboard.
- **App manager (admin)** at `/admin` with `ADMIN_PASSWORD` (not linked anywhere): create families with their first parent and kids, add or reset parent logins, set defaults for new families (kids per family, weekly amount, chores, deductions, bonuses), delete families.
- **Penny**, the coin mascot, reacts like Duolingo's owl (`lib/penny.ts`).

## Money

Each week's chores add up to the kid's weekly amount. Each day gets an equal share, and each chore is a share of its day. When a day ends, chores not approved come off; today is never reduced while it's going. Approved bonuses add (weekly cap), deductions subtract. Rules are saved as weekly versions, so past weeks keep their rules.

## Run locally

Needs Postgres.

```bash
cd zerostim
npm install
DATABASE_URL=postgres://user:pass@localhost:5432/zerostim ADMIN_PASSWORD=admin npm run dev
```

Open http://localhost:3100/admin to create a family, then log in at /login.

## Deploy (Vercel + Neon)

Root Directory `zerostim`, a Neon Postgres database (sets `DATABASE_URL`), and the variables in `.env.example`. Tables are created and upgraded automatically on first use.

## Path to a mobile app

Installable as a home-screen web app today. Next: Capacitor (wrap this app) or Expo (native).
