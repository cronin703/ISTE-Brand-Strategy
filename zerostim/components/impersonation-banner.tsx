import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { stopImpersonating } from "@/app/actions";

/** Shown on every page while the admin is viewing as a parent. */
export async function ImpersonationBanner() {
  const s = await getSession();
  if (s?.role !== "parent" || !s.asAdmin) return null;
  const [parent, family] = await Promise.all([db().getParent(s.parentId), db().getFamily(s.familyId)]);
  return (
    <div className="impersonate-bar" role="status">
      <span>
        Viewing as <strong>{parent?.name ?? "a parent"}</strong>
        {family ? ` (${family.name})` : ""}. Changes are real.
      </span>
      <form action={stopImpersonating}>
        <button className="btn btn-small">Back to admin</button>
      </form>
    </div>
  );
}
