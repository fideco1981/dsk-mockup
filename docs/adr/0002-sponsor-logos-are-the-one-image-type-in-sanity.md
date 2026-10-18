# Sponsor logos are the one image type in Sanity

Status: accepted (2026-10-17), amended by 0003 (2026-10-18) and 0005 (2026-10-18)

## Context

The Sanity slice (`issues/prd-sanity.md`) lists "Images in CMS content" as out of scope, and ticket 012 kept the schemas free of images. The club's current site has a rotating sponsor banner at the bottom of the page, and the mockup needs one too. Sponsors change between seasons, and adding one should not need Stein.

## Decision

This reverses "Images in CMS content" for **Sponsor** logos only. Every other content type stays text-only. Don't read this ADR as permission to add images elsewhere; that needs its own decision.

- Sanity type `sponsor`: name (also the alt text), logo (image), optional url, and order.
- `site.js` fetches the sponsors in the existing single query and loads each logo from Sanity's image CDN with `?h=128&auto=format`. That resizes large uploads (one current logo is 4681 px wide) without a build step.
- **No fallback content for the sponsor strip.** This departs from the Fallback content pattern on purpose: a hand-written copy of the sponsor list would drift the first time someone edits it in Studio, and a missing strip is better than one that thanks last season's sponsors. When Sanity fails, or without JS, the strip stays hidden.

## Alternatives rejected

- **Hardcoded list in `site.js` with logo files in the repo.** Simpler, but only Stein could change sponsors.
- **A URL field pointing at imgur** (where the current site hosts the logos). Hotlinking breaks without warning and serves full-size files.

## Consequences

- Editors upload logos in Studio. They should crop away built-in whitespace before uploading; the image URL ignores Studio crop and hotspot settings.
- Sponsors are invisible whenever Sanity is unreachable.
