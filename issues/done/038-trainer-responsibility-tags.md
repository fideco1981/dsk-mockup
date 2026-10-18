Status: done
Blocked by: 037

## Parent PRD

`issues/prd-trainers.md`

## What to build

Each trainer card shows which Training groups and/or the ski school the trainer is responsible for, as coloured tags that link to them.

- **Schema:** trainer gets `groups` (array of **weak** references to `trainingGroup`, so a group can be deleted or renamed without editing trainers) and `skiSchool` (boolean, "Skiskole"). Norwegian labels and help text.
- **Query:** group references resolved to title and colour.
- **Cards:** one tag per resolved group, in the group's colour, linking to that group's anchor on Treningsopplegg (same slug as Treningsopplegg uses). Missing or deleted groups are skipped. "Skiskole" tag in the ski-school colour, linking to Skiskole. The role text beside the tags. Tags and links read sensibly to a screen reader.

## Acceptance criteria

- [x] `sanity schema validate` passes.
- [x] Test: group tags in the group's colour, linking to the matching anchor on Treningsopplegg.
- [x] Test: "Skiskole" tag in the ski-school colour, linking to Skiskole.
- [x] Test: an unresolved (deleted) group reference is skipped without breaking the card.
- [x] Test: markup in a group title renders as text.

## Closeout

Done on branch `trainers` (47e3c4c). `groups` (weak refs) and `skiSchool` on the trainer; query resolves `groups[]->{title, colour}`. Tags reuse `validGroups`/`slug`/`groupClass`/`SKI_SCHOOL_CLASS` in an `<ul aria-label="Ansvarlig for">`; tinted background with white text for AA contrast. 4 tests added.
