Status: ready-for-agent
Blocked by: None (can start immediately)

## Parent PRD

`issues/prd-sanity-rest.md` (section "Styret")

## What to build

Editors maintain the board in Studio and Styret renders it from Sanity.

- **Singleton `board` (Styret)**, following the existing singleton pattern: `term` (one line of free text, e.g. "Valgt på årsmøtet 2026, sittende inntil årsmøtet 2027") and `members`, an ordered array of `{ name (required), position (required, one of Styreleder, Nestleder, Sportslig leder, Styremedlem, Vara) }`. Order is the array order (drag to reorder), with no order field. Norwegian labels and help text. Add it to the Studio left menu.
- The shared layout engine's single query gains the board.
- **Styret:** remove the hand-written board cards. The board grids and the term line are hidden until Sanity answers, then rendered. On failure they stay hidden (no fallback, per `CONTEXT.md`). The hero title and the privacy note stay.
- Members with position Vara go in the "Varamedlemmer" grid with the deputy avatar style; the rest go in "Styremedlemmer", each in array order. With no deputies, the Vara subheading and grid are hidden.
- Card markup is unchanged: initials avatar, name, position. Initials are the first letter of the first and last word of the name.
- The subtitles drop their counts ("Åtte styremedlemmer…", "To varamedlemmer…") and become count-free prose.
- CMS strings are inserted as text only.
- Update the Studio entry in `CONTEXT.md`.

## Acceptance criteria

- [ ] Schema `board` registered. `sanity schema validate` passes. It appears in the Studio left menu as a singleton (no "create new", no duplicate/delete).
- [ ] Test: members render in array order, split into the board and Vara grids.
- [ ] Test: with no Vara members, the Vara subheading and grid are hidden.
- [ ] Test: the term line shows the `term` text.
- [ ] Test: initials are derived from the first and last word of the name.
- [ ] Test: on a rejected fetch, the board grids and term line stay hidden.
- [ ] Test: a name containing markup renders as text.
- [ ] The existing Styret tests that assert the hand-written board use CMS fixtures. The PII-leak guard runs against the rendered page and stays green.
- [ ] Subtitles contain no member counts.
- [ ] `CONTEXT.md` Studio entry updated.
