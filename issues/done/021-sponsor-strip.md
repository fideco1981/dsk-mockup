Status: done

## Parent PRD

`issues/prd-sanity.md` (scope extended by `docs/adr/0002-sponsor-logos-are-the-one-image-type-in-sanity.md`)

## What to build

A sponsor logo strip like the one at the bottom of drammenslalomklubb.no, placed at the top of the footer on every page. Decided in a grilling session on 2026-10-17.

- Heading "Takk til våre sponsorer". Logos are 64 px tall on white cards, all sponsors equal, and each links to the sponsor's site in a new tab with the name as alt text.
- A static centred row when the logos fit. When they overflow, a seamless pure-CSS marquee (40 px/s) that pauses on hover and focus. The copy used for the loop is `aria-hidden` and skipped by Tab. With reduced motion, the logos wrap instead.
- Sponsors come from a Sanity `sponsor` type (name, logo, url, order) in the existing single query. Logos load via `?h=128&auto=format`.
- No fallback: the strip stays hidden on failure, on an empty list and without JS (ADR 0002).

## Acceptance criteria

- [x] `studio/schemaTypes/sponsor.js` with Norwegian labels, registered in `index.js`.
- [x] Test: logos render in CMS order with alt = name and new-tab `rel="noopener"` links; a non-http(s) url gives an unlinked logo.
- [x] Test: hidden while loading, on failure, and when no sponsor is valid.
- [x] Test: logos that fit get no copy; overflowing logos scroll with an `aria-hidden`, untabbable copy; a resize re-evaluates.
- [x] axe scan (phone + desktop) passes with sponsors in the success stub.
- [x] ADR 0002 and the CONTEXT.md glossary entry.
- [x] Studio deployed with the new schema and a "Sponsorer" entry in the desk structure (`cd studio && npm run deploy`).
- [x] The four sponsors created in Studio (see Comments).
- [x] Checked by hand on localhost: the strip shows on every page, static on desktop, scrolling on a phone.

## Comments

Seed data (logos at the imgur links the current site uses):

| Order | Navn | Nettside | Logo |
|---|---|---|---|
| 1 | Trykk Service AS | https://trykk-service.no | https://i.imgur.com/CQe8Z1s.png |
| 2 | Skue Sparebank | https://www.skuesparebank.no | https://i.imgur.com/KHasQqX.png |
| 3 | TESS Teknisk Faghandel | https://tess.no | https://i.imgur.com/oLPBdMv.png |
| 4 | Sparebankstiftelsen DNB | https://sparebankstiftelsen.no | https://i.imgur.com/vXjr679.png |

The Sparebankstiftelsen DNB logo has wide built-in white margins and shows small on its card. Crop it before uploading, or get a tighter version from the foundation.

## Closeout (2026-10-17)

Built as specified. Two changes after the first pass: the Studio desk structure in `sanity.config.js` lists types explicitly, so it needed a "Sponsorer" entry (sorted by order), and logos went from 48 px to 64 px tall. Stein cropped the Sparebankstiftelsen DNB logo's whitespace before uploading. Unit tests (100) and the axe scan pass.
