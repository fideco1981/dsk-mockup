# Sanity with a browser fetch, reversing "no CMS"

Status: accepted (2026-10-17)

## Context

The MVP PRD (`issues/prd.md`) lists "CMS or any backend" as out of scope. That still holds for the MVP itself, but the board demo needs non-technical club people (board members, coaches, the ski-school lead) to keep the most volatile content current: events and the topbar message. Hand-edited HTML means only Stein can change anything, and that content was already a season out of date.

## Decision

This reverses the "CMS or any backend" line for the Sanity slice (`issues/prd-sanity.md`). `issues/prd.md` is left unchanged as the record of the MVP; read it together with this ADR.

- Events and the topbar message are edited in a hosted Sanity Studio (`studio/`, deployed to `*.sanity.studio`).
- `site.js` fetches published content from Sanity's query API in the browser and renders it. The site keeps its no-build GitHub Pages setup. The hand-written HTML stays as fallback content.
- The dataset is public and the browser sends no token, so no secret ships in the site's JavaScript. CORS allows the GitHub Pages origin and localhost.
- The browser reads the live endpoint (`<project>.api.sanity.io`), not the CDN (`apicdn.sanity.io`), so a publish shows on the next reload. That is what the demo relies on.

## Alternatives rejected

- **Git-based CMS (Decap / Sveltia).** No new service, but every editor needs a GitHub account and the login needs an OAuth proxy. Too much friction for non-technical editors, who log in to Sanity with Google or email.
- **Sanity with a build pipeline** (static generation, webhook or GitHub Action). The MVP deliberately avoided a build step; a browser fetch keeps raw files on GitHub Pages and makes a publish visible without waiting on a deploy.

## Consequences

- Visitors depend on Sanity being reachable for current content; on failure or without JS they see the fallback HTML, which may drift and is refreshed by hand.
- The live endpoint is uncached. At club traffic that load is negligible. Revisit the CDN endpoint after adoption if traffic or Sanity quota becomes a concern; its invalidation delay hasn't been measured, so measure it before switching.
