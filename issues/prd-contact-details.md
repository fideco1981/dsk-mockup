# Spec — Kontaktinfo for styret og kontaktpersoner (med samtykke)

Status: ready-for-agent

> Decided in grilling on 2026-10-18. The decision and its reasons are ADR 0004; terms (Consent, Board member, Contact person) are in `CONTEXT.md`. Builds on `issues/prd-sanity-rest.md` and reverses its "personal phone/email on any card" out-of-scope line.

## Problem Statement

Visitors can't reach board members or contact persons directly: every card says "kontakt via klubben". The club wants phone and email on the cards. Publishing them is personal data, so it must only happen for people who have consented. Because the Sanity dataset is public, hiding unconsented details in the site is not enough; they must never be published.

For the board demo the feature must be visible, using obviously fake details. Real details go live only after the board signs off and consents are collected.

## Solution

Board members and Contact persons get optional phone, email and a consent checkbox with a date. Studio refuses to publish contact details without consent. The site shows them as `tel:`/`mailto:` links on the cards only with consent, and otherwise keeps "kontakt via klubben".

## User Stories

1. As a visitor, I want to call or email a board member or contact person straight from their card, so that I reach the right person without going via the club.
2. As a visitor on a phone, I want the phone number to be a tap-to-call link and the email a mail link.
3. As a visitor, I want a person without published details to still show "kontakt via klubben", so that I know how to reach them.
4. As an editor, I want to add phone and email per person, both optional.
5. As an editor, I want Studio to stop me publishing someone's phone or email unless I've ticked and dated their consent, so that I can't publish personal data by mistake.
6. As an editor handling a withdrawal, I clear the person's phone and email, untick consent and publish; Studio won't let me untick while the fields are filled.
7. As a person on the board, I want my details shown only if I've agreed, and removed when I ask.
8. As a visitor, I want the privacy notes on Styret and Kontakt to say details are shown only for those who consented, and how to get your own removed.
9. As Stein at the demo, I want obviously fake details (`navn@example.no`, `+47 000 00 000`) on the cards, so that the board sees the feature without anyone's real number published.

## Implementation Decisions

**Content model** (both `board.members[]` in `studio/schemaTypes/board.js` and `clubInfo.contactPersons[]` in `studio/schemaTypes/clubInfo.js`; Norwegian labels and help text)
- `phone` (string, optional): validated as a phone number (digits, spaces and a leading `+`).
- `email` (Sanity `email` type, optional).
- `consent` (boolean, "Samtykker til publisering av telefon og e-post") and `consentDate` (date).
- Validation: if `phone` or `email` is set, `consent` must be true and `consentDate` set. Help text explains withdrawal (clear fields, untick, publish) and that the club keeps the consent evidence elsewhere.
- Update the existing help text that says not to enter phone numbers or emails (the role field in `clubInfo.js`, the board member help text in `board.js`) so it points to the new fields instead of contradicting them.
- The lists stay separate (ADR 0004).

**Rendering** (`site.js`, the shared person card used by Styret and Kontakt)
- With `consent === true`: phone as `<a href="tel:…">` (href normalised to digits and a leading `+`, text as entered) and email as `<a href="mailto:…">`, each on its own line with an icon, replacing "kontakt via klubben". Only values that pass a simple format check become links. Text inserted as text.
- Without consent, or with no details: "kontakt via klubben", as today.
- The Kontakt fallback HTML is unchanged: no contact details.

**Privacy notes** (`styret.html`, `kontakt.html`): replace "Personlige … vises ikke her" with text saying contact details are shown only for people who have consented, others are reached via the club, and you can have your own removed by contacting the club.

## Testing Decisions

- Same seam as before: `init(doc)` with `stubFetch`, loading the real `styret.html` and `kontakt.html`.
- Cases: details render as `tel:`/`mailto:` links with consent; with `consent` false (fields filled), no phone or email appears anywhere on the page; a person with no details shows "kontakt via klubben"; malformed phone/email doesn't become a link; markup in the fields renders as text; Kontakt fallback on a rejected fetch has no `tel:`/`mailto:` links.
- The existing PII-leak guards keep running against the rendered pages and stay green (fixtures use fake values; baseline values must not appear).
- Not tested: Studio validation and UI (checked by hand in Studio).

## Out of Scope

- Role addresses on the club domain (ADR 0004, rejected for now).
- A shared Person document linking the two lists.
- The privacy statement page (`personvern.html`) and collecting consent: go-live checklist (ticket 036).
- Any check that placeholders are gone from live Sanity.

## Further Notes

- **Demo (Stein):** after the Studio deploy, enter fake details with consent ticked for a few people.
- **Go-live:** ticket 036. The site must not go live with placeholders showing.
- Not legal advice: check the consent wording against Datatilsynet's guidance or NIF's before go-live.
