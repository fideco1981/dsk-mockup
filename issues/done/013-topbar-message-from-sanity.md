Status: ready-for-agent

## Parent PRD

`issues/prd-sanity.md`

## What to build

The tracer bullet through the shared layout engine. On every page, the topbar shows the Topbar message published in Studio. Whatever goes wrong, a visitor never sees a broken or stale topbar.

- `init(doc)` keeps everything it does today, now also loads CMS content, and **returns a Promise** that resolves once the content is applied or the fallback is revealed.
- One query per page load to Sanity's **live** API (not the CDN endpoint), with no token, using `doc.defaultView.fetch`. The query already fetches events too, so 014 only adds rendering.
- The topbar message stays hidden (or shows a skeleton) until the response arrives. On success the CMS text is shown, with an optional link (http(s) only, new tab, `rel="noopener"`). When the toggle is off, the message is hidden.
- On a rejection, a non-OK response or malformed data, the hand-written fallback text is revealed. `<noscript>` visitors see the fallback.
- CMS strings are inserted as text, never as HTML. The decorative icon stays `aria-hidden`.
- The project ID and dataset are plain constants, taken from 011.

See PRD: "Shared layout engine", "Loading behaviour and fallback content", "Rendering and safety", "Testing Decisions".

**Blocked by:** 011 (project ID constant; the tests stub fetch and don't need it).

## Acceptance criteria

- [x] The shared test helper can stub `fetch` on the JSDOM window. No test calls the real Sanity.
- [x] Test: after `await init(doc)`, the topbar shows the CMS text.
- [x] Test: with the toggle off, the topbar message is hidden.
- [x] Test: a fetch rejection and a non-OK response both reveal the fallback text.
- [x] Test: a CMS string containing markup is rendered as text.
- [x] Test: a non-landing page (no events mount) gets the CMS topbar and doesn't break.
- [x] Test: source-text guard that `site.js` contains no token, modelled on the styret `LEAKED` guard.
- [x] The existing `site.js` tests still pass; real pages work without awaiting `init`.
- [x] Checked by hand on localhost against the real dataset.
