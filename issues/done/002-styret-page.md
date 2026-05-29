## Parent PRD

`issues/prd.md`

## What to build

The first new content page, `styret.html`, which doubles as the tracer for the "new page" pattern — it must consume `styles.css` + `site.js` exactly as future pages will. Lists the board (names + roles) using monogram/initials avatars (no photos). Personal contact details are **masked** for the demo ("kontakt via styret"); board decides exposure later.

Content from `content-baseline.md` → "Styret 2024–2025". See PRD → "Content".

## Acceptance criteria

- [ ] `styret.html` renders all 8 board members + 2 vara with name and role.
- [ ] Monogram/initials avatars (CSS), no photographs.
- [ ] No personal phone numbers or emails shown; contact routed via a masked "kontakt via styret" affordance.
- [ ] Uses shared `styles.css` + injected nav/footer; "Styret" nav state active; mobile menu works.
- [ ] All links relative; accessible (headings, contrast, keyboard).

## Blocked by

- Blocked by `issues/001-shared-layout-foundation.md`

## User stories addressed

- User story 2
- User story 4
