import type { Metadata } from "next";
import { BrandMark } from "@/components/BrandMark";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { withBase } from "@/lib/basePath";
import { safeNext } from "@/lib/gate";

export const metadata: Metadata = { title: "Enter password" };

export default async function Unlock({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-16">
      <HeroBackdrop />
      <div className="glass card-enter w-full max-w-[400px] rounded-xl border border-border p-8 shadow-[var(--shadow-hover)] sm:p-10">
        <BrandMark className="h-14 w-auto" title="ISTE+ASCD" animate />
        <h1 className="mt-8 text-2xl font-bold text-heading">Brand Hub</h1>
        <p className="mt-2 text-muted">This preview is private. Enter the password to continue.</p>
        <form action={withBase("/unlock/submit")} method="post" className="mt-6">
          <input type="hidden" name="next" value={safeNext(next)} />
          <label htmlFor="password" className="text-sm font-semibold text-heading">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            autoComplete="current-password"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "password-error" : undefined}
            className="mt-2 h-11 w-full rounded-md border border-border-strong bg-[color-mix(in_srgb,var(--bg)_85%,transparent)] px-3 text-heading"
          />
          {error && (
            <p id="password-error" role="alert" className="mt-2 text-sm font-medium text-danger">
              That password didn’t work. Check it and try again.
            </p>
          )}
          <button
            type="submit"
            className="btn-sheen relative mt-5 inline-flex h-11 w-full items-center justify-center rounded-md bg-action font-semibold text-on-action hover:bg-action-hover"
          >
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}
