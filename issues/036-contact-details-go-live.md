Status: ready-for-human
Blocked by: 035

## Parent PRD

`issues/prd-contact-details.md` (section "Further Notes"); ADR 0004

## What to build

Stein and the club take contact details from fake placeholders to real, consented details. The site must not go live with placeholders showing.

**Demo (before the board demo):**
- Deploy the updated Studio.
- Enter fake details (`navn@example.no`, `+47 000 00 000`) with consent ticked for a few Board members and Contact persons.

**Go-live:**
- The board signs off on publishing contact details (closes the open item from ticket 009).
- The club collects consent from each person to be published and keeps the evidence outside the site (e.g. a Spond form or an email).
- Check the consent wording against Datatilsynet's or NIF's guidance.
- Publish a privacy statement (`personvern.html`, linked from the footer): what is published, on what basis (consent), how to withdraw. Agent can draft; the club approves.
- Replace every placeholder in Studio with real details, or clear it.
- Collect photo consent from each trainer whose photo is published (separate from phone/email consent, ADR 0005), and keep the evidence outside the site.
- Replace the Trenere page's placeholders (fake trainers, placeholder photos) with real, consented trainers, or remove them; delete placeholder photo files in the media library.

## Acceptance criteria

- [ ] Demo: fake details visible on Styret and Kontakt.
- [ ] Board sign-off recorded under `## Comments`.
- [ ] Consent collected and stored by the club for every published person.
- [ ] Privacy statement published and linked from the footer.
- [ ] No `example.no` or `000 00 000` left in published Sanity content.
- [ ] Photo consent collected and stored by the club for every trainer with a published photo.
- [ ] No placeholder trainers or photos left on Trenere.
