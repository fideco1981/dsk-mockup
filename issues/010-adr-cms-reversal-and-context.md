Status: ready-for-agent

## Parent PRD

`issues/prd-sanity.md`

## What to build

Record the decision that reverses the MVP PRD's "CMS or any backend" out-of-scope line, so that a future agent reading `issues/prd.md` doesn't treat a CMS as forbidden.

- An ADR in `docs/adr/` that records the reversal and why Sanity with a browser fetch won over a git-based CMS (Decap/Sveltia: non-technical editors would need GitHub accounts and an OAuth proxy) and over a Sanity build pipeline (the MVP avoided a build step). It also notes the choice of the live endpoint over the CDN, and when to revisit that.
- A `CONTEXT.md` at the repo root that defines **Event**, **Topbar message**, **Studio**, **Fallback content** and **Chip** as the PRD defines them.

See PRD: "Docs".

**Blocked by:** None (can start immediately).

## Acceptance criteria

- [ ] An ADR exists in `docs/adr/` and covers: the reversal, the alternatives rejected and why, the public dataset with no token, and live endpoint over CDN.
- [ ] `CONTEXT.md` exists at the repo root and defines the five terms.
- [ ] `issues/prd.md` stays unchanged; the ADR references it.
