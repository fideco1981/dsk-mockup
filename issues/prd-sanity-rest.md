# Spec — Resten av nettstedet redigerbart i Sanity (Styret, Kontakt, Klubbinfo, Sosiale medier)

Status: ready-for-agent

> Hand-off from `issues/map-sanity-rest.md`. Decided in the wayfinding sessions of 2026-10-18; the decisions and their detail live in that map's tickets ("How to show Instagram posts on a static site", "Socials section: what it shows and what editors control"), ADR 0003 and `CONTEXT.md`. Builds on `issues/prd-sanity.md` and keeps its architecture.

## Problem Statement

After the first Sanity slices, editors can keep events, the topbar, sponsors, training groups, the ski school, courses and lift hours current. Everything else that changes between seasons still lives in hand-written HTML, which only Stein can edit:

- the board on Styret, and the årsmøte line saying when it was elected and how long it sits (already out of date);
- the role-based contacts on Kontakt;
- the club's addresses, org number, social links and Spond signup link, copied into the footer, Kontakt and three places on the landing page;
- the landing page's "Følg oss på Instagram" section, which shows six emoji placeholder tiles instead of anything from the club.

At the board demo, every one of these is another "only Stein can change that". The placeholder tiles also make the landing page look unfinished. The club has a TikTok account, and the site doesn't link to it anywhere.

## Solution

Four more pieces of content become editable in Studio. The site keeps the same no-build browser fetch from the public dataset.

- **Board** (Styret): one singleton with the term line and an ordered list of Board members. Styret renders from it.
- **Club info** (Klubbinfo): one singleton holding the addresses, the org number, social links for Instagram, Facebook and TikTok, the Spond signup link, the membership call-to-action text and the ordered list of Contact persons. The footer, Kontakt and the landing page render from it.
- **Featured posts** (Utvalgte innlegg): up to six posts picked by hand (image, alt text, link) replace the emoji tiles. The section becomes "Følg oss", with Instagram, Facebook and TikTok buttons. ADR 0003 makes Featured posts the second image type in Sanity.
- Real brand logos for Instagram, Facebook and TikTok replace the generic camera and people icons.

Everything ships together for the board demo.

## User Stories

1. As a board member at the demo, I want to see Stein change the board list in Studio and see it on Styret after a reload, so that I believe the board can maintain the site after the next årsmøte.
2. As a board member, I want Styret to show the current board and term rather than "sittende inntil årsmøtet 25. mars 2026", so that the demo doesn't look out of date.
3. As an editor, I want to add, remove and reorder Board members by dragging, so that the order on the page matches the board's own order without me managing numbers.
4. As an editor, I want to give each Board member a name and a position picked from a fixed list (Styreleder, Nestleder, Sportslig leder, Styremedlem, Vara), so that roles are spelled the same way every time.
5. As an editor, I want to write the board's term as one line of free text, so that I can phrase the årsmøte dates however the board likes.
6. As a visitor, I want board members and deputies in separate groups, as today, so that I can see who sits on the board and who steps in.
7. As a visitor, I want the "Varamedlemmer" group to disappear when there are no deputies, so that I don't see an empty heading.
8. As a visitor, I want the Styret subtitles not to claim a number of members, so that they never contradict the list below them.
9. As a visitor, I want each board card to show initials, the name and the position, as today, so that the change to Sanity is invisible in the design.
10. As a visitor, when Sanity can't be reached I want Styret to hide the board, not show an old one, so that I'm never told the wrong people are in charge.
11. As an editor, I want to maintain the Kontakt contact persons (name and a free-text role such as "Foreldrekontakt · U12–U14") in a list I reorder by dragging, so that parents find the right person.
12. As an editor, I want to enter a person who is both on the board and a contact person twice, without the two lists being linked, so that each list stays simple.
13. As an editor, I want Studio's help text to tell me not to put phone numbers or email addresses in a role, so that I don't publish personal contact details by mistake.
14. As a visitor, when Sanity can't be reached I want Kontakt to still show the contact persons from the hand-written fallback, so that I can always find someone to ask.
15. As an editor, I want to change the visiting address, postal address and org number in one place, so that the footer and Kontakt never disagree.
16. As an editor, I want to change the Spond signup link once, so that every "Bli Medlem" and "Meld deg inn" button on the site follows.
17. As an editor, I want to set or clear the Instagram, Facebook and TikTok links, so that the site links only to accounts the club runs.
18. As a visitor, I want a TikTok button next to Instagram and Facebook, so that I can follow the club where I already spend time.
19. As a visitor, I want the social buttons to show the real Instagram, Facebook and TikTok logos, so that I recognise them at a glance.
20. As a visitor using a screen reader, I want each social button labelled with the network's name, so that I know where it leads.
21. As a visitor, I want the Instagram handle shown on the landing page to match where the button goes, so that I can search for it by hand if I like.
22. As a visitor, when Sanity can't be reached I want the footer, Kontakt and the landing page to still show the addresses, org number, social buttons and signup links, so that I can always act on them.
23. As an editor, I want to change the membership pitch and the short points under the "Meld deg inn nå" button, so that I can update what we offer new members (e.g. "Første time gratis for barn 5–10 år").
24. As an editor, I want to add a Featured post with an image, alt text and a link, so that the landing page shows real moments from the club.
25. As an editor, I want a Featured post to link to any URL, an Instagram post, a TikTok video or a news item, so that I can feature whatever is worth showing.
26. As an editor, I want to reorder Featured posts, and I want only the first six shown, so that I can keep older posts in Studio without them crowding the page.
27. As an editor, I want alt text to be required, so that I can't publish a post screen-reader users can't follow.
28. As a visitor, I want each Featured post to be a square tile that opens its link in a new tab, so that the grid looks tidy and I don't lose the club site.
29. As a visitor, I want the grid to show only the posts there are (one to six), and none at all when there are none, so that I never see empty placeholder tiles.
30. As a visitor, when Sanity can't be reached I want the Featured posts hidden while the heading and follow buttons stay, so that the section still does its job.
31. As a visitor, I want Featured post tiles to be visible straight away, not stuck at the fade-in starting state, so that the section isn't silently empty.
32. As a visitor, I don't want the site to load anything from Meta or TikTok to show the posts, so that I'm not tracked by visiting the club's page.
33. As a visitor without JavaScript, I want the fallback contact details, contact persons, social buttons and signup links, so that the site stays usable.
34. As a visitor, I want CMS text inserted as text and links only followed when they are http(s), so that an editor's mistake can't break or hijack the page.
35. As Stein, I want the new types in Studio's left menu next to the existing ones, so that editors find them.
36. As Stein, I want the new schemas versioned in this repo alongside the code that reads them, as before.

