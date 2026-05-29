## Parent PRD

`issues/prd.md`

## What to build

Make the site live and phone-shareable on GitHub Pages (repo `fideco1981/dsk-mockup`, served at `fideco1981.github.io/dsk-mockup/`). Audit all internal links to be relative so they work under the `/dsk-mockup/` subpath, enable Pages, and verify the live URL on a phone. This completes the tracer: shared layout + one new page, live.

See PRD → "Architecture" and "Further Notes" (sequencing).

## Acceptance criteria

- [x] Every internal link is relative; no absolute `/path` links that break under the subpath.
- [x] GitHub Pages enabled on `main` (via `gh`/API if possible; otherwise documented one-click step for the user).
- [x] A `.nojekyll` file added if any asset paths require it.
- [ ] Live URL loads `index.html` and `styret.html` correctly, including injected nav/footer and CSS. — **blocked on push** (see below).
- [ ] Verified on a mobile viewport: layout readable, hamburger menu works, links navigate. — **HITL** (requires a phone, after push).

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

### ⚠ Remaining blockers before go-live

1. **Not pushed.** Local `main` is now **4 commits ahead** of `origin/main`
   (001 shared layout, 002 styret, 003 deploy-readiness, 003 PII fix). Pushing
   `main` is required for criteria 4. **Push is the user's call** — once pushed,
   criteria 4 should auto-satisfy (Pages already built and live).
3. **Phone verification is HITL** — do after a safe push.

## Blocked by

- Blocked by `issues/001-shared-layout-foundation.md`
- Blocked by `issues/002-styret-page.md`

## User stories addressed

- User story 1
- User story 10
- User story 15
