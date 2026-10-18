Status: needs-info

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

- [ ] No page mentions 2025/26 or spring-2026 dates as current.
- [ ] The events fallback and the topbar fallback match what will be entered in Sanity (017).
- [ ] Existing page tests are updated and pass.
