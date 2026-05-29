## Parent PRD

`issues/prd.md`

## What to build

`kontakt.html` — how to find and reach the club. Shows visiting address (Blektjernveien 18), Postboks 2404 / 3003 Drammen, org.nr 883 456 912, opening hours, social links, and role-based contacts (Skiskole, Sportslig, parent contacts) with personal details **masked** for the demo per PRD.

Content from `content-baseline.md` → "Kontakt".

## Acceptance criteria

- [x] `kontakt.html` shows address, Postboks, org.nr, and opening hours exactly per baseline.
- [x] Role-based contacts listed by role + name; personal phone/email masked (routed via club/"kontakt via styret").
- [x] Facebook + Instagram (@drammenslalomklubb) links present.
- [x] Uses shared `styles.css` + injected nav/footer; "Kontakt" nav state active; mobile menu works.
- [x] All links relative; accessible.

## Status (2026-05-29)

Done. `kontakt.html` built on the shared layout (`styles.css` + `site.js`),
following the styret/om-oss tracer. Four sections: page hero, Besøk/Visit
(fact-chips for address, postboks, org.nr, opening hours), role-based
contacts (6-card grid: Kenneth Larsen / Jon Sæther / Alexandra Forbord /
Line Kristin Hafsal / Erik Ullhaug Olsen / Jon Sæther for U12–U14), and
social/CTA grid (Instagram, Facebook, Spond).

Personal phone/email masked behind "kontakt via klubben" affordance per
PRD — including Erik Ullhaug Olsen's number/email which IS published on
the live site but is masked here for demo-policy consistency. The new
test (`test/kontakt.test.js`) enforces the masking by parsing PII from
the gitignored `content-baseline.md` at test time and asserting none of
it appears in the rendered HTML; when the baseline is absent (CI) the
leak loop is skipped with `t.diagnostic` and the masking-affordance
check still runs unconditionally. Same pattern as `test/styret.test.js`.

Deploy audit (`test/deploy.test.js`) auto-picked up `kontakt.html` via
the NAV_MODEL on-disk scan — no test edit needed there.

6/6 new kontakt tests + 24 prior = 30/30 green. Typecheck clean.

## Blocked by

- Blocked by `issues/001-shared-layout-foundation.md`

## User stories addressed

- User story 9
