Status: done
Blocked by: None (can start immediately)

## Parent PRD

`issues/prd-sanity-rest.md` (section "Icons")

## What to build

Prefactor for Club info: the social buttons show real brand logos and TikTok is linked, still as static markup.

- Add single-colour Instagram, Facebook and TikTok brand icons to the inline icon sprite on every page that carries it.
- Social buttons (footer, Kontakt social cards) use them instead of `icon-camera` and `icon-users`. Leave `icon-users` where it means people rather than Facebook.
- Add a TikTok button to the footer and a TikTok card to Kontakt, linking to `https://www.tiktok.com/@drammen_slalomklubb`. These become the hand-written fallback that 031 and 032 bind data to.
- Buttons keep `aria-label` with the network name. The SVG stays `aria-hidden`.

## Acceptance criteria

- [x] Every page with the sprite has the three brand icons.
- [x] No social button uses `icon-camera` or `icon-users`.
- [x] Test: the footer has Instagram, Facebook and TikTok buttons, each with an `aria-label` naming the network.
- [x] Test: Kontakt has a TikTok social card.
- [x] Existing tests and the accessibility suite stay green.
- [x] (By eye, moved to 034) Icon shapes look right.

## Comments

2026-10-18: Closed. Built on `sanity-rest` (4957dc3). Simple Icons paths (CC0). Kontakt social grid is now 2×2. By-eye icon check moved to 034.
