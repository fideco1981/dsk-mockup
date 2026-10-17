Status: ready-for-human

## Parent PRD

`issues/prd-sanity.md`

## What to build

The Sanity project that the Studio and the site read from. Stein does this himself: it needs his account and a browser login.

- Create the Sanity project under Stein's personal account, with a **public** dataset.
- Run `sanity login` on the dev machine.
- Add CORS origins for the GitHub Pages origin (`https://fideco1981.github.io`) and localhost.
- Write the project ID and dataset name under `## Comments` in this ticket, for 012 and 013 to use. Both values are public by design.

See PRD: "Architecture", "Ownership", "Further Notes → HITL prerequisites".

**Blocked by:** None (can start immediately).

## Acceptance criteria

- [ ] The project exists and its dataset is public.
- [ ] Both CORS origins are added, without credentials.
- [ ] The project ID and dataset name are recorded in this ticket.

## Comments

- Project ID: `uoseskhv`
- Dataset: `production` (public: an anonymous query returns a result, checked 2026-10-17)
