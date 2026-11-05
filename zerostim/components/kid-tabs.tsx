import Link from "next/link";
import type { KidRow } from "@/lib/db";
import { Avatar } from "./avatar";

export function KidTabs({ kids, base, current, query = "" }: { kids: KidRow[]; base: string; current: string; query?: string }) {
  if (kids.length < 2) return null;
  return (
    <nav className={`tabs${kids.length > 3 ? " tabs-scroll" : ""}`} aria-label="Choose kid">
      {kids.map((k) => (
        <Link key={k.id} href={`${base}?kid=${k.id}${query}`} className="tab" data-kid={k.color} aria-current={k.id === current ? "page" : undefined}>
          <Avatar color={k.color} name={k.name} size={28} />
          {k.name}
        </Link>
      ))}
    </nav>
  );
}
