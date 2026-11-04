import { Logo } from "./logo";
import { Mascot } from "./mascot";

/** Shown instead of crashing when the live site has no database yet. */
export function SetupNeeded() {
  return (
    <main className="page" data-world="parent">
      <header className="topbar"><Logo href="/" /></header>
      <section className="login-hero">
        <div style={{ flex: 1 }}>
          <h1 className="display">Almost ready</h1>
          <p>ZeroStim needs a database before it can save chores and payouts.</p>
        </div>
        <Mascot size={88} mood="ok" className="mascot" />
      </section>
      <section className="panel">
        <h2>For the parent</h2>
        <ol className="rules">
          <li>In Vercel, open the zerostim project and go to Storage.</li>
          <li>Create a Neon database and connect it to zerostim.</li>
          <li>Redeploy. This screen goes away on its own.</li>
        </ol>
      </section>
    </main>
  );
}
