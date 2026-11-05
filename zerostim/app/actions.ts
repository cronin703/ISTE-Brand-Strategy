"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import {
  adminPassword,
  clearSession,
  currentParent,
  getSession,
  rememberFamily,
  requireAdmin,
  requireParent,
  safeEqual,
  setSession,
} from "@/lib/auth";
import { db, type Kind } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { KID_COLORS, isKidColor, type Chore, type Defaults, type Item } from "@/lib/family";
import { addDays, isValidDate, today, weekStart, weekDays } from "@/lib/dates";
import { loadFamily, loadWeek } from "@/lib/load";
import { kidIn, loadDefaults, toSaved, type Settings } from "@/lib/settings";

export type FormState = { error?: string };

function refresh() {
  revalidatePath("/", "layout");
}

/* ---------------- Login ---------------- */

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("secret") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };
  const parent = await db().getParentByEmail(email);
  // Same message either way, so the form doesn't reveal which emails exist.
  if (!parent || !(await verifyPassword(password, parent.passwordHash))) {
    return { error: "That email and password didn't match. Try again." };
  }
  await setSession({ role: "parent", parentId: parent.id, familyId: parent.familyId });
  const family = await db().getFamily(parent.familyId);
  if (family) await rememberFamily(family.token);
  redirect("/parent");
}

export async function adminLogin(_: FormState, form: FormData): Promise<FormState> {
  const pw = adminPassword();
  if (!pw) return { error: "Admin isn't set up. Add ADMIN_PASSWORD in the app settings." };
  if (!safeEqual(String(form.get("secret") ?? ""), pw)) return { error: "That password didn't match." };
  await setSession({ role: "admin" });
  redirect("/admin");
}

export async function logout() {
  await clearSession();
  redirect("/");
}

/* ---------------- Parent: helpers ---------------- */

/** The parent's family plus the kid named in the form, checked to belong to that family. */
async function parentKid(form: FormData) {
  const { family } = await requireParent();
  const ctx = await loadFamily(family);
  const row = ctx.kids.find((k) => k.id === String(form.get("kidId")));
  const week = String(form.get("week"));
  if (!row || !isValidDate(week) || weekStart(week) !== week) throw new Error("Bad request");
  return { ctx, row, week };
}

/* ---------------- Parent: the week ---------------- */

export async function toggleChore(form: FormData) {
  const { ctx, row, week } = await parentKid(form);
  const date = String(form.get("date"));
  const choreId = String(form.get("choreId"));
  const kid = kidIn(ctx.book.at(week), row);
  if (!weekDays(week).includes(date) || !kid.chores.some((c) => c.id === choreId)) throw new Error("Bad request");
  await db().toggleChore(row.id, date, choreId);
  refresh();
}

export async function changeTally(form: FormData) {
  const { ctx, row, week } = await parentKid(form);
  const kind = String(form.get("kind")) as Kind;
  const itemId = String(form.get("itemId"));
  const delta = Number(form.get("delta"));
  const rules = ctx.book.at(week);
  const list = kind === "deduction" ? rules.deductions : kind === "bonus" ? rules.bonuses : null;
  if (!list || !list.some((i) => i.id === itemId)) throw new Error("Bad request");
  const end = addDays(week, 6);
  if (delta > 0) {
    // Log it on today if we're looking at this week, otherwise on the week's Monday.
    const t = today();
    await db().addTally(row.id, t >= week && t <= end ? t : week, kind, itemId);
  } else {
    await db().removeLatestTally(row.id, week, end, kind, itemId);
  }
  refresh();
}

export async function togglePaid(form: FormData) {
  const { ctx, row, week } = await parentKid(form);
  const { summary, paid } = await loadWeek(ctx, row, week);
  if (paid) await db().clearPayout(row.id, week);
  else await db().setPayout(row.id, week, summary.payoutCents);
  refresh();
}

export async function approveAll(form: FormData) {
  const { row, week } = await parentKid(form);
  await db().approveChores(row.id, week, addDays(week, 6));
  refresh();
}

/** Sign-off list: approve or turn down one waiting item (chore or bonus). */
export async function approveEntry(form: FormData) {
  const { row } = await parentKid(form);
  await db().approveEntry(row.id, String(form.get("id")));
  refresh();
}

