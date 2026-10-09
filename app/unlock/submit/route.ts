import { NextResponse, type NextRequest } from "next/server";
import { BASE_PATH } from "@/lib/basePath";
import { GATE_COOKIE, safeNext, tokenFor, tokenIsValid } from "@/lib/gate";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "").trim();
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
