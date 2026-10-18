# Showing Instagram posts on the static landing page

Research for ticket 027. Question: how can the landing page (`index.html`, "Følg oss på Instagram") show recent posts from @drammenslalomklubb without shipping a secret in `site.js`, and which options let an editor control what shows?

All sources were fetched on **2026-10-18**. Meta's docs move often. Re-check anything marked as a date before building on it.

## Short answer

1. **Hand-curated posts in Sanity (image + Instagram link)** fits the site best: no Meta app, no tokens, no third-party script, no cookies, full editor control, and it fails the same way the rest of the site does. The cost is that someone has to add posts by hand, and ADR 0002 has to be extended, because it currently limits images to Sponsor logos.
2. **Behold JSON feed rendered by `site.js`** is the best automatic option: no secret in the page, images come from Behold's CDN rather than Meta's, and no Meta script runs. It needs the club account to be Business or Creator. Free tier: 6 posts and 1,200 views a month. Starter is $10/month for 15,000 views.
3. **Avoid Instagram's official embed (embed.js) and widget scripts (Elfsight, Juicer, SnapWidget)** on a site with no consent banner. Each one loads third-party code into the visitor's browser. Under ekomloven § 3-15 and Fashion ID, the club would need prior consent.
4. **Calling the Graph API directly from the browser is out.** It needs a user access token in the JS, and that token is the secret.

## Background facts

### The Basic Display API is gone

Meta announced on 2024-09-04 that "Starting on December 4th, 2024, Instagram Basic Display API will no longer be available". The same post says "there will no longer be a set of Instagram APIs for consumer developer apps". The replacement is aimed at business and creator use: *Instagram API with Instagram Login* or *with Facebook Login*. Personal accounts have no API at all now.
- https://developers.facebook.com/blog/post/2024/09/04/update-on-instagram-basic-display-api/

### The account type matters for every automatic option

The Instagram Platform supports professional accounts only: "An Instagram professional account can be for a business or creator." Behold says the same: "only Business or Media Creator Instagram accounts can be connected".
- https://developers.facebook.com/docs/instagram-platform/overview
- https://behold.so/docs/getting-started

**Not verified:** whether @drammenslalomklubb is a personal or professional account. The public embed page didn't reveal it, and checking needs a login. Switching an Instagram account to Creator/Business is free and done in the app. That process wasn't researched here.

## Option 1: Instagram Graph API (Instagram API with Instagram Login)

**What it needs**
- A Business or Creator account. With Instagram Login, no linked Facebook Page is needed: "This API setup does not require a Facebook Page to be linked". https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login
- A Meta developer app of type Business. For your own account, Standard Access is enough: "Standard Access is all your app needs". Advanced Access, which needs App Review and Business Verification, is only for accounts you don't own or manage. https://developers.facebook.com/docs/instagram-platform/overview
- Permission `instagram_business_basic`. The old `business_basic` scope names were deprecated on 2025-01-27 (same Instagram Login page).
- A token. The App Dashboard has a "Generate token" button for your own account. "Access tokens from the App Dashboard are long-lived and are valid for 60 days." https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/get-started
- **Refresh:** `GET graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token`. A token can be refreshed once it is "at least 24 hours old but has not expired", and "Refreshed tokens are valid for 60 days". If it lapses, someone has to generate a new one by hand in the dashboard. https://developers.facebook.com/docs/instagram-platform/reference/refresh_access_token
- Exchanging a short-lived token for a long-lived one needs the app secret and "should only be made in server-side code, never in client-side code". https://developers.facebook.com/documentation/instagram-platform/reference/access_token.md
- Media fields: `media_url`, `permalink`, `caption`, `timestamp`, `media_type` (IMAGE / VIDEO / CAROUSEL_ALBUM), and `thumbnail_url` (video only). `media_url` "is omitted from responses if the media contains copyrighted material", for example Reels with licensed audio. https://developers.facebook.com/docs/instagram-platform/reference/instagram-media

**Why it doesn't fit as-is:** the long-lived token is a bearer credential for the club's account. Put it in `site.js` and anyone can read the account's data with it, and also refresh it to keep it alive indefinitely. So the token has to live somewhere server-side. Possible places:
- **A scheduled GitHub Action**: token in repo secrets, fetches the API, writes a JSON file or uploads images to Sanity, and refreshes the token on each run. This is a build pipeline, which ADR 0001 rejected for the main content. It would also need to download the images, because `media_url` points at Meta's CDN.
- **A small serverless proxy** (Cloudflare Worker or similar). That adds a backend the club doesn't have today.

**Editor control:** none from the API itself. It's the latest N posts. Hiding posts would need extra code.

**Failure behaviour:** if the token expires (60 days without a refresh), the job or proxy fails and the section goes stale or empty. Meta API changes have broken things before (Basic Display, scope renames, oEmbed fields).