export async function rejectEntry(form: FormData) {
  const { row } = await parentKid(form);
  await db().rejectEntry(row.id, String(form.get("id")));
  refresh();
}

/* ---------------- Kids (no login; private link token) ---------------- */

async function kidFromToken(form: FormData) {
  const row = await db().getKidByToken(String(form.get("kidToken")));
  const family = row && (await db().getFamily(row.familyId));
  if (!row || !family) throw new Error("Bad request");
  return { row, ctx: await loadFamily(family) };
}

/** Kids mark today's chores themselves. They wait for Mom or Dad's approval. */
export async function kidToggleChore(form: FormData) {
  const { row, ctx } = await kidFromToken(form);
  const choreId = String(form.get("choreId"));
  const t = today();
  const rules = ctx.book.at(weekStart(t));
  if (!kidIn(rules, row).chores.some((c) => c.id === choreId) || t < rules.trackingStart) throw new Error("Bad request");
  await db().kidToggleChore(row.id, t, choreId); // always today: kids can't edit other days
  refresh();
}

/** Kid says "I did this bonus" (today). It waits for Mom or Dad. delta -1 undoes their latest one. */
export async function kidBonus(form: FormData) {
  const { row, ctx } = await kidFromToken(form);
  const itemId = String(form.get("itemId"));
  const t = today();
  const rules = ctx.book.at(weekStart(t));
  if (t < rules.trackingStart || !rules.bonuses.some((b) => b.id === itemId)) throw new Error("Bad request");
  if (Number(form.get("delta")) > 0) await db().addTally(row.id, t, "bonus", itemId, "pending");
  else await db().removeLatestPending(row.id, t, "bonus", itemId);
  refresh();
}

/** Called from the kid's browser once their page is on screen: records the visit and
 *  remembers the family on this device so the dashboard opens to it. */
export async function kidVisit(kidToken: string) {
  const row = await db().getKidByToken(kidToken);
  if (!row) return;
  const family = await db().getFamily(row.familyId);
  if (family) await rememberFamily(family.token);
  if ((await getSession())?.role === "parent") return; // a parent peeking doesn't count
  await db().markSeen(row.id);
}

/* ---------------- Settings (shared by parents and admin) ---------------- */

class FormError extends Error {}

function cents(raw: FormDataEntryValue | null, label: string): number {
  const n = Number(String(raw ?? "").replace(/[$,\s]/g, ""));
  if (!Number.isFinite(n) || n < 0 || n > 1000) throw new FormError(`${label} needs to be an amount between $0 and $1,000.`);
  return Math.round(n * 100);
}

function slug(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) || "item";
}

function readItems(form: FormData, prefix: string, title: string): Item[] {
  const items: Item[] = [];
  const count = Number(form.get(`${prefix}_count`)) || 0;
  for (let i = 0; i < count; i++) {
    const label = String(form.get(`${prefix}_label_${i}`) ?? "").trim().slice(0, 80);
    if (!label) continue;
    const id = String(form.get(`${prefix}_id_${i}`) || `${slug(label)}-${randomBytes(3).toString("hex")}`);
    items.push({ id, label, cents: cents(form.get(`${prefix}_amt_${i}`), `"${label}"`) });
  }
  if (items.length > 20) throw new FormError(`${title} can have up to 20 items.`);
  return items;
}

/** Chore rows posted by <ListEditor>. Keeps ids so past check marks still line up. */
function readChores(form: FormData, prefix: string, before: Chore[] = []): Chore[] {
  const existing = new Map(before.map((c) => [c.label.toLowerCase(), c.id]));
  const used = new Set<string>();
  const out: Chore[] = [];
  const count = Math.min(Number(form.get(`${prefix}_count`)) || 0, 15);
  for (let i = 0; i < count; i++) {
    const label = String(form.get(`${prefix}_label_${i}`) ?? "").trim().slice(0, 80);
    if (!label) continue;
    let id = String(form.get(`${prefix}_id_${i}`) || "") || existing.get(label.toLowerCase()) || slug(label);
    while (used.has(id)) id = `${id}-x`;
    used.add(id);
    out.push({ id, label });
  }
  return out;
}

function fail(path: string, e: unknown): never {
  if (e instanceof FormError) redirect(`${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(e.message)}`);
  throw e;
}

