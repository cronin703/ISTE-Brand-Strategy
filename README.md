# ISTE Brand Hub (demo)

A public brand site for ISTE+ASCD: a logo library plus core brand guidance, modeled on the structure of atlassian.design. Next.js (App Router), TypeScript, Tailwind CSS v4, deployed on Vercel. Everything is static and built from `data/logos.json` and `data/brand.json`.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static build of every page (76 routes)
npm run thumbs     # regenerate public/thumbs/*.webp after changing public/logos
```

## How logos load

Cards and previews try the Google Drive thumbnail first (`drive.imageUrl`, resized to `sz=w640` for cards). If a mark has no Drive file, or Drive fails, they fall back to the local copy: a pre-sized WebP in `public/thumbs/` for cards, the original file in `public/logos/` (SVG first) for the detail page. Marks with `hasLogo: false` show a "Logo needed" placeholder. Downloads always use the local file.

The Drive folder must be shared "Anyone with the link can view" for the Drive images to load.

## Where things live

| Path | What |
|---|---|
| `app/` | Routes: home, get-started, logos (library, `[id]`, archive), foundations, content, resources |
| `components/` | App shell, sidebar, search palette, logo grid, cards, detail preview, swatches |
| `lib/logos.ts` | Reads logos.json at build time and prepares marks for the UI |
| `lib/logoTypes.ts` | Draft usage rules per logo type, and `REPLACED_BY` for retired marks |
| `lib/nav.ts` | Sidebar, section landings and search pages |
| `app/globals.css` | Color, theme and motion tokens; keyframes; reduced-motion rules |
| `docs/`, `data/`, `public/logos/` | The kickoff kit: PRD, design direction, data, logo files |

## Editing content

- Logos: edit `data/logos.json` (or re-export it from the Brand Lockup Checklist), then rebuild.
- Rules per logo type: `lib/logoTypes.ts`.
- Changelog: `app/resources/whats-new/page.tsx`.
