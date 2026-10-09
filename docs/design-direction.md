# Design direction

Copy the structure and calm feel of [atlassian.design](https://atlassian.design/), applied to ISTE+ASCD's own brand. Do not copy Atlassian's assets: their Charlie Sans typeface, illustrations and icons are proprietary.

## What to copy from atlassian.design

- **Chrome:** a slim top bar (logo left; search and theme toggle right) and a left sidebar with collapsible sections. Sidebar collapses to a drawer under 1024px.
- **Section landing pages:** a short intro, then a grid of cards, one per sub-page.
- **Content pages:** title, one-sentence lead, an "On this page" list of jump links (sticky on the right at wide widths), short sections.
- **Logo page pattern** ([their Logos page](https://atlassian.design/foundations/logos)): logos grouped by logo type, each type with a few rules (when to use it, alt text, never rebuild it yourself), then a grid of cards. Each card: preview on a neutral tile, name, a Download button with file size.
- **Do / Don't pairs** for logo misuse, side by side, with a green check or red cross label in words, not colour alone.
- **Colour swatches** that copy their value on click.
- **What's new** page as a dated changelog.
- Generous white space, plain short copy, light and dark themes.

## What we leave out (fine for this project)

- Coded React component library (~80 components), layout primitives, lint plugins, Storybook.
- Design tokens shipped as code packages.
- Rovo UI / AI patterns.
- Product-UI specs: elevation, border, radius, spacing scale, grid, motion guidelines as published pages.
- Contribution model, release phases, news/blog, careers.
- Figma libraries.

## How Atlassian's logo types map to ISTE

| Atlassian | ISTE equivalent (`logoType` in logos.json) |
|---|---|
| Company logo | Master brand (ISTE / ISTE+ASCD) |
| Property logos (logo + property name) | Program or product, Standards |
| App logos (own glyph in a tile) | Initiative, Event |
| Attribution logos (product + "Atlassian" strapline) | Partner lockup |
| (no equivalent) | Badge or seal, Media or publication |

## Site map

- **Home**: hero with the master logo and tagline "Education, Transformed.", quick links (Download the ISTE+ASCD logo, Browse all logos, Colors, Request a logo), a "Recently updated" row.
- **Get started**: what the hub is for, how to request a logo or lockup, contact.
- **Logos** (the core): overview and logo-type rules; library grid with filters (logo type, status) and search; one detail page per mark; Archive of retired marks.
- **Foundations**: Color (working palette), Typography, Photography, Iconography and illustration, Accessibility.
- **Content**: Voice and tone, Naming and trademark use (ISTE vs ISTE+ASCD, program names), Boilerplate.
- **Resources**: What's new, Templates (placeholder for phase 2).

## Logo detail page

Large preview on light and dark tiles (toggle), name, logo type, status and decision badges, owner, notes and `fileNotes`, file list with download buttons, alt text to copy, source link, "Replaced by" when retired, related marks in the same audit group.

## Visual style

- Brand values from `data/brand.json`. Navy carries headings and chrome; the accent blue marks one focal element per view (primary button, active nav item, a key number). Never large accent fills.
- Type: Inter (until the official typeface is known). Headings bold, clear size steps (e.g. 40 / 28 / 20 / 16), body 16px, line length 60 to 75 characters.
- Logo tiles: neutral surface (#F4F5F7 light, #1D2125 dark), 1px border, 8px radius, logo centred with generous padding.
- Spacing on an 8px grid. Borders before shadows; at most one soft shadow on hover.

## Motion spec

Follow the installed `vectorlab-ux-skills` motion, transitions and reduced-motion skills. Summary of their hard rules:

- Duration tokens only: 100, 150, 200, 300ms, plus 600ms (`--motion-600`) for the signature moments listed below and nothing else.
- Ease-out on enter, ease-in on exit. No bounce, elastic or overshoot on chrome.
- Animate `transform` and `opacity` only.
- List stagger at most 30ms per item, about 200ms total. No stagger on filter updates.
- No infinite decorative loops.
- `prefers-reduced-motion: reduce` turns everything into instant changes or opacity fades of 150ms or less. Meaning is never carried by motion alone.

```css
:root {
  --motion-100: 100ms; --motion-150: 150ms; --motion-200: 200ms; --motion-300: 300ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
}
```

Where the demo gets its movement:

| Moment | Motion |
|---|---|
| Logo grid first load | Cards fade in and rise 8px, 200ms ease-out, 30ms stagger, capped at the first 8 cards |
| Card hover | Card lifts 2px with one soft shadow; logo scales to 1.02; 150ms |
| Filter change | Cards reflow to new positions (layout animation, 200ms); removed cards fade out 150ms ease-in; no stagger |
| Search palette (Cmd/Ctrl+K) | Overlay fades in 150ms; panel scales 0.98 to 1 and fades, 200ms; Esc closes instantly |
| Download | Button label swaps to "Downloaded" with a check icon for 1.5s; 150ms cross-fade |
| Swatch click | Label swaps to "Copied"; 150ms cross-fade; announced via aria-live |
| Light/dark preview toggle on detail page | Tile background cross-fades 200ms |
| Sidebar drawer (mobile) | Slides in on X, 200ms ease-out; out 150ms ease-in |
| Page sections on scroll | Fade and rise 8px once as they enter, 200ms; never re-trigger |
| Theme switch | Colours cross-fade 150ms |
| Route change | Page fades and rises 6px, 300ms (`app/template.tsx`) |
| Header on scroll | Turns to frosted glass with a hairline shadow, 200ms |
| Sidebar active item | One highlight pill slides to the item you open, 300ms ease-out (grows in on first load) |
| Sidebar sections | Open and close by animating their height, 300ms; closed sections are `inert` |
| "On this page" | Click smooth-scrolls to the section; a marker slides along the rule to the section being read, 300ms |
| Light/dark preview toggle | The selected background slides across, 200ms |
| Links | Underline deepens and drops 1px on hover, 150ms |

Signature moments (600ms, home page only unless noted, all one-shot):

| Moment | Motion |
|---|---|
| Hero headline | Each word rises out of a mask, 90ms apart |
| Hero mark | Wordmark parts rise in, 70ms apart; the orange "+" turns 90deg into place last |
| Hero tile | Brand glow and grain; tilts up to 3deg toward a mouse pointer and the glow follows it, 300ms |
| Audit numbers | Count up from 0 when scrolled into view; progress bar fills from the left |
| Primary button hover | One light sheen crosses the button |

Cursor spotlight (`.spotlight`, fed by `components/PointerFx.tsx`): on cards, swatches and the logo preview, a soft accent fill and a lit border follow the pointer. Mouse only.

With `prefers-reduced-motion: reduce`, all of the above render in their final state with no movement; the page fade drops to a 120ms opacity fade.
