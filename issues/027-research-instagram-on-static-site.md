Map: map-sanity-rest.md
Type: research
Status: resolved

## Question

What are the ways to show recent Instagram posts from @drammenslalomklubb on the landing page of a no-build GitHub Pages site that reads Sanity from the browser, without shipping a secret in the site's JavaScript?

For each option give: what it needs (account type, Meta app/review, tokens and their expiry/refresh, third-party service and its price), whether an editor can control what shows, what happens when it fails, and privacy/cookie implications (Meta embeds set cookies; the site has no consent banner). At least cover: the Instagram Graph API (and its token refresh), Instagram's official per-post embed (`embed.js`), third-party feed widgets, and posts curated by hand in Sanity (image + link).

## Answer

Findings: `docs/research/instagram-on-static-site.md` (merged to main in d4ef5e1).

- Instagram API from the browser: ruled out (the token is the secret). Server-side needs a Business/Creator account, a Meta app and a 60-day token refreshed by a scheduled job or proxy, i.e. the build pipeline ADR 0001 rejected. Basic Display API shut down 2024-12-04.
- Official embeds (embed.js / oEmbed): load Meta's iframe on every view; with no consent banner this conflicts with ekomloven § 3-15 / Fashion ID (C-40/17). oEmbed needs App Review and lost thumbnails 2025-11-03.
- Feed widgets: only Behold offers a keyless public JSON feed `site.js` could render itself (free: 6 posts, 1,200 views/month; $10/month for 15,000). SnapWidget, Elfsight and Juicer inject vendor scripts, which raises the same consent problem.
- Recommendation: hand-curated posts in Sanity (image, alt, link), which needs an ADR amending 0002. Fallback option: Behold JSON.
- Unverified: whether @drammenslalomklubb is a personal or professional account, landing-page traffic, cookies set by image CDNs, and Norwegian cookie guidance after the 2026-07-01 ekomloven change.
