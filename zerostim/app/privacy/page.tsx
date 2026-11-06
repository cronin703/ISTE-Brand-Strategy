import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";

export const metadata: Metadata = { title: "Privacy policy · ZeroStim" };

const contact = process.env.CONTACT_EMAIL;

// Plain-language privacy policy. ZeroStim is used by children, so it collects as
// little as possible, has no ads, and sells or shares nothing.
export default function Privacy() {
  return (
    <main className="page prose-page" data-world="parent">
      <header className="topbar">
        <Logo href="/" />
        <Link href="/" className="btn btn-ghost">Back</Link>
      </header>
      <article className="panel prose">
        <h1 className="history-title">Privacy policy</h1>
        <p className="muted small">Last updated November 6, 2026</p>

        <p>
          ZeroStim helps families track chores and allowance. Kids use it, so we keep it simple: we collect only what the app
          needs to work, we never show ads, and we never sell or share anyone&apos;s information.
        </p>

        <h2>Who sets up an account</h2>
        <p>
          A parent or guardian creates the family account and adds their kids. Kids don&apos;t create accounts, don&apos;t log in,
          and are never asked for personal information. By adding a child, the parent agrees to this policy on the child&apos;s behalf.
        </p>

        <h2>What we keep</h2>
        <ul>
          <li><strong>Parents:</strong> name, email address, and a scrambled (hashed) password. We can&apos;t see your password.</li>
          <li><strong>Kids:</strong> first name, a color, and their weekly allowance amount.</li>
          <li><strong>Activity:</strong> chores and bonuses checked off, approvals, deductions, payouts, and when a kid last opened the app.</li>
          <li><strong>Notifications:</strong> if a parent turns them on, a device address so we can send that phone a notification.</li>
          <li><strong>Security:</strong> failed login attempts for a short time, to stop people guessing passwords.</li>
        </ul>
        <p>We don&apos;t collect locations, photos, contacts, or advertising IDs, and we don&apos;t use tracking or analytics tools.</p>

        <h2>How it&apos;s used</h2>
        <p>Only to run ZeroStim for your family: showing progress, working out allowance, and sending the notifications you turned on.</p>

        <h2>Who else handles it</h2>
        <p>
          Only the services that run the app: Vercel (hosting), Neon (database), and Apple or Google (to deliver notifications you
          turned on). They process data for us and may not use it for anything else.
        </p>

        <h2>Who can see it</h2>
        <p>
          Parents in your family see everything for your family. Each kid&apos;s private link shows that kid&apos;s week, so share it
          only with your child. The person who runs ZeroStim can access accounts to give support.
        </p>

        <h2>Deleting your data</h2>
        <p>
          Any parent can delete their login, or the whole family and all its data, in <strong>Settings → Family → Delete account</strong>.
          Deletion is permanent and happens right away. A parent can also remove a single kid and their history there.
        </p>

        <h2>Questions</h2>
        <p>
          {contact ? (
            <>Email <a href={`mailto:${contact}`}>{contact}</a>.</>
          ) : (
            <>Contact the person who set up ZeroStim for your family.</>
          )}{" "}
          If we change this policy, we&apos;ll update the date above.
        </p>
      </article>
    </main>
  );
}
