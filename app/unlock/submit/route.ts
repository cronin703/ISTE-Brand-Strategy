import { NextResponse, type NextRequest } from "next/server";
import { BASE_PATH } from "@/lib/basePath";
import { GATE_COOKIE, safeNext, tokenFor, tokenIsValid } from "@/lib/gate";

/** Undo what chat apps and docs add when a password is copied out of them: code-format
 *  backticks or quotes around it, invisible characters, non-breaking spaces and
 *  "smart" dashes in place of hyphens. */
function cleanPassword(raw: string) {
  return raw
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\u2060\uFEFF\u00AD]/g, "")
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/^[\s`'"\u2018\u2019\u201C\u201D*_]+|[\s`'"\u2018\u2019\u201C\u201D*_]+$/g, "");
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const password = cleanPassword(String(form.get("password") ?? ""));
  const next = safeNext(String(form.get("next") ?? ""));
  const token = await tokenFor(password);
  const ok = await tokenIsValid(token);
  // Redirect targets include the base path: route handler URLs are not rewritten for us.
  const target = new URL(ok ? `${BASE_PATH}${next === "/" ? "" : next}` : `${BASE_PATH}/unlock`, request.url);
  if (!ok) {
    target.searchParams.set("error", "1");
    if (next !== "/") target.searchParams.set("next", next);
  }
  const res = NextResponse.redirect(target, 303);
  if (ok) {
    res.cookies.set(GATE_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return res;
}
