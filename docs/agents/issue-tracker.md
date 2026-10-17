# Issue tracker: Local Markdown (issues/)

Issues and specs for this repo live as markdown files in `issues/`. Keep this layout: `ralph/` and `prd-to-issues` depend on it.

## Conventions

- The spec/PRD is `issues/prd.md` (a later effort gets `issues/prd-<slug>.md`)
- One file per ticket: `issues/<NNN>-<slug>.md`, numbered with three digits and continuing from the highest existing number in `issues/` and `issues/done/`. Never put several tickets in one file
- Each ticket starts with `## Parent PRD`, then `## What to build` and `## Acceptance criteria` (checkboxes)
- Triage state is a `Status:` line near the top (role strings are in `triage-labels.md`)
- Comments go at the bottom of the file under `## Comments`
- Closing a ticket: tick its criteria, add a closeout summary, then `git mv` it to `issues/done/`

## When a skill says "publish to the issue tracker"

Create a new `issues/<NNN>-<slug>.md` with the next free number.

## When a skill says "fetch the relevant ticket"

Read `issues/<NNN>-*.md`, or `issues/done/<NNN>-*.md` if it's already closed. The user will usually give you the number or the path.

## Wayfinding operations

Used by `/wayfinder`.

- **Map**: `issues/map-<effort>.md` (holds the Notes / Decisions-so-far / Fog sections)
- **Child ticket**: an ordinary `issues/<NNN>-<slug>.md` with a `Map: map-<effort>.md` line, a `Type:` line (`research`/`prototype`/`grilling`/`task`) and a `Status:` line (`claimed`/`resolved`)
- **Blocking**: a `Blocked by: NNN, NNN` line. A ticket is unblocked once every ticket it lists is `resolved`
- **Frontier**: tickets for that map that are open, unblocked and unclaimed. Lowest number wins
- **Claim**: set `Status: claimed` and save the file before starting work
- **Resolve**: add `## Answer`, set `Status: resolved`, then add the gist and a link to Decisions-so-far in the map
