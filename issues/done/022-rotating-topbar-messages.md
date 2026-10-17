Status: done

## Parent PRD

`issues/prd-sanity.md` (changes its Topbar message from one text to a list)

## What to build

Bring back the landing page's old rotating topbar, which issue 013 removed because it overwrote the CMS text, but driven by Studio. Remove the palette switcher, since blue is the logo colour.

- The Toppmelding singleton holds an ordered list of messages (text, optional link) that editors reorder by dragging, plus the existing show/hide toggle for the whole bar.
- Several messages rotate every 5 s with the old fade. One message doesn't rotate. With the toggle off, the bar is hidden.
- A pause button (`aria-pressed`) appears only when the bar rotates. Hover and focus also pause it. This meets WCAG 2.2.2 (Pause, Stop, Hide), which axe doesn't check.
- Not a live region, so screen readers aren't interrupted on each change.
- When Sanity fails or returns no valid message, the hand-written fallback shows, as before.

## Acceptance criteria

- [x] Schema: `messages` array (text required, link optional) plus `show`. `sanity schema validate` passes.
- [x] Test: messages rotate in order and wrap; the icon survives the swap.
- [x] Test: the pause button, hover and focus each stop the rotation.
- [x] Test: one message, or the toggle off, means no timer and no pause button.
- [x] Test: no `aria-live` in the topbar.
- [x] Palette switcher, red/green CSS, their tests and `KNOWN` axe entries removed; issue 018 closed.
- [x] axe scan passes with two messages (pause button visible) on every page.
- [x] Checked in Chromium: rotates after 5 s, stays put when paused.
- [x] (HITL) Studio deployed, and the current message re-entered as the first item in the list. The old `text`/`link` fields aren't migrated; until it's re-entered, the site shows the fallback.

## Closeout (2026-10-17)

Built as specified. Studio deployed, and Stein published the new message list; an anonymous query returns `messages` (one item so far) with `show: true`. The old `text` field is still on the document; the site ignores it.
