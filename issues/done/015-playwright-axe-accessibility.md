Status: ready-for-agent

## Parent PRD

`issues/prd-sanity.md`. This **extends** the PRD's Testing Decisions at Stein's request: the PRD only covers semantics through JSDOM assertions, and this ticket adds a real-browser accessibility scan.

## What to build

An automated accessibility check that runs every page in a real browser through axe. It catches what JSDOM can't see: colour contrast, focus and landmark issues, and the CMS-rendered state after the fetch resolves.

- Add Playwright (Chromium only) and `@axe-core/playwright` as dev dependencies, run with a separate script (e.g. `npm run test:a11y`). `npm test` (`node --test`, JSDOM) stays fast and offline, and doesn't need a browser.
- Serve the site statically and scan every page.
- Intercept the Sanity request with Playwright route stubbing, so the suite never calls the real Sanity. Scan these states:
  - CMS success, with fixture events and topbar
  - CMS failure, with the fallback revealed
  - an empty event list
  - the topbar toggled off
  - JavaScript disabled, with the `<noscript>` fallback
- Run the colour-contrast scan once per palette swatch (blue/red/green), since the board is comparing them live.
- Scan at both phone and desktop widths. Open the mobile menu and scan it too.
- Target WCAG 2.1 AA (axe tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`).

**Existing violations:** the current HTML has never been through axe, so expect findings. Fix the small, obvious ones in this ticket. File the rest as new tickets, and exclude only those specific rules or selectors, each with a comment linking its ticket. Don't add blanket rule disables.

**Blocked by:** 014 (the CMS-rendered states must exist to be scanned).

## Acceptance criteria

- [x] `npm run test:a11y` installs nothing at runtime, documents the one-time `npx playwright install chromium`, and exits non-zero on any axe violation.
- [x] Every page is scanned at phone and desktop widths, including with the mobile menu open.
- [x] The landing page is scanned in all five CMS states listed above, and no test reaches the real Sanity.
- [x] Colour contrast is checked under all three palettes.
- [x] Every remaining exclusion names its rule or selector and links a follow-up ticket.
- [x] `npm test` is unchanged and still runs without a browser.

## Comments

**Closeout (2026-10-17):** `npm run test:a11y` (`playwright test`, config `playwright.config.js`, spec `a11y/a11y.spec.js`) runs in about 1 minute: 62 scans, plus 6 desktop mobile-menu cases skipped. One-time setup is `npm run test:a11y:setup`.
- Pages are served from disk via `page.route`. Sanity is stubbed and every other request is aborted, so the run is offline.
- Each CMS state asserts what it rendered before it's scanned.
- The no-JS state is served as a no-JS browser parses it (scripts dropped, `<noscript>` unwrapped), because axe can't run with `javaScriptEnabled: false`.
- Fixed: the palette-independent contrast fails (events subtitle and empty text, event location, the green chip, the lift schedule labels), plus a real bug: without JS, `index.html`'s `.fade-in` content stayed at opacity 0.
- Remaining: the palette accent contrast is a board call. It's filed as `issues/018-palette-accent-contrast.md`, with palette-scoped `color-contrast` exclusions in `KNOWN`.
