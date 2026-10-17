Status: needs-triage

## Parent PRD

`issues/prd-sanity.md`. Found by the axe scan in 015.

## What to build

The palette accent colours fail WCAG 2.1 AA colour contrast (4.5:1, or 3:1 for large text). These colours are the palette tokens the board is comparing live (`--blue`, `--blue-lt`, `--accent`, `--accent-lt` in `styles.css`), so changing them is a design call, not a quick fix. axe measured:

- **Blue (default):** white on `#009FE3` is 2.97:1 (`.btn-nav`, `.btn-primary`, topbar). `.chip-blue` text is 2.6:1. `.event-date .day` (`--accent` on dark) is 1.98:1. `.course-badge-alt` and `.training-tag-purple` (`--accent-lt` on dark) are 2.5–3:1.
- **Red:** `#E8001C`/`#F03A52` text on dark is 3.4–4.2:1 (`.section-tag`, `.wordmark em`, `.board-role`, `.board-note a`, `.instagram-handle`, `.day-name`, `.day-pill`, `.training-tag-blue`, `.quick-nav-age`, `.achievement-year`, `.course-badge`). The topbar link is 3.6:1. `.chip-blue` and `.chip-orange` are 4.1:1 and 2.2:1.
- **Green:** white on `#00B87A` is 2.58:1 (`.btn-nav`, `.btn-primary`, topbar). `.chip-blue` and `.chip-orange` are 2.3:1 and 1.9:1. The events `.section-tag` (`#C4820A` on snow) is 2.9:1.

Typical fixes: dark text on the accent buttons, or a darker accent shade for button backgrounds. Use a lighter shade for accent text on dark.

## Acceptance criteria

- [ ] The palette(s) the board keeps pass AA colour contrast.
- [ ] The matching `KNOWN` entries in `a11y/a11y.spec.js` are removed, and `npm run test:a11y` passes.
