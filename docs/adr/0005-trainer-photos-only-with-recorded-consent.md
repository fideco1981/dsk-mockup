# Trainer photos are the third image type in Sanity, published only with recorded consent

Status: accepted (2026-10-18). Amends 0002; builds on 0004.

## Context

The Trenere page (`issues/prd-trainers.md`) presents each Trainer with a photo, so parents recognise them at the slope. ADR 0002 allows images in Sanity per type, each needing its own decision; Sponsor logos (0002) and Featured posts (0003) are the first two. A photo of a person is personal data, like a phone number (ADR 0004), and the Sanity dataset is public: anything published there can be queried directly, whatever `site.js` renders.

## Decision

- Trainers get an optional `photo` (image, with Studio's crop and hotspot), plus `photoConsent` (checkbox) and `photoConsentDate`.
- **Studio enforces it.** A trainer with a photo can't be published unless photo consent is ticked and dated.
- **Separate from the phone/email consent.** A trainer may agree to one and not the other, so each has its own checkbox and date.
- `site.js` renders the photo only when `photoConsent` is true and the URL is https, as a second guard. Otherwise the card shows the initials avatar. The photo is round, a square from the crop and hotspot (the Featured-post logic), with `alt=""`: the name is right beside it.
- **Withdrawal includes deleting the asset.** Remove the photo, untick, publish, then delete the file in Studio's media library. Removing the photo from the document alone leaves the file reachable on Sanity's CDN. Help text in Studio says so.
- **No Fallback content**, as for the other image types: without Sanity or JS the trainer grid is hidden, and the intro and privacy note stay.

## Alternatives rejected

- **One consent for photo and contact details.** Simpler for editors, but forces an all-or-nothing choice on trainers.
- **Consent checked only in `site.js`.** The public dataset would still serve unconsented photos (same reason as ADR 0004).
- **Photos in the repo.** Only Stein could change them, and git keeps a withdrawn photo in history.

## Consequences

- Images are now in Sanity for three types. A fourth still needs its own decision.
- Studio's checkbox and date record that consent exists; the evidence is kept by the club outside the site. Collecting real photo consents is on the go-live checklist (ticket 036).
- Withdrawal is a manual, two-place step (document and media library). Automatic deletion is out of scope.

## Open items

- **EXIF/GPS.** Not yet verified whether Sanity keeps EXIF and GPS metadata on uploaded photos, or serves it in the original or transformed files. Must be checked and recorded here before real photos go live (ticket 040).
