Status: ready-for-agent

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
