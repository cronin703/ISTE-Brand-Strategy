import { NextResponse, type NextRequest } from "next/server";
import { db, dbConfigured } from "@/lib/db";
import { money } from "@/lib/family";
import { today, weekStart } from "@/lib/dates";
import { loadFamily, loadWeek } from "@/lib/load";
import { notifyFamily } from "@/lib/push";

// Evening wrap-up (Vercel Cron, ~8pm Eastern): tells each family's parents what's
// still waiting for review today. Sends nothing when nothing is waiting.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!dbConfigured()) return NextResponse.json({ sent: 0 });
  const t = today();
  let sent = 0;
  for (const f of await db().listFamilies()) {
    const family = await db().getFamily(f.id);
    if (!family || t < family.trackingStart) continue;
    const ctx = await loadFamily(family);
    const lines: string[] = [];
    for (const k of ctx.kids) {
      const v = await loadWeek(ctx, k, weekStart(t));
      const items = v.summary.pendingItems.filter((p) => p.date === t);
      const chores = items.filter((p) => p.kind === "chore").length;
      const bonuses = items.filter((p) => p.kind === "bonus");
      const bonusCents = bonuses.reduce((n, b) => n + (v.rules.bonuses.find((x) => x.id === b.itemId)?.cents ?? 0), 0);
      if (!chores && !bonuses.length) continue;
      const parts = [chores && `${chores} ${chores === 1 ? "chore" : "chores"}`, bonuses.length && `${bonuses.length} ${bonuses.length === 1 ? "bonus" : "bonuses"} (+${money(bonusCents)})`].filter(Boolean);
      lines.push(`${k.name}: ${parts.join(", ")}`);
    }
    if (!lines.length || !(await db().once(`notify:digest:${family.id}:${t}`))) continue;
    sent += await notifyFamily(family.id, { title: "Ready for review", body: lines.join("\n"), url: "/", tag: `digest-${t}` });
  }
  return NextResponse.json({ sent });
}
