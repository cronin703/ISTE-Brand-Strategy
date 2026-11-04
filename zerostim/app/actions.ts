"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { clearSession, kidPin, parentPassword, requireParent, safeEqual, setSession } from "@/lib/auth";
import { db, type Kind } from "@/lib/db";
import { BONUSES, DEDUCTIONS, getKid } from "@/lib/family";
import { addDays, isValidDate, today, weekStart, weekDays } from "@/lib/dates";
import { summarize } from "@/lib/calc";

export type LoginState = { error?: string };

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  const who = String(form.get("who") ?? "");
  const secret = String(form.get("secret") ?? "");

  if (who === "parent") {
    const pw = parentPassword();
    if (!pw) return { error: "Parent password isn't set up yet. Add PARENT_PASSWORD in the app settings." };
    if (!safeEqual(secret, pw)) return { error: "That password didn't match. Try again." };
    await setSession({ role: "parent" });
    redirect("/parent");
  }

  const kid = getKid(who);
  if (!kid) return { error: "Pick who's checking in first." };
  const pin = kidPin(kid.id);
  if (!pin) return { error: `${kid.name}'s PIN isn't set up yet. Ask a parent.` };
  if (!safeEqual(secret, pin)) return { error: "That PIN didn't match. Try again." };
  await setSession({ role: "kid", kidId: kid.id });
  redirect(`/kid/${kid.id}`);
}

export async function logout() {
  await clearSession();
  redirect("/");
}

function readKidAndWeek(form: FormData) {
  const kid = getKid(String(form.get("kidId")));
  const week = String(form.get("week"));
  if (!kid || !isValidDate(week) || weekStart(week) !== week) throw new Error("Bad request");
  return { kid, week };
}

function refresh() {
  revalidatePath("/parent", "layout");
  revalidatePath("/kid/[id]", "page");
}

export async function toggleChore(form: FormData) {
  await requireParent();
  const { kid, week } = readKidAndWeek(form);
  const date = String(form.get("date"));
  const choreId = String(form.get("choreId"));
  if (!weekDays(week).includes(date) || !kid.chores.some((c) => c.id === choreId)) throw new Error("Bad request");
  await db().toggleChore(kid.id, date, choreId);
  refresh();
}

export async function changeTally(form: FormData) {
  await requireParent();
  const { kid, week } = readKidAndWeek(form);
  const kind = String(form.get("kind")) as Kind;
  const itemId = String(form.get("itemId"));
  const delta = Number(form.get("delta"));
  const list = kind === "deduction" ? DEDUCTIONS : kind === "bonus" ? BONUSES : null;
  if (!list || !list.some((i) => i.id === itemId)) throw new Error("Bad request");

  const end = addDays(week, 6);
  if (delta > 0) {
    // Log it on today if we're looking at this week, otherwise on the week's Monday.
    const t = today();
    const date = t >= week && t <= end ? t : week;
    await db().addTally(kid.id, date, kind, itemId);
  } else {
    await db().removeLatestTally(kid.id, week, end, kind, itemId);
  }
  refresh();
}

export async function togglePaid(form: FormData) {
  await requireParent();
  const { kid, week } = readKidAndWeek(form);
  const store = db();
  const paid = (await store.listPayouts(kid.id)).some((p) => p.weekStart === week);
  if (paid) {
    await store.clearPayout(kid.id, week);
  } else {
    const entries = await store.listEntries(kid.id, week, addDays(week, 6));
    await store.setPayout(kid.id, week, summarize(kid, week, entries).payoutCents);
  }
  refresh();
}
