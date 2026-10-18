Map: map-sanity-rest.md
Type: grilling
Status: resolved
Blocked by: 027

## Question

Socials section: what it shows and what editors control. Given the options from "How to show Instagram posts on a static site", what replaces the emoji placeholder tiles under "Følg oss på Instagram", which parts editors change in Studio, what is shown when it fails, and does it need images in Sanity (amending ADR 0002)?

## Answer

Settled in grilling (2026-10-18). Terms are in `CONTEXT.md`; the image decision is ADR 0003.

- **Grid**: hand-picked **Featured posts** from Sanity replace the emoji tiles. Each has an image, alt text, a link to any URL (Instagram post, TikTok video, …) and an order field, with no caption. The grid shows the first 6 by order, or fewer if there are fewer. With none, it is hidden. Center-cropped to square (`object-fit: cover` on a resized CDN image). Hotspot is ignored.
- **Networks**: Instagram, Facebook and TikTok (`https://www.tiktok.com/@drammen_slalomklubb`). Club info gets one fixed optional URL field per network. An empty field hides that button. The footer and the socials section show the same set. Spond stays out: it is signup, not social.
- **Icons**: add Instagram, Facebook and TikTok brand logos (single-colour paths) to the sprite. They replace `icon-camera` and `icon-users` in the footer.
- **Copy**: the heading and tag stay in HTML. The section is retitled along the lines of "Følg oss". The shown handle comes from the Instagram URL in Club info.
- **Failure**: the heading and follow buttons always show, using Club info's fallback values. Featured posts are hidden without Sanity or JS.
- **ADR**: new ADR 0003 amends 0002. Featured posts are the second image type, and editors accept that the grid goes stale unless someone updates it.
