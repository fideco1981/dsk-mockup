Status: ready-for-agent

## Parent PRD

`issues/prd-sanity.md` (section "Extension — Skiskole, Heistider and Treningsplan from Sanity")

## What to build

Move the lift hours into one Sanity singleton and read it everywhere they appear today: `index.html` `#schedule`, `om-oss.html` (around line 193) and `kontakt.html` ("Besøk og åpningstider"). The three copies disagree today, because om-oss leaves out "Fre stengt".

- **Singleton `liftHours` (Heistider)**, set up the same way as `topbarMessage`:
  - **hours**: an array of `{day, from, to}`. Reuse the session field and validation from `trainingGroup`, and add a rule allowing at most one entry per day. A day with no entry is shown as "Heis stengt".
  - **note** (text): e.g. "Bakken er dugnadsdrevet og kan være stengt i ferier hvis ingen stiller som heisvakt. Endringer kunngjøres på sosiale medier."
- Add it to the Studio left menu.
- **Compact form** for om-oss and kontakt: merge consecutive days that have the same hours, and show closed days as "stengt", e.g. "Man–Tor 18:00–20:00 · Fre stengt · Lør–Søn 11:00–15:00". Show the note under it.
- **On `index.html`:** this ticket only renders the per-day lift labels in the existing `#schedule` block ("Heis 18:00 – 20:00" / "Heis stengt") and the note. The rest of the block is done in 026.
- **Fallback:** a failed fetch or a missing singleton keeps the HTML. Make the fallback agree on all three pages: Man–Tor 18:00–20:00, Fre stengt, Lør–Søn 11:00–15:00.
- **CONTEXT.md:** add **Lift hours** (`liftHours`: weekly hours plus a note; the lift is open to everyone from its opening time; no seasonal periods).

## Acceptance criteria

- [ ] Schema `liftHours` registered. `sanity schema validate` passes. Studio rejects two entries for the same day.
- [ ] It appears in the Studio left menu as a singleton.
- [ ] Test: the compact form merges consecutive equal days and shows closed days as "stengt", including a closed day in the middle of the week.
- [ ] Test: om-oss and kontakt render the hours and note from Sanity, and keep the fallback on a fetch error.
- [ ] Test: the per-day lift labels on `index.html` come from Sanity, with "Heis stengt" for missing days.
- [ ] The fallback hours are identical on all three pages.
- [ ] CONTEXT.md updated.
- [ ] (HITL) Studio redeployed. Stein enters the hours and the note.

## Comments
