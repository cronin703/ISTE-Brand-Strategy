import Link from "next/link";
import { BRAND_EMAIL } from "@/lib/nav";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border px-4 py-10 text-sm text-muted sm:px-8 lg:px-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>
          ISTE Brand Hub demo. Brand values are working values, pending the official guide.
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li><Link className="hover:text-heading" href="/resources/whats-new">What’s new</Link></li>
          <li><Link className="hover:text-heading" href="/get-started#request">Request a logo</Link></li>
          <li><a className="hover:text-heading" href={`mailto:${BRAND_EMAIL}`}>Contact the brand team</a></li>
        </ul>
      </div>
    </footer>
  );
}
