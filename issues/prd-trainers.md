# Spec — Trenere: presentasjon av klubbens trenere

Status: ready-for-agent

> Decided in grilling on 2026-10-18. Builds on ADR 0004 (consent for personal details) and needs a new ADR 0005 (trainer photos, the third image type in Sanity, published only with consent), because ADR 0002 requires a separate decision for every image type. Terms: Board member, Training group, Consent, Fallback content in `CONTEXT.md`; this spec adds **Trainer**.

## Problem Statement

Parents and athletes can't see who coaches the club's groups and ski school. There is a Styret page for the board but nothing for the trainers, who are the people families actually deal with week to week. The club wants a page presenting each trainer with name, photo, merits in the sport, responsibilities and a short presentation.

A photo, like a phone number, is personal data, and the Sanity dataset is public. So photos and contact details must only be published with recorded consent, enforced in Studio, as for the board.

## Solution

A new page, Trenere, in the main menu after Treningsopplegg. It shows the club's adult trainers and ski-school instructors in an editor-chosen order, as cards in the Styret style: a round photo (or initials without a photo or consent), name, responsibility tags in the Training group colours that link to the group or the ski school, a short presentation, merits as a list, and phone/email when consented. Editors maintain everything in Studio. Studio refuses to publish a photo without a ticked and dated photo consent, and phone/email without their own consent, as on Styret.

## User Stories

1. As a parent, I want a Trenere page in the main menu, so that I can find my child's trainers without asking around.
2. As a parent, I want to see each trainer's photo, so that I recognise them at the slope.
3. As a parent, I want to see which Training group(s) a trainer is responsible for, so that I know who coaches my child.
4. As a parent, I want a trainer's group tags in the group's colour, so that I can scan the page for my child's group.
5. As a parent, I want a group tag to take me to that group on Treningsopplegg, so that I can see times and place.
6. As a parent of a ski-school child, I want instructors marked "Skiskole", linking to the Skiskole page.
7. As a visitor, I want a trainer's role in words (e.g. "Hovedtrener"), so that I know who leads a group.
8. As a visitor, I want a short presentation of each trainer, so that I get a sense of who they are.
9. As a visitor, I want a trainer's merits (results, coaching qualifications) listed, so that I can see their background.
10. As a visitor, I want no empty merits list on a trainer without merits.
11. As a parent, I want to call or email a trainer who has agreed to it, straight from the card.
12. As a visitor, I want a trainer without a photo or photo consent to show initials, like the board, so that the grid stays even.
13. As a visitor on a phone, I want the cards readable in a single column.
14. As a visitor, I want a privacy note saying photos and contact details are shown only with consent and how to have your own removed.
15. As a visitor, I want the page to stay tidy when Sanity fails: the trainer section hidden, intro and privacy note shown.
16. As an editor, I want one Trenere document with a list I can drag to reorder, like Styret.
17. As an editor, I want to pick a trainer's responsibilities from the existing Training groups plus "Skiskole", so that names and colours stay in sync.
18. As an editor, I want to delete or rename a Training group without first editing every trainer, so that the groups editor doesn't need to know about the Trenere page.
19. As an editor, I want Studio to stop me publishing a photo unless photo consent is ticked and dated.
20. As an editor, I want separate consents for photo and for phone/email, because a trainer may agree to one and not the other.
21. As an editor, I want to crop the photo and set its focus point in Studio, so that the round photo shows the face.
22. As an editor, I want Studio to stop a presentation longer than 400 characters, so that cards stay even.
23. As an editor, I want help text telling me only trainers aged 18 or over go on the page.
24. As an editor handling a photo withdrawal, I want help text telling me to remove the photo, untick, publish, and delete the file in the media library, so that the photo is really gone.
25. As an editor, I want a person who is both on the board and a trainer entered on each page with its own consent, as with contact persons.
26. As a screen-reader user, I want the photo skipped (the name is right beside it), and the tags and links to read sensibly.
27. As Stein at the demo, I want obviously fake trainers (placeholder photos, `navn@example.no`), so that the board sees the page without anyone's real data published.

