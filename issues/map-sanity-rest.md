# Map — The rest of the site editable in Sanity

Label: wayfinder:map

## Destination

A spec, `issues/prd-sanity-rest.md`, ready for `prd-to-issues`/ralph: Styret, Kontakt role contacts, Club info and an improved, editable socials section all come from Sanity. Built in one go for the board demo.

## Notes

- Domain: the club site (`CONTEXT.md`, `docs/adr/`). Same architecture as `issues/prd-sanity.md`: no build step, browser fetch from the public dataset, no token in the site.
- Sessions consult `mattpocock-skills:grilling` and `mattpocock-skills:domain-modeling`; terms go into `CONTEXT.md` as they settle.
- Hand-off done (2026-10-18): `issues/prd-sanity-rest.md`, ready-for-agent.
- Settled while charting (2026-10-18), no ticket:
  - Purpose: board demo prep; everything in this map ships in one go.
  - Scope: only content that changes or that editors will touch. Styret, Kontakt role contacts, Club info, socials.
  - Fallback content only for what a visitor acts on (see `CONTEXT.md`). Styret: hidden on failure. Contact persons: current HTML kept as fallback. Club info: current values kept as fallback, including the footer's hard-coded values in `site.js`.
  - **Board member** and **Contact person** are separate lists (a person in both is entered twice). The Styret term line is one free-text field in a singleton.
  - **Club info** singleton (addresses, org number, social links, Spond signup link, membership call to action) feeds `kontakt.html`, the footer and the landing page. The Spond courses URL stays with Courses.
  - Ticket 016 no longer covers the Styret seating line.

## Decisions so far

<!-- one line per resolved ticket -->

- [How to show Instagram posts on a static site](027-research-instagram-on-static-site.md): Only hand-curated posts in Sanity or Behold's keyless JSON feed avoid secrets and Meta cookies; recommends curated posts (amends ADR 0002).
- [Socials section: what it shows and what editors control](028-socials-section-shape.md): Up to six hand-picked Featured posts (image, alt, any link) plus Instagram/Facebook/TikTok buttons from Club info with brand icons; tiles hidden on failure; ADR 0003 amends 0002.

## Not yet specified


## Out of scope

- Slope figures (lengths, drops, "3 Bakker") stay in HTML: they almost never change.
- History, the mission quote, Bragder, hero text, nav, and the Skiskole/Treningsopplegg hero and call-to-action copy stay in HTML: static prose.
