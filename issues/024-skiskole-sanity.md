Status: ready-for-agent

## Parent PRD

`issues/prd-sanity.md` (section "Extension — Skiskole, Heistider and Treningsplan from Sanity")

## What to build

Move `skiskole.html` into Sanity. The source of truth for the content is the club's Spond course list (`https://club.spond.com/landing/courses/drammensk`); a snapshot is in `docs/skiskole.pdf`. It shows five courses of two kinds: afternoon courses (Tuesday and Thursday 17:30–18:45 over three weeks) and weekend courses (Saturday and Sunday 10:00–14:00).

- **Singleton `skiSchool` (Skiskole):** holds the text every course shares. Fields:
  - intro (text)
  - age (string, e.g. "4–10 år (fylte 4 år per 1. januar 2027)")
  - includes (array of strings)
  - equipment, meetup, reservation (text)

  Set it up as a singleton in the same way as `topbarMessage`: a fixed documentId, filtered out of "Create new", and limited actions.
- **Document type `course` (Kurs):**
  - title (required)
  - signupDeadline (date)
  - startDate, endDate (both required; endDate on or after startDate)
  - sessions: reuse the `{day, from, to}` field and validation from `trainingGroup`. Extract it if it's still inline.
  - skipWeeks (optional array of integers, 1–53): ISO weeks with no session, e.g. 9 for winter break
  - price (string)
  - link (url, the Spond signup)
  - note (optional text): e.g. "Tillegg 450 kr for å fortsette i treningsgruppe" or the snow reservation
- Add both to the Studio left menu in `studio/sanity.config.js`: Skiskole as a singleton and Kurs as a list sorted by startDate.
- **Page rendering:**
  - The shared section comes from `skiSchool`.
  - Course cards list the courses whose endDate is today or later, sorted by startDate. Each card shows:
    - the title
    - the period
    - the signup deadline (as text)
    - session lines ("Tirsdag 17:30–18:45", reusing the Training group session renderer)
    - the price and the note
    - a "Meld på" button to the link
  - Leave out empty optional fields.
- **Fallback:** a failed fetch or a missing `skiSchool` keeps the HTML fallback. Zero unfinished courses shows "Ingen kurs akkurat nå — følg med på Spond" with the Spond link, not the fallback.
- **Fallback content:** refresh the hardcoded courses to the 2026/27 courses in the PDF. Don't invent anything that isn't in the PDF.
- **`index.html`:** point the hero button "Se Skiskolen ↓" at `skiskole.html` instead of `#programs`, and drop the ↓.
- **CONTEXT.md:** add **Ski school** (the `skiSchool` singleton, shared text) and **Course** (the `course` type, a dated ski-school course with sessions and skipWeeks).

## Acceptance criteria

- [x] Schemas `skiSchool` and `course` registered. `sanity schema validate` passes.
- [x] Studio rejects a course whose endDate is before startDate, a skipWeek outside 1–53, and bad sessions (same rules as Training group).
- [x] Both appear in the Studio left menu. Skiskole can't be created twice.
- [x] Test: courses that have ended (2000 fixture) aren't shown. The rest are sorted by startDate.
- [x] Test: a card shows its session lines Monday→Sunday, and leaves out empty price, note and deadline.
- [x] Test: the shared section renders from `skiSchool`, and includes is a list.
- [x] Test: a fetch error keeps the fallback. Zero unfinished courses shows the "Ingen kurs" message.
- [x] Test: CMS strings with markup render as text. The link is only rendered for http(s).
- [x] The hero button on `index.html` links to `skiskole.html`.
- [x] Fallback HTML matches the 2026/27 courses in `docs/skiskole.pdf`.
- [x] CONTEXT.md updated.
- [ ] (HITL) Studio redeployed. Stein enters the Skiskole text and the five courses from Spond.

## Comments

2026-10-17: Built on `integration/024-skiskole` (83c8170, f5253ef, 8fe75ae, review fixes 4b4451e). `npm test` 114/114, a11y 38 passed / 6 skipped, `sanity schema validate` clean. Still to do: redeploy the Studio, enter the Skiskole text first and then the five courses (courses only render once `skiSchool` exists), then close the ticket.

- `session.js` now holds the `{day, from, to}` object; Training group and Course both use it.
- The PDF contradicts itself on "uke 4-6": the title and dates (26 Jan–11 Feb) give weeks 4–6, but the text says "Uke 3, 4 og 5". The fallback follows the title and dates.
- "Minst 6 deltakere" applies only to the afternoon courses, so `skiSchool.reservation` has no fallback text. Each course carries its own condition in `note`. Decide whether a shared reservation text is wanted.
- The fallback intro is the afternoon one; the weekend courses have a different intro.
- The fallback "Meld på" buttons all go to the Spond course list, because the PDF has no per-course signup URLs.
- Removed from `skiskole.html` because none of it is in the PDF: the instructor note (Henrik Hagberg), the weather/Spond card, "Hjelm anbefales" and the "To kurstilbud" header. Confirm before release.
- Still stale, outside this ticket: the `<noscript>` topbar ("Sesong 2025/26") and the `.skiskole-cta` button, which points to the membership form.
