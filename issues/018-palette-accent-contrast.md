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

## Comments

**Blue fixed (2026-10-17):** Stein scoped this to the default blue palette. Red and green wait for the board's pick and keep their `KNOWN` exclusions.
- Buttons, the skip link and the topbar keep the logo blue `#009FE3` with dark text (`--on-blue`), at 5.9:1. Hover goes to the lighter `--blue-lt`, at 8.6:1. `--blue-dk` is renamed to `--blue-hover`, since hover was its only use.
- `.chip-blue` uses the new `--blue-ink` (`#006A99`), at 5.3:1.
- `--accent-lt` is lightened to `#9A8CE6` for purple text on dark. `.event-date .day` and the gradient CTA section tags now use it. axe can't measure those tags (gradient background); they were at 2:1. `.chip-orange` and Vara's avatar gradient switch to `--accent` so they stay readable.
- Still open: red and green. Once the board picks, fix the kept palette the same way (its `--on-blue`, `--blue-ink` and a lighter `--blue-lt`), drop its `KNOWN` entry, then close this ticket.
