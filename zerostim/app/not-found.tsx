import Link from "next/link";
import { Logo } from "@/components/logo";
import { Mascot } from "@/components/mascot";

export default function NotFound() {
  return (
    <main className="page" data-world="parent">
      <header className="topbar"><Logo href="/" /></header>
      <section className="login-hero">
        <div style={{ flex: 1 }}>
          <h1 className="display">Page not found</h1>
          <p>That link doesn&apos;t go anywhere in ZeroStim.</p>
        </div>
        <Mascot size={88} mood="ok" className="mascot" />
      </section>
      <Link href="/" className="btn btn-solid">Go to home</Link>
    </main>
  );
}
