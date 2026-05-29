## Parent PRD

`issues/prd.md`

## What to build

`skiskole.html` — the ski-school / alpine-course page for ages 4–10. Presents both course types with prices and schedule, what's included, equipment/arrival notes, and a working Spond signup CTA.

Content from `content-baseline.md` → "Skiskole og alpinkurs".

## Acceptance criteria

- [x] Afternoon course (Tue+Thu 17:30–18:45, 6 sessions/3 weeks, 2 950 kr) and weekend course (Sat+Sun 10:00–14:00, 6h, 2 500 kr) both shown with correct prices.
- [x] "What's included" (season membership, season pass, Rekrutten activity fee; +450 kr note) listed.
- [x] Age requirement (4–10, must be 4 by 1 Jan 2026), equipment note (bring own skis), arrival note shown.
- [x] "Bli medlem"/signup CTA links to the real Spond form (relative `target=_blank` external link).
- [x] Uses shared `styles.css` + injected nav/footer; "Skiskole" nav state active; mobile menu works.
- [x] All internal links relative; accessible.

## Done (2026-05-29)

Built `skiskole.html` on the shared layout (4th content page on the
tracer). Five sections: page-hero, two-card course grid (Tue+Thu
afternoon and Sat+Sun weekend, each with calendar/clock/check/tag fact
lines + a Spond CTA), "Hva som er inkludert" three-item list with the
+450 kr continuation note, practical-info 2×2 grid (alder / egne ski /
15 min / vær- og tidsendringer) + lead-instructor note (Henrik
Hagberg), and a final Spond signup CTA section. 7 new tests + 31 prior
= 38/38 green; typecheck clean. Deploy audit auto-picked up the new
page via the NAV_MODEL on-disk scan.

## Blocked by

- Blocked by `issues/001-shared-layout-foundation.md`

## User stories addressed

- User story 6
- User story 7
