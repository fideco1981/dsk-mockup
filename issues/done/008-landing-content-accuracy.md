## Parent PRD

`issues/prd.md`

## What to build

Correct the landing page (`index.html`) content so it's accurate enough to go live, and remove legacy files. Fix the "Teknikern" typo, replace the "all training 18:00–19:30" oversimplification with the real per-group schedule, ensure the Arrangement section reflects real events (Årsmøte 25 Mar 2026, Telenorkarusellen dates), confirm the Spond signup button, and flag the unverified Haukås hero stats. Delete the legacy `schedule.html`.

Content from `content-baseline.md` → "Arrangement", "Treningsopplegg", "Haukåsløypa".

## Acceptance criteria

- [x] "Teknikern" → "Teknikeren" everywhere on the landing page.
- [x] Training schedule reflects real per-group days/times (not a single blanket time).
- [x] Arrangement section lists Årsmøte (25 Mar 2026) and Telenorkarusellen (19 Jan / 18 Feb / 9 Mar) with correct details.
- [x] Spond "Bli medlem" button verified working.
- [x] Haukås hero stats (500 m / 133 m / 47%) either confirmed or marked provisional / removed pending issue 009.
- [x] Legacy `schedule.html` removed.

## Progress (2026-05-29)

Done. Index landing page is now accurate enough to go live.

- **Teknikern → Teknikeren** in schedule legend + every desktop/mobile schedule
  card. The two artificial sub-groups "Teknikern 1" and "Teknikern 2" collapsed
  into a single "Teknikeren" group (matches baseline). Also fixed `Hovbakken`
  typo → `Hovedbakken`. The "Teknikeren" program-card was already spelled
  correctly. Test `test/index.test.js` enforces this with the same
  `Teknikern(?!e)` boundary-safe regex used on the treningsopplegg page.
- **Real per-group schedule.** Schedule grid now shows:
  - Mon: Rekrutten + Teknikeren
  - Tue: DSK Fun only
  - Wed: Rekrutten + Teknikeren
  - Thu: Teknikeren + DSK Fun
  - Fri: stengt; Lør/Søn: heis 11:00–15:00
  The "Alle treninger starter 18:00 og slutter 19:30" blanket note replaced
  with a per-group recap that also says U12–U16 trener på Skimore + Drammen
  skisenter, tider i Spond. Tests enforce: Rekrutten on Mon+Wed only, DSK Fun
  on Tue+Thu only, no "alle treninger starter 18:00" sentence.
- **Real events.** Replaced the 3 invented placeholder events with the 4 real
  ones from baseline: Telenorkarusellen #1 (mandag 19. januar 2026 18:00),
  #2 (onsdag 18. februar 2026 18:00), #3 (mandag 9. mars 2026 18:00), and
  Årsmøte 2026 (onsdag 25. mars 2026 18:00) with the Google Drive link for
  årsmøte-dokumenter. Telenorkarusellen cards note "barn t.o.m. 12 år" and
  "påmelding på basen før start" / "åpent for alle" per baseline.
- **Events grid CSS** switched from `repeat(3, 1fr)` to
  `repeat(auto-fit, minmax(280px, 1fr))` so 4 cards fit cleanly on desktop
  (and any future count works without a CSS edit).
- **Spond CTAs verified.** Both hero `Bli Medlem →` and membership-section
  `Meld deg inn nå →` link to the real Spond signup form with
  `target="_blank" rel="noopener"`. Test asserts both.
- **Haukås stats marked provisional.** Added a `.haukos-disclaimer` line
  directly under the description: "Lengde, høydeforskjell og maks fall er
  **ubekreftet** — venter bekreftelse fra klubben." The mockup numbers (500m
  length, 133m vertical, 47% maks fall) and the elevation chart stay visible
  for visual impact but the disclaimer surfaces them as unconfirmed until
  issue 009 lands real values. Test mirrors the om-oss qualifier pattern: if
  any of 500m/133m/47% appear, a qualifier word (uavklart/ubekreftet/etc.)
  must appear on the page.
- **`schedule.html` deleted.** Was already legacy (content folded into
  `index.html` in commit 088b29c per PRD § Further Notes). No other file
  referenced it (`grep -l schedule.html` clean).

## Feedback loops

- `npm run test`: 59/59 green (10 new index tests + 49 prior).
- `npm run typecheck`: clean.

## Notes for next iteration

- Issue 003 (push to origin) still blocked on user — this commit lands 6
  commits behind origin once pushed.
- Issue 009 (HITL) replacement for the Haukås `ubekreftet` disclaimer: once
  the club confirms (or corrects) the 500m / 133m / 47% numbers, delete
  `.haukos-disclaimer` and update any wrong numbers in `.haukos-desc`, the
  `.fact-chip` values, and `index.html` line ~837 (`statsObs` counter
  config) plus the elevation-chart axis labels. U12–U16 price (also blocked
  on 009) lives in `treningsopplegg.html` as already noted there — no copy
  on the landing page needs revising.
- Only remaining open AFK candidate after this commit is issue 003's "push
  + phone verify" criteria; both are HITL.

## Blocked by

- Blocked by `issues/001-shared-layout-foundation.md`

## User stories addressed

- User story 5
- User story 7
- User story 8
