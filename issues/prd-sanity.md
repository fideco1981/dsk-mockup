# Spec — Sanity-redigerbart innhold (tynn skive for styredemoen)

Status: ready-for-agent

> Reverses the "CMS or any backend" line in the MVP PRD's Out of Scope (`issues/prd.md`). Decided in a grilling session on 2026-10-17; the ADR that records the reversal is part of this work.

## Problem Statement

The mockup is meant to persuade the board to adopt it as the club's new site. Right now every word lives in hand-edited HTML, so only Stein can change anything, and the content that changes each season is already out of date: the topbar still says "Sesong 2025/26 er i gang" and the events section shows Telenorkarusellen and Årsmøte dates from early 2026. A board that sees last season's dates and hears "only Stein can fix this" has two reasons to vote no. The club's non-technical people (board members, coaches, the ski-school lead) need to be able to keep the volatile content current themselves.

## Solution

The two most volatile, most visibly stale pieces of content — **Events** (Arrangement) and the **Topbar message** — become editable in a hosted Sanity Studio with Norwegian labels. The site keeps its no-build, GitHub Pages architecture: the shared layout script reads published content straight from Sanity's public read API in the browser and renders it. The current HTML stays as **fallback content** for visitors without JavaScript or when Sanity is unreachable.

The demo moment: Stein edits an event or the topbar text in Studio during the board meeting, publishes, and the board reloads the site on their phones and sees the change.

Everything else (history, Haukåsløypa, training groups, ski school, styret, contact) stays in HTML for this slice.

## User Stories

