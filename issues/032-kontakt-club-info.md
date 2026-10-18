Status: ready-for-agent
Blocked by: 031

## Parent PRD

`issues/prd-sanity-rest.md` (section "Club info consumers", Kontakt)

## What to build

Kontakt renders the club's facts, contact persons and social links from Club info, with the hand-written page as the fallback.

- The visiting address, postal address and org number fact chips follow Club info.
- The contact person cards render from `contactPersons` in array order, with today's markup (initials avatar, name, role, "kontakt via klubben").
- The social cards (Instagram, Facebook, TikTok) render only for networks with a URL. The Spond card follows `spondSignup`.
- **Fallback:** the current HTML (with the TikTok card from 030) shows until Sanity answers and stays on failure or without JS.
- Links render only for `http(s)` URLs and open in a new tab with `rel="noopener"`. CMS text is inserted as text.

## Acceptance criteria

- [ ] Test: contact persons render in array order from Club info, with name and role.
- [ ] Test: addresses and org number follow Club info.
- [ ] Test: social cards render only for networks with a URL, including TikTok. The Spond card follows `spondSignup`.
- [ ] Test: on a rejected fetch, the fallback cards and values remain.
- [ ] Test: a role containing markup renders as text.
- [ ] The Kontakt PII-leak guard runs against the rendered page with CMS fixtures and stays green.
