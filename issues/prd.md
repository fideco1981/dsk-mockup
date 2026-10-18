# PRD — Drammen Slalåmklubb MVP website

> Source content lives in `content-baseline.md` (scraped from drammenslalomklubb.no on 2026-05-29). Treat it as the source of truth; the club will correct stale items before go-live.

## Problem Statement

The club's current website (drammenslalomklubb.no) is a dated multi-page CMS site. Stein has built a polished single-page mockup (`index.html`) and wants to turn it into a **content-complete, deployable replacement candidate** — something he can open on a phone in front of the board so they can vote to adopt it as the club's new site. Today the mockup looks good but only covers part of the club's content and isn't deployed anywhere shareable.

## Solution

A small static website built on the existing `index.html` design language, hosted on GitHub Pages, that mirrors the live site's information architecture closely enough to be a credible replacement. It is six pages sharing one stylesheet and one layout script, populated with real (scraped, then corrected) club content. The board opens a single link on their phones and sees a complete, accurate, modern site.

## User Stories

1. As a board member, I want to open one link on my phone and browse the whole site, so that I can judge whether it's good enough to adopt.
2. As a board member, I want every page from our current site to have an equivalent here, so that I'm confident we lose nothing by switching.
3. As a board member, I want the club's history and identity (founded 1936, Norway's oldest pure alpine club) presented prominently, so that the site reflects who we are.
4. As a board member, I want to decide later exactly which of my personal contact details get published, so that the new site doesn't expose my private phone/email without my say-so.
5. As a prospective parent, I want to see the training groups (Rekrutten, Teknikeren, DSK Fun, U12–U16) with ages, days, times and prices, so that I can pick the right group for my child.
6. As a prospective parent, I want a clear ski-school page with course types, dates and prices, so that I can sign my 4–10-year-old up.
7. As a prospective parent, I want a working "Bli medlem" button that goes to the club's real Spond signup, so that I can join without friction.
8. As a visitor, I want to see upcoming events (Årsmøte, Telenorkarusellen) with dates, so that I know what's happening.
9. As a visitor, I want the club's address, opening hours and a way to get in touch, so that I can find and contact the club.
10. As a visitor on mobile, I want a working hamburger menu and readable layout, so that the site is usable on my phone.
11. As a visitor relying on a screen reader/keyboard, I want the accessibility work already in `index.html` preserved across all pages, so that the site stays usable for everyone.
12. As Stein (maintainer), I want nav and footer defined once and injected into every page, so that I can change a menu item in one place and have it update everywhere.
13. As Stein (maintainer), I want the shared CSS in one file, so that a design tweak applies site-wide without editing six files.
14. As Stein (maintainer), I want the layout engine covered by tests, so that I can refactor or add a page without silently breaking nav/footer/active-state on the other pages.
15. As Stein (maintainer), I want every internal link to use relative paths, so that the site works under the GitHub Pages `/dsk-mockup/` subpath and later under a custom domain.
16. As Stein (maintainer), I want a clear list of content items needing club input (U12–U16 price, club email, Haukås stats, year corrections), so that I know exactly what to gather before go-live.
17. As the club, I want the palette swappable (blue / red / green variants already exist), so that the board can pick the look without a rebuild.

## Implementation Decisions

**Architecture**
- Hybrid static multi-page site, no build step (deployable as raw files on GitHub Pages). Repo: `fideco1981/dsk-mockup`, served at `fideco1981.github.io/dsk-mockup/`.
- Six pages: `index.html` (landing), `skiskole.html`, `treningsopplegg.html` (four deep sections), `om-oss.html`, `styret.html`, `kontakt.html`.
- Arrangement stays as a section on the landing page (Årsmøte + Telenorkarusellen), not a separate page.
- All internal links are **relative** (subpath-safe).

**Shared layout engine (`site.js`)**
- Single source of truth for nav + footer. Each page includes `site.js`; it injects the nav and footer into known mount points.
- Public behavior: (a) render nav from a nav model, (b) render footer, (c) mark the current page's link active (derive current page from `location.pathname` / a `data-page` attribute), (d) wire the mobile hamburger open/close + `aria-expanded`.
- Progressive enhancement: a `<noscript>` fallback / baseline nav so the site is navigable without JS; mobile-menu JS rebinds after injection.

**Shared styles (`styles.css`)**
- Extract the inline `<style>` block from `index.html` into `styles.css`, linked by all pages. The blue "Alpine Edge" palette is the default; red (`-v2`) and green (`-v3`) remain available as alternate theme files/vars for the club to choose.

**Content**
- Populated from `content-baseline.md`. Board contact details **masked** for the demo ("kontakt via styret"); names + roles shown.
- No new photographs: monogram/initials avatars for board, existing `background.jpg` / `logo.png` / SVG skier and CSS gradients for page heroes.
- Content corrections baked in: "Teknikern" → "Teknikeren"; per-group schedule corrected to real days/times; Haukås hero stats (500 m / 133 m / 47%) flagged as unverified pending club confirmation.

**Out-of-scope integrations**
- Spond is NOT integrated for live data; only the existing static Spond signup link is used.

## Testing Decisions

- **What makes a good test here:** assert external/observable behavior of `site.js`, not its internals — e.g. "after init, the nav contains the expected links," "the link matching the current page has the active class/`aria-current`," "clicking the hamburger toggles the menu and `aria-expanded`." Do not assert on private functions or DOM structure beyond what a user/AT would perceive.
- **Module tested:** `site.js` only (nav/footer injection, active-link marking, mobile-menu toggle), driven against a JSDOM-style document fixture.
- **Not tested:** static page content (verified by eye + cross-check against `content-baseline.md`), `styles.css` (visual), existing hero animation JS (untouched).
- **Prior art:** none in repo yet (no test harness exists). Establishing the first test setup is itself an infrastructure task.

## Out of Scope

- Live Spond data integration (events/groups/members) — future phase.
- Member login, payments, registration flows beyond the existing Spond signup link.
- Real board photos and any new photography.
- Custom domain / DNS cutover (`drammenslalomklubb.no`).
- CMS or any backend; the `backend/explore.py` Spond script is exploratory only.
- Final decision on which personal contact details to publish (board decides post-demo).

## Further Notes

- **Items needing club input before go-live (HITL):** U12–U16 training price; whether `post@drammenslalomklubb.no` exists; confirm/correct Haukås stats (length/vertical/gradient); resolve the 2025-vs-2026 year mix observed on the live site; final palette choice; final decision on published board contact details.
- **Sequencing preference:** plan-first (this PRD → issues). Tracer-bullet approach recommended at execution: extract `styles.css` + `site.js`, refactor `index.html` onto them, build one new page (Styret) end-to-end, deploy + verify on phone, then fan out the remaining pages.
- `schedule.html` is legacy (its content was folded into `index.html` in commit 088b29c) and can be removed.
