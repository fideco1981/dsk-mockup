Status: ready-for-human

## Parent PRD

`issues/prd-sanity.md` (adds a fourth Sanity type, Training group)

## What to build

Move the training groups on `treningsopplegg.html` into Sanity. The club has renamed them Grønn, Blå, Rød, Sort and Fun; these replace the four hand-written sections (Rekrutten, Teknikeren, DSK Fun, U12–U16). Fun is the old DSK Fun under a new name.

- New document type `trainingGroup` (Treningsgruppe), sorted by an order field, like Sponsor. Editors can add and remove groups.
- Fields:
  - **title** (required)
  - **colour** (required): fixed list Grønn, Blå, Rød, Sort, Orange. Each value needs a colour in `site.js` and CSS; add to both together, the same pattern as Chip. Red and black are new; Fun uses orange.
  - **order** (required, number)
  - **description**: plain text, warning above ~500 characters
  - **age**: free text, e.g. `U8` or `10–13 år`
  - **place**, **price**: free text
  - **sessions**: array of `{ day: Mandag–Søndag, from: TT:MM, to: TT:MM }`. All three are required within a session. TT:MM uses the same regex as Event's start time, and `to` must be after `from`. No overlap check: groups can train at the same time.
- The page renders both the quick-nav cards ("Velg gruppe": age + title, with no subtitle) and the group sections from the same query. The "Fire grupper" heading follows the group count.
- Sessions are shown one line per session, sorted Monday→Sunday, e.g. "Mandag 18:00–19:30". No merging of equal times.
- Empty optional fields are left out of the section and the card.
- Section anchors are a slug of the title, generated in `site.js` (æ→ae, ø→o, å→a): `#gronn`, `#bla`, `#rod`, `#sort`, `#fun`. No slug field. Nothing outside the page links to the old anchors.
- Fallback content: rewrite the four sections into the five new groups with name and colour, plus "Tider og pris kommer — se Spond". Don't make up times, ages or prices; the content isn't settled yet. Keep the Spond sign-up block.
- Sanity failing **or returning zero groups** keeps the fallback, so this can ship before editors enter content.
- The old info cards (Telenorkarusellen, equipment, etc.) and the tag lines are dropped. Editors can put that text in the description.
- CONTEXT.md: add **Training group**, and note its colour list next to Chip.

## Acceptance criteria

- [x] Schema: `trainingGroup` with the fields above, registered in `studio/schemaTypes/index.js`. `sanity schema validate` passes.
- [x] Studio rejects a session with a bad TT:MM, a missing day/from/to, or `to` not after `from`.
- [x] Test: groups render in order; quick-nav cards and sections match, and anchors link to the slugged ids.
- [x] Test: sessions are sorted Monday→Sunday, one line each.
- [x] Test: a group with only title and colour renders without empty place/price/age/session lines.
- [x] Test: a Sanity error and an empty result both leave the fallback in place.
- [x] `test/treningsopplegg.test.js` updated from the old anchors to `#gronn`, `#bla`, `#rod`, `#sort`, `#fun`.
- [x] New red and black tag colours pass the axe contrast scan.
- [x] CONTEXT.md updated.
- [ ] (HITL) Studio deployed. Stein enters the five groups in Studio when the content is settled; until then the site shows the fallback.

## Comments

2026-10-17: Agent work done; only the HITL step is left (`cd studio && npx sanity deploy`, then enter the groups when the content is settled). Close and move to `done/` after that.

- The section tag shows the age only and is left out when there's no age. Colour shows as a bar beside the section heading and a top border on the quick-nav card. This means the fallback doesn't show "Orange" for Fun.
- Unknown colours fall back to blue, as Chips do. Two groups whose titles slug the same (e.g. "Blå" and "Bla") would share an anchor. This isn't handled; add a Studio check if it ever happens.
- `TIME` is now exported from `event.js` and shared by both schemas.
- The "N grupper" heading shows "Fem grupper" for a moment while Sanity loads, then updates.
