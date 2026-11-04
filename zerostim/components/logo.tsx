import Link from "next/link";
import { Mascot } from "./mascot";

export function Logo({ href }: { href?: string }) {
  const inner = (
    <>
      <Mascot size={36} />
      <span className="brand-text">ZeroStim</span>
    </>
  );
  return href ? (
    <Link href={href} className="brand" aria-label="ZeroStim home">{inner}</Link>
  ) : (
    <span className="brand">{inner}</span>
  );
}
