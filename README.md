# ISTE Brand Hub: kickoff kit

Everything Claude Code needs to start the ISTE Brand Hub demo (Next.js on Vercel).

## How to start

1. Unzip this folder where you keep projects.
2. In a terminal: `cd iste-brand-hub-kickoff` then `claude`.
3. Paste the prompt from `KICKOFF_PROMPT.md`.
4. Make sure the Google Drive logo folder is shared "Anyone with the link can view": https://drive.google.com/drive/folders/1RfJX_mxRdg1m-ADkWqZ6BDJp4zbIorVR
5. Have the design plugins enabled in Claude Code: frontend-design, VectorLab UI/UX Skills, Design.

## What's inside

| Path | Contents |
|---|---|
| `CLAUDE.md` | Project instructions Claude Code reads automatically: stack, data rules, Drive image handling, skills, quality bar |
| `KICKOFF_PROMPT.md` | The first prompt to paste |
| `docs/PRD.md` | Product requirements, with a column marking what's in the demo |
| `docs/design-direction.md` | What to copy from atlassian.design, what to leave out, site map, visual style, motion spec |
| `docs/site-map.png`, `docs/roadmap.png` | Diagrams from the PRD |
| `data/logos.json` | All 57 marks: type, status, audit decision, owner, notes, source link, Drive file id and direct image URL, local files |
| `data/logos.csv` | The same data as a spreadsheet |
| `data/brand.json` | Working colors (site palette plus colors sampled from the logo files), type, voice, imagery |
| `public/logos/` | 45 logo files covering 37 marks, named by mark id |

## Known gaps

- 20 marks have no logo file (`hasLogo: false`); the site shows a placeholder for them.
- 11 marks found in the second search are local only, not yet in the Drive folder.
- Many files are web-quality PNGs or PDF crops, not master vectors. `fileNotes` flags the stand-ins.
- Colors and typography are working values, not from an official brand guide.
- Audit decisions are as of the Brand Lockup Checklist on Oct 1, 2026; some rows are still Unsure or TBD.

Source sheet: https://docs.google.com/spreadsheets/d/1rBZASL1OvGzKLqxLjkMV774GxQJ-HPr0rrrW_8pY_7M/edit
