## Parent PRD

`issues/prd.md`

## What to build

`treningsopplegg.html` — one page with four deep, anchored sections: Rekrutten, Teknikeren, DSK Fun, U12–U16 DSK. Each section gives age range, purpose, days/times, locations, fees, and requirements. Anchor nav between the four.

Content from `content-baseline.md` → "Treningsopplegg". U12–U16 price is unknown — mark provisional pending issue 009.

## Acceptance criteria

- [x] Four sections present with correct ages, schedules, locations, and fees per baseline.
- [x] Group name spelled "Teknikeren" (not "Teknikern") throughout.
- [x] U12–U16 price shown as provisional/"kontakt for pris" until issue 009 supplies it.
- [x] In-page anchor navigation between the four groups.
- [x] Uses shared `styles.css` + injected nav/footer; "Treningsopplegg" nav state active; mobile menu works.
- [x] All links relative; accessible.

## Done (2026-05-29)

Built on the shared layout. Four anchored sections (`#rekrutten`,
`#teknikeren`, `#dsk-fun`, `#u12-u16`) with `scroll-margin-top: 80px` so
the nav doesn't overlap section headers when jumping in. Top of page
has a 4-card `.quick-nav-grid` that links directly to each section —
4-col @ 1200, 2-col @ 1024, 1-col @ 768.

Each group section uses the existing `.course-facts` pattern (4 fact
rows: dager / tid / sted / pris) and a 2-card `.info-grid` for
requirements & extras. Group sections alternate `--dark` / `--dark2`
backgrounds (`.training-group` / `.training-group-alt`).

U12–U16 price intentionally shown as "kontakt for pris — avklares per
gruppe" with a `.board-note` explaining it's not yet bekreftet (gated
on issue 009). Test asserts U12–U16 section text matches one of:
`kontakt for pris`, `pris.*ikke`, `avklares`, `må bekreftes`, `ikke
bekreftet`, `kommer`, `oppgis.*spond`.

Telenorkarusellen dates (19 Jan / 18 Feb / 9 Mar) mentioned in the
Rekrutten info-card per baseline.

## Files

- New: `treningsopplegg.html`, `test/treningsopplegg.test.js`,
  `issues/done/007-treningsopplegg-page.md`
- Modified: `styles.css` (+118 lines, scoped to `.training-*`,
  `.quick-nav-*`)

## Feedback loops

- `npm run test`: 50/50 green (12 new treningsopplegg + 38 prior).
  Deploy audit auto-picked up `treningsopplegg.html` via the NAV_MODEL
  on-disk scan — no test edit needed.
- `npm run typecheck`: clean.

## Blocked by

- Blocked by `issues/001-shared-layout-foundation.md`

## User stories addressed

- User story 5
