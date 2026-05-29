> **DONE 2026-05-29.** Inline `<style>` extracted verbatim to `styles.css`; `site.js`
> built as a single-source nav/footer engine (auto-runs in browser, exports for tests).
> `index.html` refactored onto both with `#site-nav`/`#site-footer` mounts, `body[data-page]`,
> `<noscript>` fallback nav, and `<script src="site.js">`. Test harness established
> (`node --test` + jsdom, `tsc` typecheck) — 7 tests cover nav injection, active link,
> footer, hamburger toggle, robustness, and page derivation. All green.
>
> **Decisions:** nav model uses the final 6-page multi-page IA (Hjem/Skiskole/Treningsopplegg/
> Om oss/Styret/Kontakt), replacing the old single-page anchors — those target pages 404 until
> issues 002/004–007 land. SVG icon sprite kept inline in `index.html` (icons are used in page
> content too); a later issue may move it into `site.js`. Topbar rotator now looks up
> `.topbar-msg` lazily since the topbar is injected. Footer simplified (dropped dead `#`-links
> and the duplicate "Trening" column) — masked contact per PRD.
>
> **Next iteration:** new pages (002+) must include the sprite + mounts + `data-page` + the
> two script/style tags. Consider a shared page skeleton or sprite-injection in `site.js`.

## Parent PRD

`issues/prd.md`

## What to build

The shared foundation every other page depends on. Extract the inline `<style>` block from `index.html` into a single `styles.css`, and build a `site.js` layout engine that injects the nav and footer into every page from one source of truth, marks the current page's link as active, and wires the mobile hamburger menu. Refactor `index.html` to consume both. The page must render and behave identically to today after the refactor.

See PRD → "Shared layout engine (`site.js`)" and "Shared styles (`styles.css`)".

## Acceptance criteria

- [ ] Inline CSS moved to `styles.css`; `index.html` links it; visual render is unchanged.
- [ ] `site.js` injects nav + footer from a single nav model into mount points on the page.
- [ ] Current page's nav link gets active state (`aria-current` / active class), derived from location/`data-page`.
- [ ] Mobile hamburger opens/closes the menu and toggles `aria-expanded`; logic rebinds after injection.
- [ ] `<noscript>`/baseline nav present so the site is navigable without JS.
- [ ] Existing accessibility work in `index.html` is preserved.
- [ ] Test harness established (none exists yet) and `site.js` public behavior is covered: nav contains expected links, active link marked, hamburger toggles state. (See PRD → Testing Decisions.)
- [ ] All internal links relative (subpath-safe).

## Blocked by

None - can start immediately.

## User stories addressed

- User story 11
- User story 12
- User story 13
- User story 14