export async function saveSettings(form: FormData) {
  const { family } = await requireParent();
  const ctx = await loadFamily(family);
  const current = weekStart(today());
  const week = form.get("applyFrom") === "next" ? addDays(current, 7) : current;
  const before = ctx.book.at(week);
  let data: Settings;
  try {
    const kids: Settings["kids"] = {};
    for (const k of ctx.kids) {
      kids[k.id] = {
        baseCents: cents(form.get(`base_${k.id}`), `${k.name}'s weekly amount`),
        chores: readChores(form, `chore_${k.id}`, before.kids[k.id]?.chores),
      };
    }
    const start = String(form.get("startDate") ?? "");
    if (!isValidDate(start)) throw new FormError("Pick a start date.");
    data = {
      kids,
      deductions: readItems(form, "ded", "Deductions"),
      bonuses: readItems(form, "bon", "Bonuses"),
      bonusCapCents: cents(form.get("bonusCap"), "The weekly bonus max"),
      trackingStart: start,
    };
  } catch (e) {
    fail("/parent/settings", e);
  }
  await db().saveSettings(family.id, week, toSaved(data));
  await db().updateFamily(family.id, { trackingStart: data.trackingStart });
  refresh();
  redirect(`/parent/settings?saved=${week}`);
}

/* ---------------- Parent: kids and parents ---------------- */

/** Adds a kid with the default chores; takes effect this week. */
async function addKidToFamily(familyId: string, name: string, baseCents: number, color?: string) {
  const family = await db().getFamily(familyId);
  if (!family) throw new Error("Bad request");
  const ctx = await loadFamily(family);
  const used = new Set(ctx.kids.map((k) => k.color));
  const pick = isKidColor(color) ? color : (KID_COLORS.find((c) => !used.has(c)) ?? KID_COLORS[ctx.kids.length % KID_COLORS.length]);
  const id = await db().createKid({ familyId, name, color: pick, baseCents, sort: ctx.kids.length });
  // Save a version that includes the new kid, so their amount is fixed from now on.
  const week = weekStart(today());
  const defaults = await loadDefaults();
  const s = ctx.book.at(week);
  await db().saveSettings(familyId, week, toSaved({ ...s, kids: { ...s.kids, [id]: { baseCents, chores: defaults.chores } } }));
  return id;
}

export async function addKid(form: FormData) {
  const { family } = await requireParent();
  const name = String(form.get("name") ?? "").trim().slice(0, 40);
  try {
    if (!name) throw new FormError("Give the new kid a name.");
    await addKidToFamily(family.id, name, cents(form.get("base"), "The weekly amount"), String(form.get("color")));
  } catch (e) {
    fail("/parent/settings?tab=family", e);
  }
  refresh();
  redirect(`/parent/settings?tab=family&saved=kid`);
}

export async function updateKid(form: FormData) {
  const { family } = await requireParent();
  const row = await db().getKid(String(form.get("kidId")));
  if (!row || row.familyId !== family.id) throw new Error("Bad request");
  const name = String(form.get("name") ?? "").trim().slice(0, 40) || row.name;
  const color = String(form.get("color"));
  await db().updateKid(row.id, { name, color: isKidColor(color) ? color : row.color });
  refresh();
  redirect(`/parent/settings?tab=family&saved=kid`);
}

export async function removeKid(form: FormData) {
  const { family } = await requireParent();
  const row = await db().getKid(String(form.get("kidId")));
  if (!row || row.familyId !== family.id) throw new Error("Bad request");
  if (String(form.get("confirm") ?? "").trim().toLowerCase() !== row.name.toLowerCase()) {
    redirect(`/parent/settings?tab=family&error=${encodeURIComponent(`Type ${row.name} to confirm removing them.`)}`);
  }
  await db().deleteKid(row.id);
  refresh();
  redirect(`/parent/settings?tab=family&saved=removed`);
}

function readParentFields(form: FormData) {
  const name = String(form.get("name") ?? "").trim().slice(0, 40);
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!name) throw new FormError("Add the parent's name.");
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new FormError("That email doesn't look right.");
  if (password.length < 8) throw new FormError("Passwords need at least 8 characters.");
  return { name, email, password };
}

