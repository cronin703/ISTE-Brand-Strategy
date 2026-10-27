# Discovery survey: state of play

Written 22 Oct 2026, updated 27 Oct 2026. Read this before touching anything in `survey/`.

This note exists so a fresh session can pick the survey up without re-deriving
it. Everything below is current as of the date above.

## What the survey is

A stakeholder discovery survey for the ISTE+ASCD brand system and governance
engagement. It goes out to ISTE staff before any logo hierarchy is proposed.
Fifteen questions: four identity fields, four 1-5 ratings, six open
questions, one yes/no follow-up ask.

27 Oct 2026, from Maressa: the two "where do you get assets" and "what was hard
about getting a new asset" questions are now one question (it posts to the
`q_where` Form field), and "If you could gain one thing..." is removed. The
Form's `q_hard` and `q_gain` fields stay empty from here on. Only the Cards page
has these edits; the hidden formats still show the old seventeen.

The questions themselves were built from two kickoff call transcripts and then
revised against ISTE's own feedback. **The Google Doc is the source of truth for
wording**, not the HTML:

`https://docs.google.com/document/d/154jn6tuSUXN3frAKDkC3XC_qskuTdlca42Id23ZXQPk/edit`

ISTE has commented in that doc. One comment from Maressa Surrett asked for the
1-5 rating grid and for less overlap between questions, which is why the ratings
section exists. Do not delete the "Questions" heading in that doc: it carries
her comment anchor.

## What is built

Static pages, no build step, no dependencies, in `survey/`:

| Path | What it is |
|---|---|
| `survey/index.html` | **The survey.** Cards format, Brand Hub style: glass cards with the lockup header, one page. No format switcher or nav. Sends to the Google Form and keeps a draft on the device. |
| `survey/config.js` | Shared config. The Form id and the field ids, in one place. |
| `survey/validate.js` | Required-answer checks. |
| `survey/vercel.json`, `survey/.vercelignore` | The project deploys `survey/` as its root folder. `vercel.json` serves the files under `/survey/`, sends `/` there, and keeps trailing slashes; `.vercelignore` and a redirect keep the hidden formats off the live site. |
| `survey/overview/`, `survey/scroll/`, `survey/focused/` | **Hidden.** The old landing page and the One page and Slides formats. Kept in the repo, not deployed. They still use `switcher.css`, `backdrop.*` and have the old seventeen questions. |

The page reads `window.SURVEY_CONFIG` from `config.js` and POSTs to the
Google Form's `formResponse` endpoint through a hidden iframe. Links are
relative, so the page URL must end in a slash; a one-line script adds it if
missing.

## Where it is deployed

**Public, no password (since 27 Oct 2026).**

- Target address: `https://brand.iste.org/survey/` (domain added to the
  project; waiting on ISTE to add the DNS records).
- Live now: `https://iste-brand-survey.vercel.app/survey/`
- Also at `https://lemoncakestudio.com/brand-governance/survey/`: `next.config.ts`
  rewrites it to the project below, and `proxy.ts` leaves `survey` out of the
  hub password gate.

To deploy: create a production deployment of `iste-brand-survey` from this
repo's branch with root directory `survey` (the project is not git-connected,
so pushing alone does not deploy it).

Its own Vercel project, not this one:

- Project `iste-brand-survey`, id `prj_7nITv997PEYovpqoIuZ94HPiG8We`
- Team `team_UT5ntN82kRB4ftRQQ3iXZYry`
- Vercel SSO and password protection are both cleared, so respondents are not
  blocked by a Vercel login wall.
- **No git connection.** Since 27 Oct 2026 it is deployed from this repo's
  branch through the API with root directory `survey` (earlier deploys pushed
  inline files). Connecting it to the repo is a reasonable next step.

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

The survey now runs as a separate project behind a rewrite. Folding it into this
app as real routes, and retiring the standalone project, is still an option for
later. Until then, a change to `survey/` reaches the live site only after it is
deployed to `iste-brand-survey`, because that project has no git connection.

## Blockers, in priority order

**1. Field ids: done (23 Oct 2026).** `survey/config.js` now holds the real
entry ids and the Form's published id, read from the live form. A test response
("TEST submission (delete me)") was recorded by the Form; delete it from the
Form's Responses tab before launch. Every question is required in both formats
(`survey/validate.js`); the Google Form itself does not enforce this.

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
