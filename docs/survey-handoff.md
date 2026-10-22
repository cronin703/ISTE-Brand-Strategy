# Discovery survey: state of play

Written 22 Oct 2026. Read this before touching anything in `survey/`.

This note exists so a fresh session can pick the survey up without re-deriving
it. Everything below is current as of the date above.

## What the survey is

A stakeholder discovery survey for the ISTE+ASCD brand system and governance
engagement. It goes out to ISTE staff before any logo hierarchy is proposed.
Seventeen questions: four identity fields, four 1-5 ratings, eight open
questions, one yes/no follow-up ask.

The questions themselves were built from two kickoff call transcripts and then
revised against ISTE's own feedback. **The Google Doc is the source of truth for
wording**, not the HTML:

`https://docs.google.com/document/d/154jn6tuSUXN3frAKDkC3XC_qskuTdlca42Id23ZXQPk/edit`

ISTE has commented in that doc. One comment from Maressa Surrett asked for the
1-5 rating grid and for less overlap between questions, which is why the ratings
section exists. Do not delete the "Questions" heading in that doc: it carries
her comment anchor.

## What is built

Three static pages, no build step, no dependencies, in `survey/`:

| Path | What it is |
|---|---|
| `survey/index.html` | Landing page. Explains the engagement, offers the two formats. |
| `survey/scroll/index.html` | Every question on one vertical page. |
| `survey/focused/index.html` | Two questions per full screen, slide motion, Enter to advance. |
| `survey/config.js` | Shared config. The Form id and the 17 field ids, in one place. |
| `survey/vercel.json` | Sets `trailingSlash: true` so the relative paths below always resolve. |

Both formats read `window.SURVEY_CONFIG` from `../config.js` and POST to the
Google Form's `formResponse` endpoint through a hidden iframe. There is exactly
one place to edit field ids, deliberately.

All paths between the pages are relative (`scroll/`, `../config.js`), so the
survey works at the root of a domain or under a sub-path. That only holds while
every URL ends in a slash, which `vercel.json` enforces on the standalone
project. If the survey is ever served under another app, that app must also
redirect `/survey` to `/survey/`.

Design: dark ground `#161A1D` matched to lemoncakestudio.com, Archivo variable
font using the width axis for display contrast, ISTE sky `#26A7D5` as the
accent, ISTE gold `#FDC343` spent once on the submit button. Form fields have no
borders or fills, only corner ticks that turn accent on focus.

## Where it is deployed

Its own Vercel project, not this one:

- Project `iste-brand-survey`, id `prj_7nITv997PEYovpqoIuZ94HPiG8We`
- Team `team_UT5ntN82kRB4ftRQQ3iXZYry`
- Live at `https://iste-brand-survey.vercel.app`
- Vercel SSO and password protection are both cleared, so respondents are not
  blocked by a Vercel login wall.
- **No git connection.** It was deployed by pushing inline files through the
  API. Connecting it to a repo is a reasonable next step.

### Why it is a separate project

Two reasons, both load-bearing.

First, `proxy.ts` in this repo sends every path except `/unlock` and Next's own
static assets to the password unlock page. A survey living inside this app
inherits that gate, and ISTE respondents would hit a password screen before they
could answer anything.

Second, this project is git-connected to `cronin703/ISTE-Brand-Strategy`.
Deploying inline files into it through the API replaces the entire file tree,
which would take lemoncakestudio.com down.

## Open decision

The survey can stay separate or be folded in. This has not been decided.

**Keep separate.** Point `lemoncakestudio.com/brand-governance/survey` at the
standalone project with a Vercel rewrite, or attach a subdomain. Least work,
leaves two deploys to think about. A rewrite must cover
`/brand-governance/survey/:path*` (not only the landing page) so `config.js`
and the two formats are fetched from the survey project, and that path must be
excluded from the `proxy.ts` matcher, or the password gate catches them.

**Fold in.** Move `survey/` into real routes in this app and add the survey path
to the `matcher` exclusion list in `proxy.ts` so it stays public while the rest
of the hub stays locked. Then retire the standalone project. One codebase, one
deploy, one gate rule to reason about. Cleaner long term.

Nothing in `survey/` is wired into the Next app yet. The files sit there as
plain static pages so either path stays open. They are not in `public/`, because
`public/` is behind the gate.

## Blockers, in priority order

**1. The field ids in `survey/config.js` are placeholders.** They read
`entry.0000001` through `entry.0000017`. Until they are real, both formats POST
into nothing and every response is silently dropped. Nothing else is wrong; the
pages work end to end, a test submit just does not record.

To get the real ids: open the Google Form, three-dot menu, "Get pre-filled
link", fill every field with junk, submit, and read the `entry.NNNNNNNNN` values
out of the resulting URL. Map them to the keys in `config.js` in question order.
Running `finishSetup` in the Apps Script does the same thing.

Form id `1nVEKaP7wZkt73tBAdJLQJwoqj4fGSTQVwSGyJXrxZv4`, 17 items in the order
`config.js` lists them.

**2. The Form is not linked to its response Sheet.** The sheet exists at
`1SLO5sAPi-shvzxIVrpCfcCR_3N0fXqhLmZtKc2c_Yn4` and nothing writes to it. One
click: the Sheets icon in the Form's Responses tab, then pick the existing
sheet.

**3. Unresolved copy question.** The scroll page carried a headline referencing
fifty-six marks. The number is real but comes from the pre-merger 2021 audit, so
it may be stale. Decide whether to keep it, update it, or cut it.

## House rules

- **Never use em dashes.** This applies to every piece of writing for this
  client, in the survey copy, the deck, Slack messages, all of it.
- Slack messages use Slack markup: `*bold*` with single asterisks, `•` for
  bullets, raw URLs rather than markdown links.
- The organization is written "ISTE+ASCD". This matches how ISTE themselves
  edited the Google Doc. An earlier instruction said to use the full
  "International Society for Technology in Education (ISTE)" and to avoid
  "ISTE + ASCD"; the doc overrode it.
- The ISTE logo lockup is used whole, never cropped.

## Related deliverables

A kickoff deck exists in two forms, a web artifact and `ISTE_Kickoff_Deck.pptx`,
built to open in Google Slides. It is not in this repo.
