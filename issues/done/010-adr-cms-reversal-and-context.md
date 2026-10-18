Status: done

## Parent PRD

`issues/prd-sanity.md`

## What to build

Record the decision that reverses the MVP PRD's "CMS or any backend" out-of-scope line, so that a future agent reading `issues/prd.md` doesn't treat a CMS as forbidden.

- An ADR in `docs/adr/` that records the reversal and why Sanity with a browser fetch won over a git-based CMS (Decap/Sveltia: non-technical editors would need GitHub accounts and an OAuth proxy) and over a Sanity build pipeline (the MVP avoided a build step). It also notes the choice of the live endpoint over the CDN, and when to revisit that.
- A `CONTEXT.md` at the repo root that defines **Event**, **Topbar message**, **Studio**, **Fallback content** and **Chip** as the PRD defines them.

See PRD: "Docs".

**Blocked by:** None (can start immediately).

## Acceptance criteria

- [x] An ADR exists in `docs/adr/` and covers: the reversal, the alternatives rejected and why, the public dataset with no token, and live endpoint over CDN.
- [x] `CONTEXT.md` exists at the repo root and defines the five terms.
- [x] `issues/prd.md` stays unchanged; the ADR references it.

## Closeout

Done in 812b4c1, closed late on 2026-10-18. `docs/adr/0001-sanity-browser-fetch-reverses-no-cms.md` covers the reversal, the rejected alternatives (Decap/Sveltia, Sanity build pipeline), the public dataset with no token, and the live endpoint over the CDN. `CONTEXT.md` defines Event, Topbar message, Studio, Fallback content and Chip. `issues/prd.md` is unchanged and referenced by the ADR.