export async function addParent(form: FormData) {
  const { family } = await requireParent();
  try {
    const p = readParentFields(form);
    if (await db().getParentByEmail(p.email)) throw new FormError("That email already has a ZeroStim login.");
    await db().createParent({ familyId: family.id, email: p.email, name: p.name, passwordHash: await hashPassword(p.password) });
  } catch (e) {
    fail("/parent/settings?tab=family", e);
  }
  redirect(`/parent/settings?tab=family&saved=parent`);
}

export async function changePassword(form: FormData) {
  const me = await currentParent();
  if (!me) redirect("/login");
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  if (!(await verifyPassword(current, me.parent.passwordHash))) {
    redirect(`/parent/settings?tab=family&error=${encodeURIComponent("Your current password didn't match.")}`);
  }
  if (next.length < 8) redirect(`/parent/settings?tab=family&error=${encodeURIComponent("New passwords need at least 8 characters.")}`);
  await db().setParentPassword(me.parent.id, await hashPassword(next));
  redirect(`/parent/settings?tab=family&saved=password`);
}

export async function removeParent(form: FormData) {
  const { parent, family } = await requireParent();
  const target = await db().getParent(String(form.get("parentId")));
  if (!target || target.familyId !== family.id || target.id === parent.id) throw new Error("Bad request");
  await db().deleteParent(target.id);
  redirect(`/parent/settings?tab=family&saved=removed`);
}

/* ---------------- Admin (app owner) ---------------- */

export async function saveDefaults(form: FormData) {
  await requireAdmin();
  let d: Defaults;
  try {
    const kidCount = Number(form.get("kidCount"));
    if (!Number.isInteger(kidCount) || kidCount < 1 || kidCount > 6) throw new FormError("Kids per family must be 1 to 6.");
    d = {
      kidCount,
      baseCents: cents(form.get("base"), "The weekly amount"),
      chores: readChores(form, "chore"),
      deductions: readItems(form, "ded", "Deductions"),
      bonuses: readItems(form, "bon", "Bonuses"),
      bonusCapCents: cents(form.get("bonusCap"), "The weekly bonus max"),
    };
  } catch (e) {
    fail("/admin/defaults", e);
  }
  await db().setMeta("defaults", JSON.stringify(d));
  redirect("/admin/defaults?saved=1");
}

export async function createFamily(form: FormData) {
  await requireAdmin();
  let familyId = "";
  try {
    const name = String(form.get("familyName") ?? "").trim().slice(0, 60);
    if (!name) throw new FormError("Give the family a name.");
    const start = String(form.get("startDate") ?? "");
    if (!isValidDate(start)) throw new FormError("Pick a start date.");
    const parent = readParentFields(form);
    if (await db().getParentByEmail(parent.email)) throw new FormError("That email already has a ZeroStim login.");
    const count = Math.min(Math.max(Number(form.get("kidCount")) || 1, 1), 6);
    const kids: { name: string; baseCents: number }[] = [];
    for (let i = 0; i < count; i++) {
      const kn = String(form.get(`kid_name_${i}`) ?? "").trim().slice(0, 40);
      if (!kn) throw new FormError(`Name kid ${i + 1}.`);
      kids.push({ name: kn, baseCents: cents(form.get(`kid_base_${i}`), `${kn}'s weekly amount`) });
    }

    const defaults = await loadDefaults();
    familyId = await db().createFamily({ name, trackingStart: start });
    await db().createParent({ familyId, email: parent.email, name: parent.name, passwordHash: await hashPassword(parent.password) });
    const ids: string[] = [];
    for (const [i, k] of kids.entries()) {
      ids.push(await db().createKid({ familyId, name: k.name, color: KID_COLORS[i % KID_COLORS.length], baseCents: k.baseCents, sort: i }));
    }
    await db().saveSettings(familyId, weekStart(start), {
      kids: Object.fromEntries(ids.map((id, i) => [id, { baseCents: kids[i].baseCents, chores: defaults.chores }])),
      deductions: defaults.deductions,
      bonuses: defaults.bonuses,
      bonusCapCents: defaults.bonusCapCents,
    });
  } catch (e) {
    fail("/admin/new", e);
  }
  redirect(`/admin/family/${familyId}?created=1`);
}

