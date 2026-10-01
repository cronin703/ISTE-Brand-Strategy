# ISTE Brand Hub (demo)

A public brand site for ISTE+ASCD, modeled on the structure and feel of https://atlassian.design/ but limited to brand: a logo library plus core brand guidance. This build is a **demo**: it should look and move like a finished product, but data and hosting are kept simple.

Owner for the demo: Nick Cronin (cronin703@gmail.com). Every mark's owner is set to Nick for now.

## Read these first

| File | What it is |
|---|---|
| `docs/PRD.md` | Product requirements: problem, users, scope, requirements, phases |
| `docs/design-direction.md` | What to copy from atlassian.design, what to leave out, layout, motion spec |
| `data/logos.json` | All 57 marks from the ISTE Brand Lockup Checklist, with status, type, Drive file ids and local files |
| `data/brand.json` | Working colors, typography, voice, imagery (not official yet) |
| `public/logos/` | 45 logo files covering 37 of the 57 marks (local fallback copies) |

## Stack

- Next.js (App Router) + TypeScript, deployed on Vercel.
- Tailwind CSS with CSS variables for brand and motion tokens.
- Content is static: read `data/logos.json` and `data/brand.json` at build time. No database, no CMS, no auth for the demo.
- Search: client-side (e.g. a small fuzzy search over logos.json and page titles), opened with Cmd/Ctrl+K.
- Motion: CSS transitions and keyframes first. Use Framer Motion only for list reordering when filters change (layout animation), and keep it to that.

## Logo images: Google Drive for the demo

The demo shows logos from Google Drive, with local files as a fallback.

- `drive.imageUrl` in logos.json is the direct-image form: `https://drive.google.com/thumbnail?id=<fileId>&sz=w1600`. Do not use `drive.viewUrl` as an `<img src>`; it opens Drive's viewer page.
- The Drive folder must be shared "Anyone with the link can view" or the images fail to load.
- If a mark has no Drive file (the 11 marks found in the second round are not uploaded yet) or the Drive image fails, fall back to the first file in `localFiles`.
- Use `next/image` with `images.remotePatterns` for `drive.google.com` and `lh3.googleusercontent.com`, or plain `<img>` with `loading="lazy"`.
- Download button: link to the local file for the demo (Drive needs `https://drive.google.com/uc?export=download&id=<fileId>`, which can show a Google interstitial). Show the file type and size.
- 20 marks have no logo file at all (`hasLogo: false`). Show a clean placeholder card with the mark's name and a "Logo needed" label, not a broken image.

## Data rules

- `status` is `Active` or `Retired`. Retired marks are hidden by default and shown only in the Archive with a "Retired, do not use" label and no download.
- `decision` (Keep, Refresh, Merge, Rename, Retire) comes from the audit; show it as a small badge on the detail page.
- `fileNotes` explains files that are stand-ins or crops (e.g. a promo banner, a 2025-dated mark). Surface it on the detail page so nobody mistakes them for masters.
- Brand values in `brand.json` are working values. Label the Color page "Working palette, pending official values."

## Design and motion skills

The user installed design plugins. Load and follow them when building UI:

- `frontend-design:frontend-design` for the overall visual direction.
- `vectorlab-ux-skills:motion`, `:transitions`, `:reduced-motion` for all animation (hard rules are summarised in docs/design-direction.md).
- `vectorlab-ux-skills:anti-slop`, `:spacing`, `:typography`, `:empty-states`, `:keyboard`, `:viewports`.
- Run `vectorlab-ux-skills:ux-audit` and `design:accessibility-review` before calling a page done.

## Quality bar

- WCAG 2.2 AA: contrast, visible focus rings, full keyboard use, alt text on every logo (`alt` = mark name).
- Works from 375px to 1440px with no horizontal scroll.
- Every animation honours `prefers-reduced-motion`.
- Lighthouse performance 90+ on the logo grid page.

## Out of scope for the demo

Coded component library, design-token packages, Figma libraries, auth or gated downloads, CMS, analytics beyond Vercel Analytics, multi-language.
