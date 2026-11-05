import { headers } from "next/headers";
import QRCode from "qrcode";
import { KIDS, money } from "@/lib/family";
import { kidPin } from "@/lib/auth";
import { formatRange, today, weekStart } from "@/lib/dates";
import { loadWeek } from "@/lib/load";
import { Avatar } from "@/components/avatar";
import { RevealPin, ShareButton } from "@/components/copy-share";

async function baseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3100";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export default async function SharePage() {
  const base = await baseUrl();
  const week = weekStart(today());
  const kids = await Promise.all(
    KIDS.map(async (k) => {
      const url = `${base}/login?who=${k.id}`;
      const qr = await QRCode.toString(url, { type: "svg", margin: 1, color: { dark: "#15131a", light: "#ffffff" } });
      const { summary } = await loadWeek(k.id, week);
      return { kid: k, url, qr, pin: kidPin(k.id), summary };
    }),
  );
  const recap = kids
    .map(
      ({ kid, summary: s }) =>
        [
          `${kid.name}: ${money(s.payoutCents)}`,
          `${s.choresDone} of ${s.choresPossible} chores`,
          s.deductionCents ? `${money(s.deductionCents)} in deductions` : "no deductions",
          s.bonusCents ? `${money(s.bonusCents)} in bonuses` : null,
        ]
          .filter(Boolean)
          .join(", "),
    )
    .join("\n");

  return (
    <div data-world="parent" style={{ display: "contents" }}>
      <div className="enter-1">
        <h1 className="history-title">Share</h1>
        <p className="muted" style={{ marginTop: 8 }}>
          Get ZeroStim onto each kid&apos;s phone. Scan the code with their camera, or send them the link.
        </p>
      </div>

      {kids.map(({ kid, url, qr, pin }) => (
        <section key={kid.id} className="panel" data-kid={kid.id} aria-labelledby={`share-${kid.id}`}>
          <div className="share-head">
            <Avatar id={kid.id} name={kid.name} size={44} />
            <div style={{ minWidth: 0 }}>
              <h2 id={`share-${kid.id}`}>{kid.name}&apos;s link</h2>
              <p className="muted small break">{url.replace(/^https?:\/\//, "")}</p>
            </div>
          </div>
          <div className="qr" role="img" aria-label={`QR code for ${kid.name}'s link`} dangerouslySetInnerHTML={{ __html: qr }} />
          <div className="share-actions">
            <ShareButton
              title={`ZeroStim for ${kid.name}`}
              text={`${kid.name}, here's your ZeroStim link. Ask me for your PIN.`}
              url={url}
            />
            {pin && <RevealPin pin={pin} />}
          </div>
        </section>
      ))}

      <section className="panel" aria-labelledby="recap-h">
        <h2 id="recap-h">This week&apos;s recap</h2>
        <p className="muted small">{formatRange(week)}. Send it to your partner or the family chat.</p>
        <pre className="recap">{recap}</pre>
        <ShareButton title="ZeroStim weekly recap" text={`ZeroStim, week of ${formatRange(week)}\n${recap}`} label="Share recap" />
      </section>

      <section className="panel" aria-labelledby="install-h">
        <h2 id="install-h">Add to the home screen</h2>
        <p className="muted small">It opens full-screen like an app, with the ZeroStim icon.</p>
        <ul className="rules">
          <li>iPhone: open the link in Safari, tap Share, then Add to Home Screen.</li>
          <li>Android: open the link in Chrome, tap the ⋮ menu, then Add to Home screen.</li>
        </ul>
      </section>

      <section className="panel" aria-labelledby="acct-h">
        <h2 id="acct-h">Passwords and PINs</h2>
        <p className="muted small">They&apos;re set in the zerostim project&apos;s Environment Variables in Vercel. Ask Claude to change them.</p>
      </section>
    </div>
  );
}
