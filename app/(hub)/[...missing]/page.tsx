import { notFound } from "next/navigation";

// Unknown URLs render the hub's 404 (with its header and sidebar) instead of the bare root one.
export default function Missing() {
  notFound();
}