## Implementation Decisions

**Content model** (new singleton, Norwegian labels and help text; added to the Studio structure)
- Singleton `trainers` ("Trenere") with a drag-ordered array of trainer objects.
- Trainer: `name` (required); `photo` (image, optional, crop and hotspot on) with `photoConsent` (boolean) and `photoConsentDate` (date): photo set ⇒ both required; `groups` (array of **weak** references to `trainingGroup`); `skiSchool` (boolean, "Skiskole"); `role` (optional short free text, e.g. "Hovedtrener"); `presentation` (text, max 400 characters); `merits` (array of short strings, coaching qualifications included); plus the shared phone/email/consent fields from ADR 0004, a separate consent from the photo's.
- Help text: adults (18+) only; photo withdrawal = remove photo, untick, publish, then delete the file in the media library (removing it from the document leaves the file reachable on the CDN).
- Before go-live, verify whether Sanity keeps EXIF/GPS on uploaded photos and make sure no location is stored or served; record the finding in ADR 0005.

**ADR 0005**: trainer photos are the third image type in Sanity, published only with a ticked, dated photo consent enforced by Studio; separate from the phone/email consent; withdrawal includes deleting the asset; no Fallback content.

**Page** (`trenere.html`, new, same layout and sprite as Styret)
- Main menu: "Trenere" after Treningsopplegg.
- Hard-coded hero, intro and privacy note (photo and contact details only with consent; others via the club; contact the club to have your own removed). The trainer grid is hidden until Sanity answers, and stays hidden on failure, with no trainers, or without JS (no Fallback content).

**Rendering** (`site.js`, extending the shared person card)
- Order as in Studio. Entries need a text name.
- Photo: shown only with `photoConsent === true` and an https Sanity image; round, about 112 px, a square from the crop and hotspot (the existing Featured-post square logic), `alt=""`. Otherwise the initials avatar.
- Tags: one per referenced group that resolved (missing/deleted groups are skipped), in the group's colour, linking to the group's anchor on Treningsopplegg (same slug as there); "Skiskole" in the ski-school colour, linking to Skiskole. The role text beside the tags.
- Presentation as text; merits as a list, omitted when empty.
- Phone/email exactly as on Styret and Kontakt (consent, format checks, `tel:`/`mailto:`); without them, no "kontakt via" line is required: the Trenere card simply ends.
- All CMS strings inserted as text.
- The query fetches the singleton with the group references resolved to title and colour.

**Docs**: `CONTEXT.md` gets **Trainer**; ticket 036 (go-live) gets collecting trainer photo consents and the Trenere page's placeholders.

## Testing Decisions

- Test external behaviour through the page, not helpers: `init(doc)` with `stubFetch`, loading the real `trenere.html`. Prior art: `test/styret.test.js`, `test/kontakt.test.js`.
- Cases: order and fields render; the menu marks Trenere active; photo only with photo consent (without it, initials and the image URL appears nowhere on the page); photo URL uses the crop/hotspot square; tags in group colours linking to the right anchors, Skiskole to Skiskole, a missing group skipped; empty merits omitted; phone/email consent cases as for Styret; markup in every text field renders as text; hidden before Sanity answers, on a rejected fetch and with an empty list, with intro and privacy note still shown.
- `test/studio.test.js` (schema type in the Studio menu) and `test/deploy.test.js` (subpath-safe links on every menu page) cover the new type and page without changes.
- Not tested: Studio validation (photo/consent, 400 characters) and the withdrawal steps: checked by hand in Studio.

## Out of Scope

- Trainers shown per group on Treningsopplegg (the weak references allow it later).
- A "Møt trenerne" teaser on the landing page.
- Trainers under 18.
- A detail page per trainer.
- Automatic deletion of a photo's file on withdrawal.
- Real trainer data: go-live checklist (ticket 036).

## Further Notes

- Demo: fake trainers with placeholder photos and consent ticked, entered after the Studio deploy.
- Not legal advice: check the photo-consent wording against Datatilsynet's or NIF's guidance before go-live, together with the contact-details consent.
