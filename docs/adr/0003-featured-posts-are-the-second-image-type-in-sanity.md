# Featured posts are the second image type in Sanity

Status: accepted (2026-10-18). Amends 0002.

## Context

The landing page's socials section shows emoji placeholder tiles under the Instagram heading. The club wants real posts there. ADR 0002 allowed images in Sanity for Sponsor logos only and asked for a separate decision for any other type. The options are in `docs/research/instagram-on-static-site.md`.

## Decision

Add **Featured posts** (Sanity type `featuredPost`), hand-picked by editors: image, alt text, link (any URL) and order. `site.js` fetches them in the existing single query and loads each one from Sanity's image CDN, resized, the same way as Sponsor logos. Tiles are center-cropped to square, and Studio's hotspot is ignored. Like Sponsors, they have no Fallback content: without Sanity or JS the grid is hidden, and the heading and follow buttons (from Club info) stay.

## Alternatives rejected

- **Instagram API.** The token is a secret. Keeping it out of the browser needs a server or scheduled job to refresh it every 60 days, i.e. the build pipeline ADR 0001 rejected.
- **Instagram embeds (`embed.js`/oEmbed).** They load Meta's iframe and cookies on every view. The site has no consent banner (ekomloven § 3-15).
- **Behold JSON feed.** Keyless and always current, but it is a third-party dependency with a 1,200 views/month free tier against unknown traffic. Editors can't choose posts, and nobody has checked whether its CDN sets cookies.

## Consequences

- Editors download an image from Instagram/TikTok and upload it again for each post. The grid goes stale if nobody does. It is presented as highlights, not a feed, so a grid that hasn't changed in months still reads as intended.
- Images are now in Sanity for two types. A third still needs its own decision.
