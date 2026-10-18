# Featured posts are the second image type in Sanity

Status: accepted (2026-10-18). Amends 0002.

## Context

The landing page's socials section shows emoji placeholder tiles under the Instagram heading. The club wants real posts there. ADR 0002 allowed images in Sanity for Sponsor logos only and asked for a separate decision for any other type. The options are in `docs/research/instagram-on-static-site.md`.

## Decision

Add **Featured posts** (Sanity type `featuredPost`), hand-picked by editors: image, alt text, link (any URL) and order. `site.js` fetches them in the existing single query and loads each one from Sanity's image CDN, resized, the same way as Sponsor logos. Tiles are square: the largest square inside Studio's crop, centred on its hotspot (amended 2026-10-18, see below). Like Sponsors, they have no Fallback content: without Sanity or JS the grid is hidden, and the heading and follow buttons (from Club info) stay.

## Alternatives rejected

- **Instagram API.** The token is a secret. Keeping it out of the browser needs a server or scheduled job to refresh it every 60 days, i.e. the build pipeline ADR 0001 rejected.
- **Instagram embeds (`embed.js`/oEmbed).** They load Meta's iframe and cookies on every view. The site has no consent banner (ekomloven § 3-15).
- **Behold JSON feed.** Keyless and always current, but it is a third-party dependency with a 1,200 views/month free tier against unknown traffic. Editors can't choose posts, and nobody has checked whether its CDN sets cookies.

## Consequences

- Editors supply the image for each post themselves. The grid goes stale if nobody does. It is presented as highlights, not a feed, so a grid that hasn't changed in months still reads as intended.
- Images are now in Sanity for two types. A third still needs its own decision.

## Amendment (2026-10-18): getting the image

Neither app lets you save an image from a post, so "download and re-upload" didn't work in practice.

- **TikTok:** a "Hent bilde fra TikTok" button in Studio fetches the post's cover image via TikTok's public oEmbed (no token; cross-origin allowed) and uploads it to Sanity. The image URL is signed and expires, so it is copied, never linked.
- **Instagram:** a screenshot, cropped in Studio. Instagram's oEmbed needs a Meta app token and has no thumbnail since 2025-11-03. The image can be read from the post's embed page, but that page doesn't allow cross-origin requests, so it would need a server we don't have, and Meta doesn't document it.
- So the image field has Studio's crop and hotspot, and `site.js` follows them (Sanity's `rect=`), reversing "hotspot is ignored" above.
- Not done: playing videos on the site. TikTok's embed player (`tiktok.com/player/v1/{id}`) loads TikTok's own code, with the same consent problem as the rejected embeds.
