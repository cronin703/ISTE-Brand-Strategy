import type { Metadata } from "next";
import Link from "next/link";
import { MailIcon } from "@/components/icons";
import { Callout, ContentPage, H2, P, PageHeader } from "@/components/Page";
import { Reveal } from "@/components/Reveal";
import { BRAND_EMAIL, requestMailto } from "@/lib/nav";

export const metadata: Metadata = { title: "Get started" };

const toc = [
  { id: "what", label: "What the hub is for" },
  { id: "who", label: "Who it’s for" },
  { id: "request", label: "Request a logo or lockup" },
  { id: "contact", label: "Contact" },
];

export default function GetStarted() {
  return (
    <ContentPage toc={toc}>
      <PageHeader title="Get started" lead="One place to find the right ISTE+ASCD logo, download it, and see how to use it." />

      <Reveal>
        <H2 id="what">What the hub is for</H2>
        <P>
          ISTE had 57 logos and lockups in circulation and no single source for them. The hub fixes that. Every active
          mark has one page with its files and rules, and every retired mark is labeled so nobody uses it by mistake.
        </P>
        <P>
          Alongside the logos you’ll find the brand foundations (color, type, imagery, accessibility) and content
          guidance (voice, naming, boilerplate).
        </P>
        <Callout title="This is a demo.">
          Brand values are working values taken from the live site, pending the official guide. Some logo files are
          stand-ins; their pages say so.
        </Callout>
      </Reveal>

      <Reveal>
        <H2 id="who">Who it’s for</H2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[520px] text-left text-[15px]">
            <thead className="bg-bg-subtle text-heading">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">If you are</th>
                <th scope="col" className="px-4 py-3 font-semibold">Start here</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["ISTE+ASCD staff making a deck, flyer or email", <Link key="a" className="link" href="/logos/iste-iste-ascd">Master logo</Link>, <Link key="b" className="link" href="/foundations/color">Color</Link>],
                ["A sponsor or exhibitor at ISTELive", <Link key="a" className="link" href="/logos?type=event">Event marks</Link>],
                ["An affiliate or authorized provider", <Link key="a" className="link" href="/logos?type=badge-or-seal">Badges and seals</Link>],
                ["A certified educator or Seal holder", <Link key="a" className="link" href="/logos?type=badge-or-seal">Badges and seals</Link>],
                ["Press or a partner", <Link key="a" className="link" href="/content/boilerplate">Boilerplate</Link>, <Link key="b" className="link" href="/logos?type=partner-lockup">Co-brand rules</Link>],
                ["An agency producing work for ISTE+ASCD", <Link key="a" className="link" href="/foundations">Foundations</Link>],
              ].map(([who, ...links]) => (
                <tr key={who as string}>
                  <td className="px-4 py-3 text-text">{who}</td>
                  <td className="px-4 py-3">
                    <span className="flex flex-wrap gap-x-4">{links}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      <Reveal>
        <H2 id="request">Request a logo or lockup</H2>
        <ol className="mb-6 list-decimal space-y-2 pl-5 text-text marker:font-semibold marker:text-heading">
          <li>Search the <Link className="link" href="/logos">logo library</Link> first. Most marks are there.</li>
          <li>If the mark says “Logo needed” or you need a new lockup, email the brand team with what it’s for, where it will appear and when you need it.</li>
          <li>For a co-brand lockup, include the partner and a link to the agreement. Both sides sign off.</li>
          <li>The brand team replies within three working days. New marks appear on the hub and in <Link className="link" href="/resources/whats-new">What’s new</Link>.</li>
        </ol>
        <a
          href={requestMailto()}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-action px-4 font-semibold text-on-action hover:bg-action-hover"
        >
          <MailIcon width={18} height={18} /> Email a request
        </a>
      </Reveal>

      <Reveal>
        <H2 id="contact">Contact</H2>
        <P>
          Brand team owner for the demo: Nick Cronin, <a href={`mailto:${BRAND_EMAIL}`}>{BRAND_EMAIL}</a>. Every mark
          lists its owner on its page.
        </P>
      </Reveal>
    </ContentPage>
  );
}