1. As a board member at the demo, I want to watch Stein change an event in Studio and see it on my phone after a reload, so that I believe the club can maintain the site without a developer.
2. As a board member, I want the site to show this season's events and season message rather than last season's, so that the demo doesn't look abandoned.
3. As a future editor (non-technical), I want to log in to Studio with Google or email, so that I don't need a GitHub account or developer tools.
4. As a future editor, I want Studio's field labels and help text in Norwegian, so that I understand what each field is for.
5. As a future editor, I want to create an event with a title, a date, an optional start time, an optional location and a short plain-text description, so that I can announce a race or a meeting in under a minute.
6. As a future editor, I want to add an optional link to an event (Spond, a notice, a Drive folder), so that visitors can sign up or read the papers.
7. As a future editor, I want to tag an event with chips picked from a fixed list (Renn, Gratis, Årsmøte, Medlemmer), so that the cards look consistent and each chip always gets its colour.
8. As a future editor, I want past events to disappear from the site on their own, so that I don't have to remember to delete them.
9. As a future editor, I want to publish without a preview or approval step, so that a quick fix takes seconds.
10. As a future editor, I want to change the topbar message text and an optional link, so that I can announce season start, ski-school signup or a cancellation.
11. As a future editor, I want to switch the topbar message off, so that the site doesn't advertise a season in the middle of summer.
12. As a visitor, I want to see at most three upcoming events, nearest first, so that the landing page stays short.
13. As a visitor, I want each event card to show a day/month block, chips, a title, the date and time, and the location, the same as today's cards, so that the CMS change is invisible in the design.
14. As a visitor, I don't want to see last season's events flash before the real ones appear, so that I'm never shown stale content as if it were current.
15. As a visitor, I want the events section and topbar to still show something sensible if Sanity is down or slow to fail, so that the page never ends up broken.
16. As a visitor without JavaScript, I want to see the HTML fallback content, so that the site stays usable (keeping the MVP's progressive-enhancement promise).
17. As a visitor using a screen reader, I want CMS-rendered event cards and topbar to carry the same semantics as the hand-written ones (heading level, decorative icons hidden), so that accessibility doesn't regress.
18. As a visitor, I want CMS-rendered event cards to actually be visible, not stuck at the fade-in starting state, so that the section isn't silently empty.
19. As a visitor on any page, I want the topbar message to be the same CMS-driven text, so that every page agrees.
20. As Stein, I want the Studio code and its schemas versioned in this repo, so that the content model and the code that reads it change together.
21. As Stein, I want the browser to read a public dataset without any token, so that no secret ever ships in the site's JavaScript.
22. As Stein, I want the Sanity project on my own account for the demo, with members added and ownership transferred to the club after adoption, so that the demo doesn't wait on a club email address.
23. As Stein, I want tests that prove rendering, filtering, the topbar toggle and the fallback, without calling the real Sanity, so that the suite stays fast and offline.
24. As Stein, I want an ADR recording that the "no CMS" decision was reversed and why, plus a `CONTEXT.md` glossary, so that a future agent reading the MVP PRD doesn't think a CMS is forbidden.
25. As Stein, I want the 2026/27 events and topbar text entered in Sanity as the first real content, so that the demo is both a CMS showcase and an accurate site.

## Implementation Decisions

**Architecture**
- No build step is introduced for the site. GitHub Pages keeps serving the raw files.
- Content is read in the browser from Sanity's **live** (uncached) query API, not the CDN endpoint, so a publish shows up on the next reload. At club traffic levels this is negligible load. Revisit the CDN endpoint after adoption if load matters; its invalidation delay has not been measured.
- The dataset is **public**; the browser uses no token. CORS origins: the GitHub Pages origin and localhost.
- Editors publish directly. No drafts preview, no workflow.

**Shared layout engine (`site.js`) — the single seam**
- `init(doc)` keeps its existing responsibilities (nav, footer, active link, hamburger, palette switcher) and additionally loads CMS content.
- `init(doc)` now **returns a Promise** that resolves after CMS content has been applied or the fallback revealed. Callers on real pages may ignore it.
- It fetches with the document's window `fetch` (`doc.defaultView.fetch`), so tests stub fetch on the JSDOM window. No new injection parameter.
- One query per page load, fetching both the topbar message and events. Events are only rendered where an events mount exists (the landing page); the topbar is rendered on every page.
- **Filtering to upcoming events, sorting by date ascending and capping at 3 happen client-side**, not in the query, so they are testable with fixed fixture dates and no clock mocking. "Upcoming" means the event's date is today or later in the visitor's local time.
- Project ID and dataset name are plain constants in `site.js` (both are public by design).

**Loading behaviour and fallback content**
- The events section and the topbar message are hidden (or show a lightweight skeleton) until the response arrives. They are never shown with stale fallback content first and then swapped.
- On fetch failure, a non-OK response, or malformed data, the HTML fallback content is revealed instead.
- An empty but successful result is not a failure: with zero upcoming events, the events section shows a short Norwegian "no upcoming events" message rather than the stale fallback. With the topbar toggle off, the topbar message is hidden.
- `<noscript>` visitors see the fallback content directly.
- The fallback HTML is a snapshot. It may drift from Sanity and is updated occasionally by hand; Sanity wins whenever it answers.

**Fade-in**
- The landing page's inline fade-in observer registers `.fade-in` elements once at load. CMS-rendered event cards are inserted later and would never become visible. Rendered cards must be visible without depending on that observer (no `fade-in` class, or explicitly in the visible state).

**Rendering and safety**
- Event cards reproduce the current card markup: day/month block derived from the date, chips, a title with the formatted Norwegian date and optional time, and a location line with the decorative pin icon (`aria-hidden`).
- All CMS strings are inserted as text, never as HTML, so an editor cannot inject markup. Links are rendered only for `http(s)` URLs and open in a new tab with `rel="noopener"`.

**Content model (Sanity schemas, Norwegian labels and help text)**
- **Event** (`event`):
  - title (required)
  - date (required)
  - start time (optional)
  - location (optional)
  - description (optional, plain text, short)
  - link (optional URL)
  - chips: a list picked from a fixed set, each value mapping to an existing chip colour:
    - Renn → blue
    - Gratis → orange
    - Årsmøte → green
    - Medlemmer → blue
  - Adding a chip later means adding it to the schema list and the colour map in `site.js` together.
- **Topbar message** (`topbarMessage`): a singleton with text (required), optional link, and a show/hide toggle (default on).
- Plain text only. No Portable Text, so no rich-text renderer is needed.

**Studio**
- A `studio/` folder in this repo holds the Sanity Studio project (its own `package.json` and build). It is deployed with Sanity's hosted Studio to a `*.sanity.studio` address, not served by GitHub Pages.
- The `studio/` source being reachable on GitHub Pages is accepted. It contains no secrets.

**Ownership**
- The Sanity project is created under Stein's personal account for the demo and transferred to a club account after adoption.

**Docs**
- An ADR in `docs/adr/` records the reversal of "no CMS" and the choice of Sanity plus a browser fetch over a git-based CMS (Decap/Sveltia: friction from GitHub accounts and an OAuth proxy for non-technical editors) and over a Sanity build pipeline (the PRD avoided a build step).
- `CONTEXT.md` is created at the repo root with these terms:
  - **Event**: a dated club happening shown on the landing page.
  - **Topbar message**: the site-wide announcement line.
  - **Studio**: the Sanity editing app.
  - **Fallback content**: the hand-written HTML shown without JS or when Sanity fails.
  - **Chip**: a fixed-vocabulary event tag with a colour.

## Testing Decisions

- **Good tests here** assert what a visitor or assistive technology perceives after `await init(doc)`: which event titles appear, in what order, how many; whether the topbar text is shown; whether the fallback content is visible. They don't assert on private helpers or the exact query string.
- **Module tested:** `site.js` via `init(doc)` only, against a JSDOM document with `fetch` stubbed on its window. No test calls the real Sanity.
- **Cases:**
  - Events render from data: only upcoming ones (fixtures dated in 2000 and 2999, so no clock mocking), sorted ascending, at most 3.
  - Event cards are visible (not in the fade-in hidden state) and render chips with their mapped colours.
  - CMS strings containing markup are rendered as text.
  - Topbar shows the CMS text; topbar is hidden when the toggle is off.
  - A fetch rejection or a non-OK response reveals the HTML fallback.
  - An empty event list shows the "no upcoming events" message, not the fallback.
  - The topbar is CMS-driven on a non-landing page, and no events fetch breaks a page without an events mount.
  - `site.js` contains no token. A source-text guard, in the spirit of the existing PII-leak guard in the styret tests.
- **Prior art:** the `site.js` tests and the shared test helper's `makeDoc` JSDOM fixture, which gains an events mount point. The styret test's `LEAKED` guard is the model for the no-token guard.
- **Not tested:** the Studio schemas, the Studio UI, and the visual result of the skeleton. These are checked by eye during demo prep.

## Out of Scope

- Making any other content editable: training groups, ski school, styret (blocked on the open board decision about publishing contact details), Om oss, Haukåsløypa, Kontakt.
- Spond as the source of events. Editors will enter Spond events twice for now. This is raised with the board as a known phase-2 item; Spond's login is a username and password, so it can't run in the browser on GitHub Pages anyway.
- A build pipeline, webhooks or a GitHub Action.
- Draft preview, scheduled publishing, roles and permissions beyond Sanity's defaults.
- Editor accounts for board members before adoption (the demo is Stein editing live).
- A custom domain, and transferring the Sanity project to the club.
- Images in CMS content.

## Further Notes

- **HITL prerequisites (Stein):**
  - Create the Sanity project and run `sanity login`.
  - Add the CORS origins.
  - Deploy Studio.
  - Gather the 2026/27 Telenorkarusellen dates, the next årsmøte date and the topbar text from the club, and enter them as the first content.
- **Stale content outside this slice:** fix the ski-school 2025–2026 course dates and the styret seating line in HTML before the demo, so nothing on the site shows last season. Also refresh the events and topbar fallback HTML, so no-JS visitors aren't shown 2026 spring dates.
- **Demo script:** reload the site on a phone showing an event → edit it in Studio → publish → reload. Rehearse once to confirm that the live endpoint really reflects the publish on reload.
- The legacy palette files and the hero animation are untouched.
