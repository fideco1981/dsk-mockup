Status: ready-for-human

## Parent PRD

`issues/prd-sanity.md`

## What to build

A Sanity Studio in `studio/` (its own `package.json`, kept separate from the site), where an editor can maintain Events and the Topbar message. All labels and help text are in Norwegian.

- **Event**: title (required), date (required), start time, location, short plain-text description, link (URL), and chips picked from the fixed list Renn / Gratis / Årsmøte / Medlemmer.
- **Topbar message**: a singleton with text (required), an optional link, and a show/hide toggle that defaults to on. Studio offers it as a single document, not a list.
- No Portable Text and no images.

Final step (HITL, Stein): `sanity deploy` to a `*.sanity.studio` address.

See PRD: "Content model", "Studio".

**Blocked by:** 011 (project ID and dataset).

## Acceptance criteria

- [ ] `studio/` runs locally against the project from 011.
- [ ] Every field matches the PRD, with Norwegian labels and help text.
- [ ] The chip list in the schema matches the colour map that `site.js` will use (Renn → blue, Gratis → orange, Årsmøte → green, Medlemmer → blue).
- [ ] The Topbar message is a singleton, and its toggle defaults to on.
- [ ] `studio/` contains no token or secret.
- [ ] (HITL) Studio is deployed, and Stein can log in and publish one event.

## Comments

**Agent work done (2026-10-17):** I added the schemas and the singleton structure in `studio/`. `sanity schema validate` reports 0 errors and `sanity build` passes. Three things are left for Stein:

1. ~~Put the project ID in `studio/project.js`~~ Done: `uoseskhv` / `production`.
2. Run `cd studio && npm run dev`, check the labels by eye, and confirm that a new Toppmelding has "Vis meldingen" switched on.
3. Run `npm run deploy`. It will ask you for the `*.sanity.studio` hostname. Then log in and publish one event.

There is no automated test for the schemas, because the PRD says "Not tested: the Studio schemas". Two notes for later tickets:

- **For 014:** `startTime` is validated as `TT:MM`.
- **For 013:** treat an unset `show` as on.
