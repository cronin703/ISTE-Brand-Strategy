import { NextResponse, type NextRequest } from "next/server";
import { db, dbConfigured } from "@/lib/db";
import { rememberFamily } from "@/lib/auth";

// Family dashboard link: remembers the family on this device, then opens the dashboard.
export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (dbConfigured()) {
    const family = await db().getFamilyByToken(token);
    if (family) await rememberFamily(family.token);
  }
  return NextResponse.redirect(new URL("/", req.url));
}
