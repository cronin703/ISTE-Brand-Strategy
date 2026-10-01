import type { Metadata } from "next";
import brand from "@/data/brand.json";
import { Callout, ContentPage, H2, P, PageHeader } from "@/components/Page";
import { Reveal } from "@/components/Reveal";
import { Swatch } from "@/components/Swatch";
import { contrast, grade, rgb } from "@/lib/contrast";

export const metadata: Metadata = { title: "Color", description: "Working palette, pending official values." };

const toc = [
  { id: "brand", label: "Brand colors" },
  { id: "accessible-accent", label: "Accessible accent" },
  { id: "logo", label: "Logo colors" },
  { id: "pairs", label: "Contrast pairs" },
  { id: "usage", label: "Using color" },
];

const ACCENT_DARK = "#0A6E93";
const titles: Record<string, string> = { navy: "Navy", accent: "Accent blue", white: "White", gray: "Gray" };
const logoNames: Record<string, string> = {
  isteWordmarkNavy: "ISTE wordmark navy",
  isteWordmarkLime: "ISTE wordmark lime",
  isteAscdBlue: "ISTE+ASCD blue",
  isteAscdIndigo: "ISTE+ASCD indigo",
  isteAscdOrange: "ISTE+ASCD orange",
};

export default function ColorPage() {
  const c = brand.colors;
  const logo = Object.entries(brand.logoColorsSampled).filter(([k]) => !k.startsWith("_")) as [string, string][];
  const pairs: [string, string, string, string][] = [
    ["Navy", c.navy.hex, "White", c.white.hex],
    ["White", c.white.hex, "Navy", c.navy.hex],
    ["Gray", c.gray.hex, "White", c.white.hex],
    ["Accent dark", ACCENT_DARK, "White", c.white.hex],
    ["White", c.white.hex, "Accent dark", ACCENT_DARK],
    ["Accent blue", c.accent.hex, "Navy", c.navy.hex],
    ["Accent blue", c.accent.hex, "White", c.white.hex],
    ["ISTE+ASCD orange", "#FAA73B", "White", c.white.hex],
  ];

  return (
    <ContentPage toc={toc}>
      <PageHeader title="Color" lead="Navy anchors the brand, white gives it room, and one bright blue marks the thing that matters most." />
      <Callout tone="warn" title="Working palette, pending official values.">
        These values come from the live ISTE site and the logo files, not an official brand guide. Click any swatch to
        copy its hex value.
      </Callout>

      <Reveal>
        <H2 id="brand">Brand colors</H2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {(Object.keys(c) as (keyof typeof c)[]).map((k) => (
            <Swatch key={k} name={titles[k]} hex={c[k].hex} rgb={rgb(c[k].hex)} role={c[k].role} border={k === "white"} />
          ))}
        </ul>
      </Reveal>

      <Reveal>
        <H2 id="accessible-accent">Accessible accent</H2>
        <P>
          Accent blue on white is {contrast(c.accent.hex, "#FFFFFF").toFixed(2)}:1, below the 4.5:1 that body-size text
          needs. For links, buttons and small text on white, use the darker accent. Keep the bright accent for large
          graphics, highlights and use on navy.
        </P>
        <ul className="grid gap-4 sm:grid-cols-2">
          <Swatch name="Accent dark" hex={ACCENT_DARK} rgb={rgb(ACCENT_DARK)} role="Proposed. Links, buttons and small text on white." />
        </ul>
      </Reveal>

      <Reveal>
        <H2 id="logo">Logo colors</H2>
        <P>Sampled from the logo files. Use these only inside the marks themselves, not as interface or layout colors.</P>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {logo.map(([k, hex]) => (
            <Swatch key={k} name={logoNames[k] ?? k} hex={hex} rgb={rgb(hex)} />
          ))}
        </ul>
      </Reveal>

      <Reveal>
        <H2 id="pairs">Contrast pairs</H2>
        <P>
          WCAG 2.2 AA needs 4.5:1 for normal text and 3:1 for large text (24px, or 19px bold) and interface graphics.
        </P>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[540px] text-left text-[15px]">
            <thead className="bg-bg-subtle text-heading">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Sample</th>
                <th scope="col" className="px-4 py-3 font-semibold">Text on background</th>
                <th scope="col" className="px-4 py-3 font-semibold">Ratio</th>
                <th scope="col" className="px-4 py-3 font-semibold">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pairs.map(([fn, fg, bn, bg]) => {
                const r = contrast(fg, bg);
                const g = grade(r);
                const tone = g === "Fail" ? "bg-danger-bg text-danger" : g === "AA large text" ? "bg-warn-bg text-warn" : "bg-success-bg text-success";
                return (
                  <tr key={fn + bn}>
                    <td className="px-4 py-3">
                      <span className="inline-flex h-9 items-center rounded border border-border px-3 font-semibold" style={{ color: fg, background: bg }} aria-hidden>
                        Aa
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text">{fn} on {bn.toLowerCase()}</td>
                    <td className="px-4 py-3 font-mono text-heading tabular-nums">{r.toFixed(2)}:1</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-semibold ${tone}`}>{g === "Fail" ? "Fails AA" : g}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Reveal>

      <Reveal>
        <H2 id="usage">Using color</H2>
        <ul className="list-disc space-y-2 pl-5 text-text marker:text-border-strong">
          <li>Navy and white carry most of every layout. Navy for headings, navigation and dominant shapes.</li>
          <li>Use the accent for one focal element per view: the main button, the active item, a key number. Never a large fill.</li>
          <li>Set body copy in gray or navy. Never pure black.</li>
          <li>Never rely on color alone to carry meaning. Pair it with a label, icon or pattern.</li>
        </ul>
      </Reveal>
    </ContentPage>
  );
}
