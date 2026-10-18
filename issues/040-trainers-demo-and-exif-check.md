Status: ready-for-human
Blocked by: 038, 039

## Parent PRD

`issues/prd-trainers.md`; ADR 0005

## What to build

The Trenere page is ready for the board demo, and the Studio checks an agent can't run have been done by hand.

- Deploy Studio. Enter obviously fake trainers: placeholder photos with photo consent ticked, `navn@example.no`, some with groups and Skiskole, one without merits, one without a photo.
- Check Studio validation by hand.
- Upload a photo carrying EXIF/GPS and check whether Sanity keeps it in the stored asset or the served image. Make sure no location is stored or served, and record the finding in ADR 0005.

## Acceptance criteria

- [ ] Fake trainers published; the Trenere page renders them.
- [ ] (Studio) Publishing a photo without photo consent and date is blocked.
- [ ] (Studio) Publishing phone/email without consent and date is blocked.
- [ ] (Studio) A presentation over 400 characters is blocked.
- [ ] (Studio) Crop and hotspot change the round photo on the page.
- [ ] EXIF/GPS finding recorded in ADR 0005; no location stored or served.
