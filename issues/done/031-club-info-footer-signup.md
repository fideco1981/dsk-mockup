Status: done
Blocked by: 030

## Parent PRD

`issues/prd-sanity-rest.md` (sections "Content model" and "Club info consumers")

## What to build

Editors change the club's addresses, social links, Spond signup link and membership pitch in one place. The footer and every signup button follow.

- **Singleton `clubInfo` (Klubbinfo)**, following the existing singleton pattern, with the complete schema (Kontakt and the socials section read the rest later):
  - `visitAddress`, `postAddress`, `orgNumber` (text)
  - `instagram`, `facebook`, `tiktok` (optional URLs; empty hides that network's button everywhere)
  - `spondSignup` (URL)
  - `membershipText` and `membershipPoints` (a short list of text lines)
  - `contactPersons`, an ordered array of `{ name (required), role (required, free text) }`, with help text saying not to put phone numbers or emails in a role
  - Norwegian labels and help text. Add it to the Studio left menu. The Spond courses URL stays with Courses.
- The shared layout engine's single query gains Club info.
- **Footer:** address lines, social buttons and the "Bli Medlem" link render from Club info. A network with no URL has no button.
- **Signup links:** the nav "Bli Medlem" CTA, the landing hero CTA, the landing membership CTA and the "Bli medlem & meld på" link on Treningsopplegg follow `spondSignup`.
- **Landing membership block:** the paragraph and the points under "Meld deg inn nå" follow `membershipText` and `membershipPoints`. The "Bli en del av klubben" heading stays in HTML.
- **Fallback:** the current hard-coded values (including TikTok from 030) show until Sanity answers and stay on failure or without JS.
- Links render only for `http(s)` URLs and open in a new tab with `rel="noopener"`. CMS text is inserted as text.
- Update the Studio entry in `CONTEXT.md`.

## Acceptance criteria

- [x] Schema `clubInfo` registered with all fields above. `sanity schema validate` passes. It appears in the Studio left menu as a singleton.
- [x] Test: footer addresses follow Club info.
- [x] Test: footer social buttons render only for networks with a URL, each with an `aria-label`. A non-http(s) URL is not rendered as a link.
- [x] Test: nav CTA, hero CTA, membership CTA, footer "Bli Medlem" and the Treningsopplegg signup link all follow `spondSignup`.
- [x] Test: membership paragraph and points follow Club info.
- [x] Test: on a rejected fetch, the footer and CTAs keep the fallback values.
- [x] The no-token guard stays green.
- [x] `CONTEXT.md` Studio entry updated.

## Comments

2026-10-18: Closed. Built on `sanity-rest` (8c0a8b1, 6699dcd). Pages opt in via `data-club`, `data-social`, `data-spond-signup`, `data-club-points`, all handled by `renderClubInfo` in `site.js`. If Sanity answers with an empty field or list, the fallback stays.
