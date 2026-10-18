# Personal contact details are published only with recorded consent

Status: accepted (2026-10-18). Reverses the "no personal phone/email on any card" line in `issues/prd-sanity-rest.md`.

## Context

Board member and Contact person cards show name and role only, with "kontakt via klubben". The club wants visitors to reach these people directly by phone and email. Ticket 009 left "which board contact details can be republished" to the board, and that is still open. Publishing a person's phone number is processing personal data: the club, as controller, needs a legal basis for each person and must honour withdrawal. Code can't supply the basis; it can refuse to publish without it.

The Sanity dataset is public. `site.js` reads it without a token, so anyone can query it directly. Whatever is published in Sanity is public, whatever `site.js` chooses to render.

## Decision

- Board members and Contact persons get optional `phone` and `email`, plus `consent` (checkbox) and `consentDate`. One consent covers both channels.
- **Studio enforces it.** A person with phone or email filled in can't be published unless consent is ticked and dated. Withdrawal means clearing the fields, unticking and publishing.
- `site.js` renders phone (`tel:`) and email (`mailto:`) only when consent is true, as a second guard, and only from validated values.
- Fallback content (the hand-written Kontakt cards) never holds contact details: it can't check consent and it lives in git.
- The two lists stay separate. A person in both is entered, and consents, twice.

## Alternatives rejected

- **Consent checked only in `site.js`.** The public dataset would still serve unconsented numbers to anyone querying the API.
- **Role addresses on the club domain** (e.g. `leder@drammenslalomklubb.no`, possible since the domain's mail runs on Google). Fewer personal data and they survive board changes, but the club chose personal details.
- **A shared Person document referenced by both lists.** Avoids entering details twice, but it's a larger remodel than a handful of overlapping people justifies.

## Consequences

- Studio's checkbox and date record that consent exists. The evidence (a form, an email) is kept by the club outside the site.
- Going live with real details needs board sign-off, collected consents and a privacy statement (`personvern.html`). Tracked as a human checklist, not code.
- The mockup uses obviously fake values (`navn@example.no`, `+47 000 00 000`) entered in Sanity with consent ticked. They must be replaced before go-live; no test can see live Sanity to catch them.
