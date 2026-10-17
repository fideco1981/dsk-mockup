Status: ready-for-agent

## Parent PRD

`issues/prd-sanity.md`

## What to build

The landing page's "Kommende Arrangement" section shows the Events published in Studio, and visitors can't tell the difference from today's hand-written cards.

- Uses the query and fallback seam from 013. Events render only where an events mount exists (the landing page).
- Client-side: keep events dated today or later in the visitor's local time, sort them by date ascending, and show at most 3.
- Each card reproduces the current markup: a day/month block derived from the date, chips with their mapped colour classes, a title with the formatted Norwegian date and optional time, a location line with the `aria-hidden` pin icon, and an optional http(s) link (new tab, `rel="noopener"`). The heading level matches the hand-written cards.
- Rendered cards are visible without the landing page's fade-in observer, which only registers elements present at load.
- While loading, the section shows a skeleton or nothing, never the stale fallback cards. A successful empty result shows a short Norwegian "no upcoming events" message. A failure reveals the fallback cards.

See PRD: "Shared layout engine", "Loading behaviour", "Fade-in", "Rendering and safety", "Content model".

**Blocked by:** 013.

## Acceptance criteria

- [x] `makeDoc` gains an events mount point.
- [x] Test: fixtures dated in 2000 and 2999 → only upcoming events are shown, nearest first, at most 3. No clock mocking.
- [x] Test: cards are not in the fade-in hidden state.
- [x] Test: chips render with their mapped colours.
- [x] Test: markup in event fields is rendered as text.
- [x] Test: an empty list shows the "no upcoming events" message, not the fallback.
- [x] Test: a fetch failure reveals the fallback cards.
- [x] Checked by hand on localhost: a card created in Studio appears after a reload, and looks the same as the hand-written ones.
