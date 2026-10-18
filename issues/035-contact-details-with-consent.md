Status: ready-for-human
Blocked by: None (can start immediately)

## Parent PRD

`issues/prd-contact-details.md`; ADR 0004

## What to build

Board members and Contact persons can carry a phone and email, published only with recorded consent.

- **Schemas** (`board.members[]` and `clubInfo.contactPersons[]`): optional `phone` (string, phone-format validation) and `email` (Sanity `email`), plus `consent` (boolean) and `consentDate` (date). Validation: phone or email set ⇒ consent true and consentDate set. Norwegian labels and help text, including how to handle a withdrawal. Update the existing help text that forbids phone/email in a role or on a board member.
- **Cards** (the shared person card in `site.js`, used by Styret and Kontakt): with `consent === true`, phone as a `tel:` link (href normalised to digits and leading `+`) and email as a `mailto:` link, each on its own line with an icon, replacing "kontakt via klubben". Only well-formed values become links. Otherwise "kontakt via klubben" as today. Text inserted as text.
- **Fallback:** the Kontakt hand-written cards stay without contact details.
- **Privacy notes** on `styret.html` and `kontakt.html`: details shown only for people who have consented, others via the club, contact the club to have your own removed.
- Update the query if needed so the new fields are fetched.

## Acceptance criteria

- [x] Schemas updated; `sanity schema validate` passes.
- [ ] (By hand, in Studio) Publishing a person with phone or email but no consent/date is blocked.
- [x] Test: with consent, phone and email render as `tel:`/`mailto:` links on Styret and Kontakt.
- [x] Test: with consent false and fields filled, neither value appears anywhere on the page.
- [x] Test: a person with no details shows "kontakt via klubben".
- [x] Test: a malformed phone or email is not rendered as a link.
- [x] Test: markup in phone/email renders as text.
- [x] Test: Kontakt on a rejected fetch has no `tel:`/`mailto:` links.
- [x] Privacy notes updated on both pages.
- [x] PII-leak guards stay green.

## Comments

Code done: shared fields in `studio/schemaTypes/contactDetails.js` (used by `board.js` and `clubInfo.js`); `personCard` in `site.js` renders `tel:`/`mailto:` lines only with `consent === true` and well-formed values (email by an allowlist, so `?bcc=` can't be smuggled into a `mailto:`). Left open for the by-hand Studio check: publishing a person with phone or email but no consent or date must be blocked, after the Studio deploy.
