Status: ready-for-agent
Blocked by: None (can start immediately)

## Parent PRD

`issues/prd-trainers.md`; ADR 0004

## What to build

A Trenere page in the main menu, where editors keep the club's trainers in Studio and the page shows them as cards in the Styret style. Tags and photos come in 038 and 039.

- **Singleton `trainers` ("Trenere")** following the existing singleton pattern (as `board`): a drag-ordered array of trainers with `name` (required), `role` (optional short free text, e.g. "Hovedtrener"), `presentation` (text, max 400 characters), `merits` (array of short strings, coaching qualifications included), and the shared phone/email/consent fields from ADR 0004. Norwegian labels and help text, including "only trainers aged 18 or over" and that a person who is also on the board is entered here with their own consent. Add it to the Studio left menu.
- **Page `trenere.html`**: same layout and sprite as Styret. "Trenere" in the main menu after Treningsopplegg. Hard-coded hero, intro and privacy note (contact details shown only with consent, others via the club, contact the club to have your own removed; worded so 039 can add photos). The trainer grid is hidden until Sanity answers, and stays hidden on failure, with an empty list, or without JS (no Fallback content).
- **Cards**, extending the shared person card: in Studio order, entries without a text name skipped. Initials avatar, name, role, presentation as text, merits as a list (omitted when empty), phone/email exactly as on Styret and Kontakt. Without phone/email the card simply ends: no "kontakt via" line. Single column on phones.
- The shared query fetches the singleton. All CMS strings inserted as text.
- Add **Trainer** to `CONTEXT.md`.

## Acceptance criteria

- [ ] Schema added and in the Studio menu; `sanity schema validate` passes; `test/studio.test.js` and `test/deploy.test.js` pass unchanged.
- [ ] Test: trainers render in Studio order with name, role, presentation and merits.
- [ ] Test: the menu marks Trenere active, after Treningsopplegg, on every page.
- [ ] Test: empty merits render no list.
- [ ] Test: phone/email consent cases as for Styret (consent false hides both; malformed values are not links); no "kontakt via" line.
- [ ] Test: markup in every text field renders as text.
- [ ] Test: grid hidden before Sanity answers, on a rejected fetch and with an empty list; intro and privacy note still shown.
- [ ] `CONTEXT.md` has **Trainer**.
