## Parent PRD

`issues/prd.md`

## What to build

Make the site live and phone-shareable on GitHub Pages (repo `fideco1981/dsk-mockup`, served at `fideco1981.github.io/dsk-mockup/`). Audit all internal links to be relative so they work under the `/dsk-mockup/` subpath, enable Pages, and verify the live URL on a phone. This completes the tracer: shared layout + one new page, live.

See PRD → "Architecture" and "Further Notes" (sequencing).

## Acceptance criteria

- [x] Every internal link is relative; no absolute `/path` links that break under the subpath.
- [x] GitHub Pages enabled on `main` (via `gh`/API if possible; otherwise documented one-click step for the user).
- [x] A `.nojekyll` file added if any asset paths require it.
- [x] Live URL loads `index.html` and `styret.html` correctly, including injected nav/footer and CSS. — verified: all 6 pages (index, styret, om-oss, kontakt, skiskole, treningsopplegg) return HTTP 200 and serve the latest content (Teknikeren, real events, ubekreftet disclaimer).
- [x] Verified on a mobile viewport: layout readable, hamburger menu works, links navigate. — verified by Stein on phone after two fixes (see "Phone-check fixes" below).

## Progress (2026-05-29)

AFK deliverables done; go-live (push + phone check) is blocked. Details:

- **Links audited & relative.** No absolute `/path` internal links exist in
  `index.html`, `styret.html`, the injected nav/footer (`site.js`), or
  `styles.css` asset `url()`s. Now guarded by `test/deploy.test.js`: scans the
  NAV_MODEL pages on disk + the injected markup and fails on any absolute
  internal `href`/`src`. This auto-covers pages 004-008 as they're added.
- **`.nojekyll` added** at repo root (test-asserted) — serves files verbatim,
  no Jekyll processing.
- **Pages already enabled.** `gh api repos/fideco1981/dsk-mockup/pages` →
  source `main` / path `/`, status `built`, https enforced, live at
  https://fideco1981.github.io/dsk-mockup/. No action needed to enable.

### Blockers resolved (update 2026-05-29)

2. **PII leak risk — RESOLVED.** Took fix (a): `test/styret.test.js` no longer
   embeds the `LEAKED` array. It now parses phone/email from
   `content-baseline.md` at test time (`loadLeakedFromBaseline()` reads the
   "Styret 2024–2025" markdown table), and `content-baseline.md` is added to
   `.gitignore`. When the baseline is absent (CI / fresh clone), the leak
   assertion is skipped with a `t.diagnostic(...)` note; the masking-affordance
   check still runs unconditionally. Verified: 15/15 tests pass both with and
   without the baseline file present. The committed test file no longer
   contains any board PII — safe to push to the public repo.

### Go-live (2026-05-29, completed together with Stein)

1. **Pushed.** All commits 004–008 + the deploy-readiness work pushed to
   `origin/main` via SSH (origin URL switched from HTTPS to SSH so the
   `gh`-configured SSH key would be used). Pages auto-rebuilt; all 6 pages
   verified live with HTTP 200 and the corrected landing content
   (Teknikeren, real Telenorkarusellen + Årsmøte events, `ubekreftet`
   Haukås disclaimer).
2. **Phone check completed.** Stein opened the live URL on his phone and
   reported one bug: the hamburger menu opened but showed only the
   "Bli Medlem" CTA — no nav links. See "Phone-check fixes" below.

## Phone-check fixes (2026-05-29)

Two follow-up commits landed during the phone check:

- **5cb4b9e — CTA size + scroll fallback.** First guess at the bug: the
  CTA inside the mobile menu was inheriting `.mobile-menu a` (28px / 700)
  because of CSS specificity (`.mobile-menu a` = 0,1,1 beats `.btn-primary`
  = 0,1,0). Added `.mobile-menu .btn-primary` (0,2,0) to restore the
  16px/600 design + `overflow-y: auto` + `padding: 80px 20px 40px` so
  the menu scrolls on short viewports and the close X doesn't sit on
  top of the first link.
- **4d466c4 — restore nav-links visibility.** Stein's screenshot showed
  the CTA fix wasn't the root cause. The mobile media query at ≤768
  has `.nav-links, .btn-nav { display: none; }`, which hides EVERY
  `.nav-links` element on the page — including the `<ul class="nav-links">`
  inside the open mobile menu, since the desktop and mobile lists share
  the class. Added `.mobile-menu .nav-links { display: flex; flex-direction:
  column; ...}` (specificity 0,2,0) to override.

Both fixes are guarded by CSS-contract regex tests in `test/site.test.js`
that grep the stylesheet rather than computed style (JSDOM helpers
don't load CSS). Three new tests in total (62/62 passing after the
final fix).

## Why the bug slipped past the test suite

`test/site.test.js` asserts on `#nav .nav-links a` (the desktop nav,
which is correctly populated in the DOM) and on the hamburger toggle's
`aria-expanded` state. The mobile menu's `<ul class="nav-links">` ALSO
exists in the DOM with all 6 links — the bug was purely CSS visibility.
JSDOM doesn't load `styles.css` in the helper, so computed-style
assertions weren't possible. The new CSS-contract regex tests close
that gap for the open-menu invariants (CTA size, scroll, link visibility).

## Blocked by

- Blocked by `issues/001-shared-layout-foundation.md`
- Blocked by `issues/002-styret-page.md`

## User stories addressed

- User story 1
- User story 10
- User story 15
