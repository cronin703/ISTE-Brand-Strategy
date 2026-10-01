import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-4 pt-16 sm:px-8 lg:px-12">
      <p className="text-sm font-semibold text-muted">404</p>
      <h1 className="mt-2 text-[40px] font-bold text-heading">We can’t find that page.</h1>
      <p className="mt-3 max-w-[52ch] text-lg text-muted">
        It may have moved, or the mark may have a new name. Try search (Ctrl K or ⌘K) or browse the logos.
      </p>
      <p className="mt-6 flex gap-4">
        <Link className="link" href="/logos">Browse logos</Link>
        <Link className="link" href="/">Go home</Link>
      </p>
    </div>
  );
}
