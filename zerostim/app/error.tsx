"use client";

import Link from "next/link";
import { Mascot } from "@/components/mascot";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="page" data-world="parent">
      <section className="login-hero">
        <div style={{ flex: 1 }}>
          <h1 className="display">Something broke</h1>
          <p>Nothing you did was lost. Try loading the page again.</p>
        </div>
        <Mascot size={88} mood="oops" className="mascot" />
      </section>
      <button className="btn btn-solid" onClick={reset}>Try again</button>
      <Link href="/" className="btn">Go to home</Link>
    </main>
  );
}