**Privacy:** if images are re-hosted (repo or Sanity), the visitor's browser never contacts Meta. If the page hotlinks `media_url`, every visitor's browser requests images from Meta's CDN (IP and referrer go to Meta). **Not verified:** whether that CDN sets cookies, and how long `media_url` links stay valid. Meta's docs don't say.

## Option 2: Instagram's official embed (embed.js / oEmbed)

**Two ways to get the markup**
- **By hand:** on instagram.com open the post, then "..." > Embed and copy the HTML. The docs don't mention an app or token for this. https://developers.facebook.com/docs/instagram-platform/embed-button
- **Via API:** `GET graph.facebook.com/instagram_oembed?url=...`. This needs the **Meta oEmbed Read** feature, which "requires successful completion of the App Review process" plus business verification. https://developers.facebook.com/docs/features-reference/oembed-read
- Since **2025-11-03**, oEmbed no longer returns `thumbnail_url`, `thumbnail_width`, `thumbnail_height` or `author_name` for Instagram. Meta suggests building your own thumbnails from the post's HTML metadata. So oEmbed now only gives you the embed HTML. https://developers.facebook.com/blog/post/2025/04/08/oembed-updates/
- The rate limit is 1,000 requests/hour. Posts from private accounts, inactive accounts, age-restricted accounts and accounts with embeds turned off don't embed. https://developers.facebook.com/docs/instagram-platform/oembed

**Editor control:** in principle yes. An editor could paste post URLs into Sanity and `site.js` could build the blockquote and load embed.js. There's no API call, because the blockquote and script markup is static. **Not verified:** whether the blockquote markup works reliably with only a post URL filled in. Meta only documents markup copied from Instagram or returned by oEmbed.

**Failure behaviour:** if embed.js fails or is blocked (ad blockers commonly block it), the visitor sees the bare blockquote fallback text. Each embed is a full Instagram card (header, image, caption, likes) with variable height ("height varies with container width and caption length"). It can't be styled into the site's square tile grid.

**Privacy:** this is the main problem. embed.js loads an iframe from instagram.com in every visitor's browser. That sends the visitor's IP to Meta and lets Meta read any instagram.com cookies the browser already holds (logged-in users). A quick test here (`curl` of `instagram.com/<user>/embed/` and `embed.js`) showed **no `Set-Cookie` header on the first HTML/JS response**. That test doesn't cover cookies set by JS inside the iframe, or cookies on later requests, and **I did not do a browser test with devtools**. See the legal section.

## Option 3: Third-party feed services

All four handle the Meta tokens on their side. Prices are as listed on each vendor's pricing page on 2026-10-18, in USD, and none were checked against an actual checkout.

| Service | Free tier | Cheapest paid | Delivery | Source |
|---|---|---|---|---|
| **Behold** | 1 feed, 6 posts, 1,200 views/mo, daily update, account paused when over the limit until next month | Starter $10/mo: 15k views, 50 posts, hourly | **JSON feed** (render it yourself) or widget | https://behold.so/pricing |
| **SnapWidget** | Unlimited views, 15-min refresh, photos link to a SnapWidget page instead of Instagram | Lite $8/mo | Widget (iframe/script) | https://snapwidget.com/pricing |
| **Elfsight** | 200 views/mo, Elfsight branding; "Exceeding this monthly limit will temporarily deactivate your app" | Basic $5–6/mo: 5,000 views | Script widget | https://elfsight.com/instagram-feed-instashow/pricing/ |
| **Juicer** | 300 views/mo, 24 h refresh, Juicer branding | Lite $15/mo ($13.50 yearly): 5,000 views | Script widget | https://www.juicer.io/pricing |

