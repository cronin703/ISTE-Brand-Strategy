import { notFound } from "next/navigation";
import { requireParent } from "@/lib/auth";
import { dbConfigured } from "@/lib/db";
import { today, weekStart } from "@/lib/dates";
import { loadFamily, loadWeek } from "@/lib/load";
import { KidView } from "@/components/kid-view";
import { SetupNeeded } from "@/components/setup-needed";

// Mom or Dad's view of one of their kids' pages (read-only).
export default async function KidPage({ params }: { params: Promise<{ id: string }> }) {
  if (!dbConfigured()) return <SetupNeeded />;
  const { id } = await params;
  const { family } = await requireParent();
  const ctx = await loadFamily(family);
  const row = ctx.kids.find((k) => k.id === id);
  if (!row) notFound();
  return <KidView v={await loadWeek(ctx, row, weekStart(today()))} asParent />;
}
