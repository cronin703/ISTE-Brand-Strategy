# ISTE Brand Hub (demo)

A public brand site for ISTE+ASCD: a logo library plus core brand guidance, modeled on the structure of atlassian.design. Next.js (App Router), TypeScript, Tailwind CSS v4, deployed on Vercel. Everything is static and built from `data/logos.json` and `data/brand.json`.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000/brand-governance
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

## Address: lemoncakestudio.com/brand-governance

The hub lives under a sub-path, set once in `lib/basePath.ts` and applied as `basePath` in `next.config.ts`.

- `next/link` and the router add the prefix on their own. Plain `<a>`, `<img>` and metadata URLs that point at files in `public/` need `withBase()` from `lib/basePath.ts`.
- The domain root (`/`) redirects to `/brand-governance` until something else lives there.
- Paths are lowercase. A redirect from `/Brand-governance` isn't possible: Next.js and Vercel both match redirects case-insensitively, so it would loop.

## Deploy to Vercel

Vercel detects Next.js, and `next.config.ts` already allows images from `drive.google.com` and `lh3.googleusercontent.com`.

1. Share the Drive logo folder as "Anyone with the link can view": https://drive.google.com/drive/folders/1RfJX_mxRdg1m-ADkWqZ6BDJp4zbIorVR
2. Go to https://vercel.com/new and sign in with GitHub.
3. Import `cronin703/ISTE-Brand-Strategy`. If the repo isn't listed, choose "Adjust GitHub App Permissions" and give Vercel access to it.
4. Leave the defaults (Framework: Next.js, Build: `next build`, Output: automatic, no environment variables) and click Deploy.
5. To deploy a branch other than `main`, either merge it to `main` or set Settings → Git → Production Branch. Every other branch gets a preview URL automatically.

6. Add the domain: Project → Settings → Domains → add `lemoncakestudio.com` (and `www.lemoncakestudio.com`, set to redirect to the apex). Vercel shows the DNS records to add at your registrar: usually an `A` record for `@` pointing to `76.76.21.21` and a `CNAME` for `www` pointing to `cname.vercel-dns.com`. If you bought the domain through Vercel, this is automatic.

From a terminal instead: `npm i -g vercel`, then `vercel` (preview) and `vercel --prod` (production) in this folder.

## Quality checks run on this build

- axe-core (WCAG 2.0 to 2.2 A/AA plus best practice): 0 violations across 21 routes, light and dark.
- Lighthouse on `/logos`: Performance 94 to 98, Accessibility 100, Best Practices 100, SEO 100.
- Keyboard and interaction tests: search palette, filters and URL sync, downloads, copy, drawer focus trap, theme persistence, reduced motion.
- No horizontal scroll from 375px to 1440px.
