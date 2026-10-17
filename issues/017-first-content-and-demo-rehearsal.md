Status: ready-for-human

## Parent PRD

`issues/prd-sanity.md`

## What to build

Prepare the board demo: real 2026/27 content in Sanity, and one full rehearsal of the demo moment.

- Enter the 2026/27 Telenorkarusellen events, the årsmøte and the topbar text in Studio.
- Rehearse: reload the live site on a phone → edit an event in Studio → publish → reload on the phone → the change is visible.
- Confirm that the live endpoint reflects a publish on the next reload. If it doesn't, write that down here and flag it before the meeting.
- Check the skeleton and loading state by eye on a phone (not covered by automated tests).

See PRD: "Further Notes → Demo script".

**Blocked by:** 012, 014, 015, 016.

## Acceptance criteria

- [ ] The 2026/27 events and topbar text are published in Sanity.
- [ ] One rehearsal completed on a phone against the live GitHub Pages site.
- [ ] The time from publish to visible on reload is noted under `## Comments`.
