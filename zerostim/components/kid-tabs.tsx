import Link from "next/link";
import { KIDS } from "@/lib/family";

export function KidTabs({ base, current, query = "" }: { base: string; current: string; query?: string }) {
  return (
    <nav className="tabs" aria-label="Choose kid">
      {KIDS.map((k) => (
        <Link key={k.id} href={`${base}?kid=${k.id}${query}`} className="tab" aria-current={k.id === current ? "page" : undefined}>
          {k.name}
        </Link>
      ))}
    </nav>
  );
}
