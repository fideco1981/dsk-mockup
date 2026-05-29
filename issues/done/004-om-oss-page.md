## Parent PRD

`issues/prd.md`

## What to build

`om-oss.html` — the club's identity page. Presents history (founded 7 January 1936, Norway's oldest pure alpine ski club), mission, notable achievements, and Haukåsløypa. Uses CSS/gradient hero and existing assets (no new photos).

Content from `content-baseline.md` → "Om oss" and "Haukåsløypa". Haukås stats (length/vertical/gradient) must be presented only if confirmed (see issue 009); otherwise omit or mark provisional.

## Acceptance criteria

- [x] `om-oss.html` covers history, mission, achievements, and Haukåsløypa.
- [x] Founding date and "Norway's oldest pure alpine club" claim presented prominently.
- [x] Unconfirmed Haukås numbers are not stated as fact (provisional or omitted pending issue 009).
- [x] Uses shared `styles.css` + injected nav/footer; "Om oss" nav state active; mobile menu works.
- [x] All links relative; accessible.

## Blocked by

- Blocked by `issues/001-shared-layout-foundation.md`

## User stories addressed

- User story 3

## Progress (2026-05-29)

Done. `om-oss.html` ships on the shared layout (page-hero + injected
nav/footer, `body[data-page="om-oss"]`, relative links, noscript fallback).

Five content sections:
1. Page hero — "Om oss" + "Norges eldste rene alpinklubb — siden 1936".
2. **Stiftet 7. januar 1936** narrative prose calling out the founding date
   (prominent `<strong>`) and the "Norges eldste rene alpinklubb" claim;
   tied to early local races, the 1936–37 slope build-out, 1937
   electric lighting, and the first national championship in 1953.
3. Mission pull-quote — verbatim «Drammen Slalåmklubb skal være en
   hovedaktør for utvikling av alpinidrett i Drammensområdet.» from
   content-baseline.md, rendered as a `<blockquote>` with a centred
   gradient backdrop.
4. **Bragder** — three achievement cards: Hildegunn Meinstad (VM 1938),
   Jørgen Brath + Espen Theodorsen (junior-VM), Trygve Brunsell
   (senior-NM mars 1940).
5. **Haukåsløypa** — multi-generation framing, address (Blektjernveien
   18), Almedalshøyden 349 moh, hovedbakke + barnebakke + heis, snow
   cannons since 1982, lighting since 1937, fact-chips (address /
   bakker / opening hours / lighting + cannons).

**Haukås mockup stats deliberately omitted.** The 500 m / 133 m / 47%
numbers from the index page are unverified per `content-baseline.md` line
21, so this page does not state them at all and shows a `board-note`
explaining they'll be added once confirmed (gated on issue 009).
`test/om-oss.test.js` enforces this — if any of the three numbers ever
appear, they must be qualified with words like "uavklart" / "ubekreftet"
/ "ikke bekreftet" / "må bekreftes" / "venter bekreft…", otherwise the
test fails.

### CSS additions to `styles.css`

New, scoped to this page (no impact on existing pages):
- `.about` / `.about-inner` / `.about-prose` — narrative prose block,
  880 px column, muted body text, `<strong>` lifted to white.
- `.about-mission` + `.about-quote` + `.about-quote-mark` +
  `.about-quote-attr` — pull-quote with radial-gradient backdrop and a
  large decorative « in the club's blue.
- `.about-achievements` + `.achievement-grid` (3-col → 2-col on 1024,
  1-col on 768) + `.achievement-card` (with hover lift mirroring
  `.board-card`) + `.achievement-icon` / `-year` / `-name` / `-desc`.
- `.about-haukos` + `.about-haukos-facts` — 2-col `fact-chip` grid
  (reused from index hero), collapses to 1-col on 768.

### Tests

`test/om-oss.test.js` (7 tests, integration-style — loads om-oss.html
into JSDOM, runs site.init):
- "Om oss" nav link active + aria-current
- founding date 7. januar 1936 present
- "eldste" + alpine/slalåm qualifier present
- mission quote present
- all four named athletes present
- unconfirmed Haukås numbers either absent or qualified
- "Haukåsløypa" + multi-generation framing present

The deploy audit (`test/deploy.test.js`) auto-covers the new page — it
scans every NAV_MODEL page on disk, so om-oss.html now appears in the
"no absolute internal links" loop without any test edits.

### Feedback loops

- `npm run test`: 23/23 green (7 new om-oss tests + 15 prior + 1 helper).
- `npm run typecheck`: clean.
