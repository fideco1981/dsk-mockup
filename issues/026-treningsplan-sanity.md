Status: ready-for-agent
Blocked by: 023, 024, 025

## Parent PRD

`issues/prd-sanity.md` (section "Extension — Skiskole, Heistider and Treningsplan from Sanity")

## What to build

Render the landing page's `#schedule` "Treningsplan" (`index.html` around lines 205–405) from Sanity. Today it is hardcoded with the old groups. Keep the current layout and styles, which are the desktop `week-grid`, the `mobile-schedule`, the legend, and the lift bar and lift tail per day. Only the data source changes.

- **Training groups:** every session from `trainingGroup.sessions` goes on its day, in the group's colour. The legend lists the groups in order.
- **Ski school:** each `course` session goes on its day.
  - A course is shown only when its startDate–endDate overlaps the current week (Monday–Sunday, visitor's local time), and not when the current ISO week is in its skipWeeks.
  - All courses share one fixed ski-school colour and one legend entry, "Skiskole", which only appears when a course is shown.
  - The card text is the course title. It links to `skiskole.html`.
- **Lift bar:** comes from `liftHours` (025).
  - If a course session that day starts before the lift opens, extend the bar back to the session start, and label the extra piece "Kun skiskole". For example, ski school 17:30 with the lift at 18:00 gives "Kun skiskole 17:30–18:00" and then "Heis 18:00–20:00". This is derived; there's no new field.
  - Keep the lift tail after the last session up to closing time, as today.
- **Ordering:** within a day, sort sessions by `from`. Overlapping sessions sit side by side or stack, whichever the current CSS already supports.
- **Note:** replace the old schedule note that names the old groups with the `liftHours` note.
- **Fallback:** without JS, or when Sanity fails or returns no groups, show:
  - the legend with the five new groups (Grønn, Blå, Rød, Sort, Fun)
  - the lift hours as in 025
  - the text "Tider kommer — se treningsopplegg og Spond", linking to `treningsopplegg.html`

  Don't invent session times. Remove Rekrutten, Teknikeren and DSK Fun.
- **CONTEXT.md:** add **Treningsplan** (the landing-page weekly view built from Training group sessions, Courses in the current week, and Lift hours; it has no data of its own).

## Acceptance criteria

- [x] Test: group sessions show on the right day in the group's colour, sorted by `from`, in both the desktop and mobile views.
- [x] Test: a 2000–2999 course shows; a 2000 course doesn't; a course with skipWeeks 1–53 doesn't.
- [x] Test: the "Skiskole" legend entry only appears when a course is shown.
- [x] Test: course 17:30 with the lift at 18:00 gives a "Kun skiskole" piece 17:30–18:00; a course starting after opening gives no such piece.
- [x] Test: a day with no `liftHours` entry shows "Heis stengt".
- [x] Test: a Sanity error and zero groups both keep the fallback.
- [x] Fallback contains no old group names (Rekrutten, Teknikeren, DSK Fun) and no made-up times.
- [x] The axe scan passes for the ski-school colour and the "Kun skiskole" label.
- [x] CONTEXT.md updated.

## Comments
