Status: ready-for-agent
Blocked by: 037

## Parent PRD

`issues/prd-trainers.md`; needs ADR 0005

## What to build

Trainer cards show a round photo, published only with a ticked, dated photo consent, separate from the phone/email consent.

- **ADR 0005:** trainer photos are the third image type in Sanity (ADR 0002 requires a decision per image type), published only with a ticked, dated photo consent enforced by Studio; separate from the phone/email consent; withdrawal includes deleting the asset; no Fallback content. Leave the EXIF/GPS finding as an open item for 040.
- **Schema:** trainer gets `photo` (image, optional, crop and hotspot on), `photoConsent` (boolean) and `photoConsentDate` (date). Photo set ⇒ both required. Help text on withdrawal: remove the photo, untick, publish, then delete the file in the media library (removing it from the document leaves it reachable on the CDN).
- **Query:** photo URL, crop and hotspot.
- **Cards:** photo only with `photoConsent === true` and an https Sanity image: round, about 112 px, a square from the crop and hotspot (reuse the existing Featured-post square logic), `alt=""`. Otherwise the initials avatar.
- **Privacy note** on `trenere.html` covers photos too.
- **Ticket 036** gets: collect trainer photo consents, and replace the Trenere page's placeholders.

## Acceptance criteria

- [ ] ADR 0005 written.
- [ ] `sanity schema validate` passes.
- [ ] Test: with photo consent, the photo renders with `alt=""` and a URL using the crop/hotspot square.
- [ ] Test: without photo consent, initials show and the image URL appears nowhere on the page.
- [ ] Test: a non-https image URL is not rendered.
- [ ] Privacy note and ticket 036 updated.