async function adminFamily(form: FormData) {
  await requireAdmin();
  const family = await db().getFamily(String(form.get("familyId")));
  if (!family) throw new Error("Bad request");
  return family;
}

export async function adminAddParent(form: FormData) {
  const family = await adminFamily(form);
  try {
    const p = readParentFields(form);
    if (await db().getParentByEmail(p.email)) throw new FormError("That email already has a ZeroStim login.");
    await db().createParent({ familyId: family.id, email: p.email, name: p.name, passwordHash: await hashPassword(p.password) });
  } catch (e) {
    fail(`/admin/family/${family.id}`, e);
  }
  redirect(`/admin/family/${family.id}?saved=parent`);
}

/** Where an admin form came from: the Users page or a family page. */
function adminBack(form: FormData, familyId: string) {
  return form.get("back") === "users" ? "/admin/users" : `/admin/family/${familyId}`;
}

export async function adminResetPassword(form: FormData) {
  await requireAdmin();
  const parent = await db().getParent(String(form.get("parentId")));
  if (!parent) throw new Error("Bad request");
  const back = adminBack(form, parent.familyId);
  const password = String(form.get("password") ?? "");
  if (password.length < 8) redirect(`${back}?error=${encodeURIComponent("Passwords need at least 8 characters.")}`);
  await db().setParentPassword(parent.id, await hashPassword(password));
  redirect(`${back}?saved=password`);
}

export async function adminRemoveParent(form: FormData) {
  await requireAdmin();
  const parent = await db().getParent(String(form.get("parentId")));
  if (!parent) throw new Error("Bad request");
  await db().deleteParent(parent.id);
  redirect(`${adminBack(form, parent.familyId)}?saved=removed`);
}

/** Users page: add a parent login to any family. */
export async function adminCreateUser(form: FormData) {
  await requireAdmin();
  try {
    const family = await db().getFamily(String(form.get("familyId")));
    if (!family) throw new FormError("Pick a family.");
    const p = readParentFields(form);
    if (await db().getParentByEmail(p.email)) throw new FormError("That email already has a ZeroStim login.");
    await db().createParent({ familyId: family.id, email: p.email, name: p.name, passwordHash: await hashPassword(p.password) });
  } catch (e) {
    fail("/admin/users", e);
  }
  redirect("/admin/users?saved=parent");
}

/** Users page: change a login's name, email or family. */
export async function adminUpdateUser(form: FormData) {
  await requireAdmin();
  const parent = await db().getParent(String(form.get("parentId")));
  if (!parent) throw new Error("Bad request");
  try {
    const name = String(form.get("name") ?? "").trim().slice(0, 40);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const family = await db().getFamily(String(form.get("familyId")));
    if (!name) throw new FormError("Names can't be blank.");
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new FormError("That email doesn't look right.");
    if (!family) throw new FormError("Pick a family.");
    const other = await db().getParentByEmail(email);
    if (other && other.id !== parent.id) throw new FormError("That email already has a ZeroStim login.");
    await db().updateParent(parent.id, { name, email, familyId: family.id });
  } catch (e) {
    fail("/admin/users", e);
  }
  redirect("/admin/users?saved=updated");
}

export async function adminAddKid(form: FormData) {
  const family = await adminFamily(form);
  const name = String(form.get("name") ?? "").trim().slice(0, 40);
  try {
    if (!name) throw new FormError("Give the new kid a name.");
    await addKidToFamily(family.id, name, cents(form.get("base"), "The weekly amount"));
  } catch (e) {
    fail(`/admin/family/${family.id}`, e);
  }
  redirect(`/admin/family/${family.id}?saved=kid`);
}

export async function adminRenameFamily(form: FormData) {
  const family = await adminFamily(form);
  const name = String(form.get("name") ?? "").trim().slice(0, 60);
  if (name) await db().updateFamily(family.id, { name });
  redirect(`/admin/family/${family.id}?saved=name`);
}

export async function adminDeleteFamily(form: FormData) {
  const family = await adminFamily(form);
  if (String(form.get("confirm") ?? "").trim() !== family.name) {
    redirect(`/admin/family/${family.id}?error=${encodeURIComponent(`Type "${family.name}" exactly to delete this family.`)}`);
  }
  await db().deleteFamily(family.id);
  redirect("/admin?saved=deleted");
}

