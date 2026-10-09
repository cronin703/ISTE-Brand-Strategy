import { NextResponse, type NextRequest } from "next/server";
import { GATE_COOKIE, tokenIsValid } from "./lib/gate";

// Every page and file needs the access cookie; otherwise send the visitor to the unlock page.
export async function proxy(request: NextRequest) {
  if (await tokenIsValid(request.cookies.get(GATE_COOKIE)?.value)) return NextResponse.next();
  const url = request.nextUrl.clone();
  const next = request.nextUrl.pathname + request.nextUrl.search;
  url.pathname = "/unlock";
  url.search = next && next !== "/" ? `?next=${encodeURIComponent(next)}` : "";
  return NextResponse.redirect(url, 307);
}

export const config = {
  // Everything except the unlock page, Next's static chunks, the icons and the background photo (shown on the unlock page).
  matcher: ["/", "/((?!unlock|_next/|favicon|apple-touch-icon|hero/).*)"],
};
