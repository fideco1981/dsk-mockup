## Parent PRD

`issues/prd.md`

## What to build

**HITL** — collect the real-world facts and decisions that only the club/Stein can provide, so the provisional items across the other issues can be finalized before go-live. No code; this is a checklist whose answers feed issues 004, 007, 008, and the privacy/palette decisions.

See PRD → "Further Notes" (items needing club input).

## Acceptance criteria

- [x] U12–U16 DSK training price confirmed (feeds issue 007). — **deferred**: per Stein, the final rate will be set for the 2026/27 season and published in autumn. Mockup copy updated in `treningsopplegg.html` to communicate the timing instead of saying "ikke bekreftet" with no explanation.
- [x] Confirm whether a club email (e.g. `post@drammenslalomklubb.no`) exists for contact routing (feeds issues 002, 005). — **no**, no club email exists. Site keeps role-based "kontakt via styret" routing. Recommendation for the board: create a shared inbox so future contact forms have a home.
- [x] Haukåsløypa stats confirmed or corrected — length, vertical drop, max gradient (feeds issues 004, 008). — **confirmed via KML/GPS traces of the slope**. The 500m / 133m / 47% numbers are real, not guesses. `.haukos-disclaimer` reworded from "ubekreftet — venter bekreftelse" to "beregnet fra GPS-spor (KML-data) av bakken" so the source is transparently attributed.
- [x] 2025-vs-2026 year mix on the live site resolved (feeds issue 008). — **resolved**. Topbar says "Sesong 2025/26 er i gang" (already correct); skiskole + treningsopplegg refer to the current season; styret season line now says "valgt på årsmøtet for sesongen 2024–2025, sittende inntil årsmøtet 25. mars 2026" so the board's seating period is unambiguous.
- [x] Palette chosen: blue (Alpine Edge) / red (Rødt Spor) / green (Grønt Fjell). — **deferred to the board**: instead of picking one now, deployed a topbar switcher (3 colour dots) so the board can compare all three live on their phones during the demo. Choice persists across pages via localStorage. PRD user story 17 explicitly calls for swappable palettes, so the switcher arguably stays even after the board picks.
- [x] Board's decision on which contact details may be published (replaces masking). — **deferred to post-demo per PRD user story 4**. All board personal phones/emails stay masked in this iteration; the board decides what to publish after seeing the masked-by-default demo. `test/styret.test.js` keeps the PII-leak guard active so unintentional re-publication will fail the build.

## Outcomes (2026-05-29 close-out)

All six items have an answer recorded. Two items (U12-U16 price, board contact-publishing policy) intentionally remain "deferred" — they're outside the demo's go-live scope and waiting on board input that won't arrive before the demo. Their copy on the mockup is honest about the wait so the demo doesn't appear incomplete.

**Code changes that landed:**

- `eaa7687` — Haukås disclaimer softened, styret season-line extended, U12-U16 board-note enriched with 2026/27 timing.
- `f6e2e24` — Topbar palette switcher (blue / red / green), CSS variable overrides under `body[data-palette]`, localStorage persistence, 5 new tests + 1 helper update (JSDOM url for localStorage availability).

**Recommendations for the board to act on after the demo:**

1. Create a shared inbox (e.g. `post@drammenslalomklubb.no`) so future contact-form work has somewhere to route mail. Update `site.js` `NAV_MODEL` + the kontakt page contact card.
2. Decide on the published palette — the switcher can stay as a feature or be removed in favour of the chosen default.
3. Decide which board contact details (phone/email) can be republished. The `LEAKED` guard in `test/styret.test.js` will need to be relaxed per-person if anything is republished.
4. Once the 2026/27 U12-U16 training price is set, replace the `training-price-note` in `treningsopplegg.html` with the concrete number.

## Blocked by

None - ran in parallel; outputs unblocked final content.

## User stories addressed

- User story 4 (board decides contact publishing)
- User story 16 (clear list of items needing club input)
- User story 17 (palette swappable)
