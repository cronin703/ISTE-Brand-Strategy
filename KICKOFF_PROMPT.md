# Kickoff prompt for Claude Code

Unzip this folder, open it in your terminal, run `claude`, and paste everything below the line.

---

We're building a demo of the ISTE Brand Hub: a Next.js site on Vercel that works like the logo and foundations part of atlassian.design, for ISTE+ASCD's brand.

Before writing any code:

1. Read `CLAUDE.md`, then `docs/PRD.md` and `docs/design-direction.md`.
2. Look at `data/logos.json` (57 marks), `data/brand.json` and the files in `public/logos/`.
3. Load these skills and follow them throughout: `frontend-design:frontend-design`, `vectorlab-ux-skills:motion`, `vectorlab-ux-skills:transitions`, `vectorlab-ux-skills:reduced-motion`, `vectorlab-ux-skills:anti-slop`, `vectorlab-ux-skills:page-patterns`.
4. Propose a short plan (routes, components, how logos load from Google Drive with local fallback, the motion tokens) and wait for my OK.

Then build in this order, checking in after each step with a screenshot or a short summary:

1. Scaffold Next.js (App Router, TypeScript, Tailwind) with the app shell: top bar (logo, Cmd/Ctrl+K search, theme toggle), collapsible left sidebar, light and dark themes, motion and colour tokens as CSS variables.
2. Logos library page: grid of cards grouped or filtered by logo type and status, retired marks hidden by default, placeholder cards for marks with no file, the load and filter motion from docs/design-direction.md.
3. Logo detail page (`/logos/[id]`): light/dark preview toggle, badges, notes and fileNotes, file downloads with "Downloaded" feedback, copyable alt text, related marks.
4. Archive page for retired marks.
5. Home page, Get started, Foundations (Color with click-to-copy swatches, Typography, Accessibility), Content (Voice and tone, Naming), What's new.
6. Search palette across pages and marks.
7. Run `vectorlab-ux-skills:ux-audit` and `design:accessibility-review`, fix what they find, test with reduced motion on, check 375px to 1440px.
8. Set up for Vercel deploy (`next.config` image remote patterns for drive.google.com, `vercel.json` only if needed) and tell me the exact steps to deploy from my account.

Keep the demo static: no database, auth or CMS. Brand values are working values, so label them that way.
