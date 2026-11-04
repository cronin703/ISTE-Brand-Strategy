import Link from "next/link";
import { KIDS } from "@/lib/family";
import { Avatar } from "./avatar";

export function KidTabs({ base, current, query = "" }: { base: string; current: string; query?: string }) {
  return (
    <nav className="tabs" aria-label="Choose kid">
      {KIDS.map((k) => (
        <Link key={k.id} href={`${base}?kid=${k.id}${query}`} className="tab" data-kid={k.id} aria-current={k.id === current ? "page" : undefined}>
          <Avatar id={k.id} name={k.name} size={28} />
          {k.name}
        </Link>
      ))}
    </nav>
  );
}
