Status: done

## Parent PRD

`issues/prd-sanity.md`

## What to build

Nothing on the site shows last season, including for visitors who see the fallback content (no JavaScript, or Sanity unreachable).

- Refresh the events fallback HTML on the landing page to the 2026/27 events.
- Refresh the topbar fallback text (in the shared layout) to the 2026/27 season.
- Fix the ski-school 2025–2026 course dates (HTML, outside the CMS slice).

**Needs info (Stein, from the club):** the 2026/27 Telenorkarusellen dates, the next årsmøte date, the topbar text and the 2026–27 ski-school course dates. (The styret seating line moved to Sanity: see `issues/map-sanity-rest.md`.) Move this ticket to `ready-for-agent` once those are written under `## Comments`.

See PRD: "Further Notes → Stale content outside this slice".

**Blocked by:** None (it waits on club input, not on code).

## Acceptance criteria

- [x] No page mentions 2025/26 or spring-2026 dates as current.
- [x] The events fallback and the topbar fallback match what will be entered in Sanity (017).
- [x] Existing page tests are updated and pass.

## Comments

2026-10-18, Stein: the 2026/27 Telenorkarusellen and årsmøte dates aren't known; delete them from the fallback. Bama skifestival (in Sanity) is real. The topbar texts are live in Sanity. The 2026–27 ski-school course dates were already in `skiskole.html` (weeks 1–10 2027).

## Closeout

Done 2026-10-18. The events fallback on `index.html` no longer has the 2026 Telenorkarusellen and Årsmøte cards; it shows the one confirmed event, Bama skifestival 12–14 March 2027, as in Sanity. The fallback topbar (site.js and the `<noscript>` on all 8 pages) now uses the first live Sanity message: "Vi venter i spenning på snøen! · Påmelding til skiskolen er åpen — Meld deg på her →". Tests in `test/index.test.js` and `test/cms.test.js` updated. The Haukåsrennet and Telenorkarusellen events in Sanity are test placeholders (Stein, 2026-10-18) and are not copied into the fallback.