## Implementation Decisions

**Architecture (unchanged)**
- No build step. The same single query per page load in the shared layout engine gains Board, Club info and Featured posts. Same public dataset, no token, same live API endpoint.
- Rendering stays client-side and text-only (no markup from CMS strings). Links are only rendered for `http(s)` URLs, open in a new tab with `rel="noopener"`.
- `init(doc)` keeps returning a Promise that never rejects. Each piece falls back on its own, as the existing pieces do.

**Content model (Sanity schemas, Norwegian labels and help text)**
- **Board** (`board`, singleton): `term` (one line of free text, e.g. "Valgt på årsmøtet 2026, sittende inntil årsmøtet 2027") and `members`, an ordered array of `{ name (required), position (required, one of Styreleder, Nestleder, Sportslig leder, Styremedlem, Vara) }`. Order is the array order (drag to reorder), with no order field.
- **Club info** (`clubInfo`, singleton):
  - `visitAddress`, `postAddress`, `orgNumber` (text)
  - `instagram`, `facebook`, `tiktok` (optional URLs; empty hides that network's button everywhere)
  - `spondSignup` (URL)
  - `membershipText` (the paragraph under "Bli en del av klubben") and `membershipPoints` (a short list of text lines shown under the button)
  - `contactPersons`, an ordered array of `{ name (required), role (required, free text) }`, with help text saying no phone numbers or emails.
- **Featured post** (`featuredPost`, document): `image` (required), `alt` (required), `link` (required URL), `order` (number). Sorted by `order`, first six shown.
- The Spond courses URL stays with Courses and is not part of Club info.
- Both singletons follow the existing singleton pattern (no "create new", no duplicate/delete). All three types are added to Studio's left menu structure.

**Styret**
- The hand-written board cards are removed. The board grids and the term line are hidden until Sanity answers, then rendered. With Sanity failing, they stay hidden (no fallback content, per `CONTEXT.md`). The page hero title and the privacy note stay.
- Members with position Vara go in the "Varamedlemmer" grid with the deputy avatar style; the rest go in "Styremedlemmer", each in array order. With no deputies, the Vara subheading and grid are hidden.
- Avatar initials come from the first letter of the first and last word of the name.
- The subtitles drop their counts ("Åtte styremedlemmer…", "To varamedlemmer…") and become count-free prose.

**Club info consumers (fallback = current values)**
- **Footer**: the address lines, social buttons and "Bli Medlem" link render from Club info. The current hard-coded values (plus TikTok) remain the fallback until Sanity answers or when it fails.
- **Nav "Bli Medlem" CTA, landing hero CTA and landing membership CTA**: their href follows `spondSignup`. The membership paragraph and points follow `membershipText` and `membershipPoints`. The "Bli en del av klubben" heading stays in HTML.
- **Kontakt**: the address, postal address and org number fact chips, the contact person cards and the social cards (Instagram, Facebook, TikTok, plus the Spond card using `spondSignup`) render from Club info. The current HTML, with a TikTok card added, is the fallback. Contact person cards keep today's markup ("kontakt via klubben", initials avatar).
- The hand-written fallback is shown until Sanity answers and kept on failure. Swapping it for the CMS version is acceptable here because this content is identical most of the time. This differs from Events, which hide until Sanity answers.

**Socials section on the landing page**
- Retitled along the lines of "Følg oss"; tag and heading stay in HTML. Under the heading: the Instagram handle (derived from the last path segment of the Instagram URL, shown as `@handle`) and buttons for each network with a URL.
- The emoji tiles are removed. Featured posts render as square tiles: a link wrapping an image with the post's alt text. The image comes from Sanity's image CDN resized to the tile size with `auto=format`, center-cropped by CSS `object-fit: cover`. The Studio hotspot is ignored (ADR 0003; add hotspot parameters only if a crop cuts off a face).
- With zero posts, or on failure, or without JS, the grid is hidden; heading, handle and buttons remain.
- Tiles must be visible without the landing page's fade-in observer (same rule as event cards).

**Icons**
- Single-colour Instagram, Facebook and TikTok brand icons are added to the inline icon sprite on every page that carries it. They replace `icon-camera` and `icon-users` for social buttons. The buttons keep `aria-label` with the network name and the SVG stays `aria-hidden`.

**Docs**
- ADR 0003 (written) amends ADR 0002. `CONTEXT.md` already defines Board member, Contact person, Club info and Featured post; update the Studio entry's list of what editors change.

## Testing Decisions

- **Good tests** assert what a visitor or assistive technology perceives after `await init(doc)`: which names, roles, addresses and links appear, in what order, and what is hidden. They don't touch private helpers or the query string.
- **The one seam:** `init(doc)` with `fetch` stubbed on the JSDOM window (`stubFetch`). Page tests load the real `styret.html`, `kontakt.html` and `index.html`, as the existing page tests do. Footer tests can use `makeDoc`. No test calls the real Sanity.
- **Cases:**
  - Styret: members render in array order, split into board and Vara grids. The Vara grid is hidden with no deputies. The term line shows. Initials are derived. On a rejected fetch, the board and term stay hidden. Strings containing markup render as text.
  - Kontakt: contact persons render in order from Club info. Addresses and org number follow Club info. On failure, the fallback cards and values remain.
  - Social links: buttons render only for networks with a URL, with an `aria-label`. Non-http(s) URLs are not rendered as links. The landing handle is derived from the Instagram URL. A TikTok button appears in the footer, on Kontakt and in the landing section.
  - Spond signup: nav CTA, hero CTA, membership CTA, footer and the Kontakt Spond card all follow `spondSignup`.
  - Featured posts: sorted by order, capped at six, each a link with an image carrying the alt text. With zero posts or on failure, the grid is hidden and the buttons stay. Tiles are not in the fade-in hidden state.
  - The existing styret and kontakt PII-leak guards keep running against the rendered page with CMS fixtures. The no-token guard stays green.
- **Prior art:** `test/styret.test.js` and `test/kontakt.test.js` (real-page loading and the baseline-driven leak guard). `test/helpers.js` `makeDoc`/`stubFetch`. The sponsor-strip tests for an image type with no fallback. The existing Styret tests that assert the hand-written board must move to CMS fixtures.
- **Not tested:** Studio schemas and UI, the visual crop of tiles, and brand icon shapes. These are checked by eye before the demo.

## Out of Scope

- Slope figures (lengths, drops, "3 Bakker"). They almost never change.
- History, the mission quote, Bragder, hero text, nav, and the Skiskole/Treningsopplegg hero and call-to-action copy: static prose.
- Socials section heading and tag text, and the "Bli en del av klubben" heading.
- Automatic Instagram/TikTok feeds (Graph API, embeds, Behold). Rejected in ADR 0003.
- Linking Board members and Contact persons, or personal phone/email on any card.
- Hotspot-aware cropping of Featured posts.
- The Styret seating line in ticket 016 (now covered here by the term line).

## Further Notes

- **HITL before the demo (Stein):**
  - Deploy the updated Studio.
  - Fill in Board (current board and term from the club), Club info (current values plus TikTok `https://www.tiktok.com/@drammen_slalomklubb`) and pick 3–6 Featured posts from Instagram/TikTok.
- **Unverified:**
  - whether Sanity's image CDN sets cookies (the research did not check image CDNs).
  - whether @drammenslalomklubb is a personal or professional account. It doesn't matter for curated posts.
- **Known cost, accepted in ADR 0003:** Featured posts go stale unless someone uploads new ones. The section reads as highlights, not a feed.
- **Demo script addition:** change a Board member or the term line in Studio → publish → reload Styret on a phone.
