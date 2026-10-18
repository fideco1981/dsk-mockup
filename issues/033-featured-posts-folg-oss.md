Status: ready-for-agent
Blocked by: 031

## Parent PRD

`issues/prd-sanity-rest.md` (sections "Content model" and "Socials section on the landing page"); ADR 0003

## What to build

Real, hand-picked posts replace the emoji tiles on the landing page, under a "Følg oss" section with buttons for every network.

- **Document `featuredPost` (Utvalgte innlegg):** `image` (required), `alt` (required), `link` (required URL), `order` (number). Norwegian labels and help text. Add it to the Studio left menu, ordered by `order`.
- The shared layout engine's single query gains Featured posts, sorted by `order`, first six.
- **Section:** retitled along the lines of "Følg oss"; tag and heading stay in HTML. Under the heading: the Instagram handle (last path segment of the Instagram URL in Club info, shown as `@handle`) and a button for each network with a URL, using the brand icons. Fallback values come from Club info's fallback.
- **Tiles:** remove the emoji tiles. Each post is a square tile: a link (new tab, `rel="noopener"`, http(s) only) wrapping an image with the post's alt text. The image comes from Sanity's image CDN resized to the tile size with `auto=format`, center-cropped by CSS `object-fit: cover`. The hotspot is ignored.
- The grid shows one to six tiles. With zero posts, on failure or without JS it is hidden; heading, handle and buttons stay.
- Tiles must be visible without the landing page's fade-in observer (same rule as event cards).
- Nothing loads from Meta or TikTok.
- Update the Studio entry in `CONTEXT.md`.

## Acceptance criteria

- [x] Schema `featuredPost` registered with `image` and `alt` required. `sanity schema validate` passes. It appears in the Studio left menu.
- [x] Test: posts render sorted by order and capped at six, each a link with an image carrying the alt text.
- [x] Test: with zero posts, and on a rejected fetch, the grid is hidden and the network buttons stay.
- [x] Test: tiles are not in the fade-in hidden state.
- [x] Test: the handle is derived from the Instagram URL. A TikTok button appears in the section.
- [x] Test: a non-http(s) link is not rendered as a link.
- [x] No emoji placeholder tiles remain.
- [x] `CONTEXT.md` Studio entry updated.
- [ ] (By eye) Tile crop looks right.

## Comments

- Images are requested with `?w=480&h=480&fit=crop&auto=format`, so the Sanity CDN does a center crop to the square tile. The hotspot is still ignored, deliberately. CSS `object-fit: cover` stays as a safety net.