**Behold JSON feed in detail** (https://behold.so/docs/json-feeds)
- A plain GET to a per-feed URL. "Because no API keys or secrets are exposed, this isn't a serious security risk". There's an optional domain whitelist.
- Each post includes `permalink`, `caption`, `timestamp`, `mediaType`, `altText`, and `sizes` (resized WebP on **Behold's CDN**, max widths 400/700/1000/2000). `mediaUrl` points to the original on Instagram's servers. Use `sizes`.
- This fits the site's existing pattern (ADR 0001): `site.js` fetches public JSON and renders it into the existing `.insta-grid` tiles. The emoji tiles stay as Fallback content.
- Curation (pinning, hiding, reordering) is listed only on the **Business plan ($60/mo)**. On cheaper plans the feed is simply the latest posts.
- **Not verified:** whether Behold's CDN sets cookies, how often the free/Starter feed is actually refreshed beyond "once a day"/"once an hour", and Behold's data processing terms.
- Club traffic isn't known. If the landing page gets more than about 1,200 loads a month, the free tier pauses the feed for the rest of the month. Starter covers 15,000.

**Widgets (SnapWidget, Elfsight, Juicer, Behold's widget):** these inject the vendor's script or iframe. That brings the same consent question as embed.js, but for the vendor instead of Meta. None of the pricing pages say anything about cookies or GDPR. I didn't read their privacy policies or DPAs.

**Editor control:** the dashboard belongs to whoever has the vendor login, not Sanity. Free and low tiers show the latest posts with no hide/pin.

**Failure behaviour:** view caps (Elfsight, Juicer, Behold free) switch the feed off mid-month. The vendor going away or changing plans breaks the section. A disconnected Instagram source (for example after a password change, as Behold notes) stops updates.

## Option 4: Posts curated by hand in Sanity (image + link)

**What it needs:** a new Sanity type, say `instagramPost`, with image, alt text, Instagram URL and order (or date). Add it to the Studio schema *and* the `sanity.config.js` structure menu, and add it to the existing single query in `site.js`. Images load from Sanity's image CDN with size parameters, as Sponsor logos already do. No Meta account type, app, token or vendor is needed. The club owns the photos it posts, so copying them is not a licensing issue.

**Governance:** ADR 0002 says images are allowed for Sponsor logos *only* and "Don't read this ADR as permission to add images elsewhere; that needs its own decision." This option needs a new ADR.

**Editor control:** full. Editors pick the posts, the order and the alt text, in the Studio they already use.

**Failure behaviour:** it fails like everything else on the site. If Sanity is down or JS is off, the emoji tiles (Fallback content) or a plain "Følg oss på Instagram" link show. It goes stale if nobody adds posts. That's the real cost: roughly a minute per post, every time.

**Privacy:** no third-party script, no Meta request from the visitor's browser. The site already depends on Sanity, so this adds no new processor. **Not verified:** whether Sanity's image CDN sets cookies. Sponsor logos already use it, so this option adds no new exposure.

## Legal frame (Norway / EEA)

- **Ekomloven § 3-15** (LOV-2024-12-13-76, in force 2025-01-01): storing or accessing information on the user's device needs prior information *and* consent meeting the GDPR standard. The exemptions are transmission-only storage and storage "strengt nødvendig" for a service the user explicitly asked for. Lovdata notes an amendment effective 2026-07-01 that I did not read. https://lovdata.no/dokument/NL/lov/2024-12-13-76/KAPITTEL_3#%C2%A73-15
- **CJEU C-40/17 Fashion ID (2019-07-29):** a site that embeds a third-party plug-in which transmits visitors' data is a joint controller for the collection and transmission. The consent "must be obtained by that operator" before the data flows. https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:62017CJ0040
- **What this means here:** an Instagram embed or a vendor widget script that loads on page view, with no consent banner, carries the Fashion ID risk. Click-to-load (a placeholder that loads the embed only after the visitor clicks) is the usual workaround. It wasn't researched further here. Options 1 (re-hosted), 2-with-Behold-JSON and 4 send nothing to Meta from the visitor's browser.
- I didn't read Datatilsynet's or Nkom's own cookie guidance. Only the statute text and the CJEU judgment were checked. This isn't legal advice.

## Comparison

| | Secret in JS? | Account type | Editor control | Cost | Third-party script / cookies | Effort |
|---|---|---|---|---|---|---|
| Graph API direct from browser | **Yes, ruled out** | Business/Creator | None | Free | Meta CDN images | — |
| Graph API via Action/proxy | No | Business/Creator | None (latest N) | Free + backend | None if re-hosted | High; reverses ADR 0001's no-pipeline choice |
| Instagram embed | No | Any public | Paste URLs | Free | **Yes (Meta)** | Low code, consent problem |
| Behold JSON | No (public URL) | Business/Creator | Latest N; curation only on $60 tier | $0 (1,200 views) / $10 | None (Behold CDN images) | Low; matches ADR 0001 |
| Widget scripts | No | Usually Business/Creator | Vendor dashboard | $0–15 with caps/branding | **Yes (vendor)** | Lowest code, consent problem |
| Sanity curated | No | Any | Full | $0 | None | Low code; needs new ADR; manual upkeep |

## Recommendation

Start with **Sanity curated posts** (Option 4). It's the only option that gives editors real control, adds no vendor, no Meta dependency and no consent question, and it follows patterns already in the codebase (the Sponsor image pipeline and Fallback content). Record it in a new ADR next to ADR 0002.

If the club won't keep it updated by hand, switch to the **Behold JSON feed** rendered by `site.js`. First confirm the account is Business/Creator, and estimate monthly landing-page views against the 1,200 free cap. A hybrid also works: Behold for the latest posts, plus a Sanity "pinned" list.

## Not verified

- Account type of @drammenslalomklubb.
- Cookies set by embed.js/iframe in a real browser, or by Behold's, Sanity's or Meta's image CDNs.
- How long Graph API `media_url` links stay valid.
- Behold's actual refresh behaviour and DPA. SnapWidget/Elfsight/Juicer privacy terms.
- Whether a hand-built embed blockquote (URL only) renders reliably.
- The 2026-07-01 amendment to ekomloven, and Datatilsynet/Nkom guidance.
- Club landing-page traffic (matters for view caps).
