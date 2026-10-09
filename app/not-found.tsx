// Bare fallback 404. It is bundled into every page under the root layout (the unlock page included),
// so it must not pull in hub content. Unknown hub URLs use app/(hub)/not-found.tsx instead.
export default function RootNotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <p className="text-sm font-semibold text-muted">404</p>
        <h1 className="mt-2 text-3xl font-bold text-heading">We can’t find that page.</h1>
      </div>
    </main>
  );
}
