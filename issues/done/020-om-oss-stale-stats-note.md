Status: ready-for-agent

## Parent PRD

`issues/prd.md`. Found while scoping 019.

## What to build

`om-oss.html` (around line 214) still has a `.board-note` saying the length, drop and max gradient are "foreløpig ikke bekreftet på nytt og er derfor utelatt her". Issue 009 (`issues/done/009-gather-club-input.md`) has since confirmed them from the GPS tracks, and `index.html` already shows them: 500 m, 133 m, 47% maks fall.

Replace the note with the confirmed figures, or remove it if the page doesn't need them. Use the same wording as `index.html` ("beregnet fra GPS-spor").

## Acceptance criteria

- [x] `om-oss.html` no longer says the figures are unconfirmed.
- [x] Any figures shown match `index.html`.

## Comments

Closeout: removed the `.board-note` from `om-oss.html`. The page never shows the stats, and the "beregnet fra GPS-spor" wording this ticket pointed to was deliberately removed from `index.html` in 0f4ecd1, so there was nothing to mirror. Replaced the old "numbers must be qualified" test with one asserting the page no longer calls them unconfirmed.
