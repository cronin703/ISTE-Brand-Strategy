import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db, dbConfigured } from "@/lib/db";
import { today, weekStart } from "@/lib/dates";
import { loadFamily, loadWeek } from "@/lib/load";
import { currentParent } from "@/lib/auth";
import { KidView } from "@/components/kid-view";
import { SetupNeeded } from "@/components/setup-needed";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// A kid's private link. No login; anyone with the link can see (not change) the week.
export default async function KidLinkPage({ params }: { params: Promise<{ token: string }> }) {
  if (!dbConfigured()) return <SetupNeeded />;
  const { token } = await params;
  const row = await db().getKidByToken(token);
  const family = row && (await db().getFamily(row.familyId));
  if (!row || !family) notFound();
  const me = await currentParent();
  const ctx = await loadFamily(family);
  const v = await loadWeek(ctx, row, weekStart(today()));
  return <KidView v={v} asParent={me?.family.id === family.id} />;
}
