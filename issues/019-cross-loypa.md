Status: ready-for-agent

## Parent PRD

`issues/prd.md`. New slope for the 2026/27 season, decided in a grilling session with Stein (2026-10-17).

## What to build

Add **Cross-løypa** to the Haukåsløypa section ("Vår hjemmebane"). It is a new slope that links the main slope (hovedløypa) and barnebakken. Its GPS track is `docs/lengdeprofil.kml`: about 250 m long, running from 168 m down to 111 m (57 m drop). It ends at 111 m, which is the top of barnebakken.

The KML has two points at about 41 m in the middle (`…,41.0215374077473` and `…,40.9499593705811`). They come from a road tunnel deep under the slope, so filter them out. Leaving them in puts a 100 m dip in the profile and breaks "maks fall".

- **`index.html` Haukåsløypa section (around line 484):**
  - Add this text to the paragraph: "Nytt denne sesongen: **Cross-løypa**, ca. 250 meter med 57 meters fall, som binder hovedløypa og barnebakken sammen. Her kan det dukke opp hopp og doserte svinger." Hopp are not decided yet, so keep the wording loose.
  - Add two `.fact-chip`s: Cross-løypa lengde ≈250 m and Cross-løypa høydeforskjell 57 m.
  - Add a "Ny denne sesongen" badge. Give it no date, and remove it next season.
  - Don't give it a difficulty colour. The other slopes don't have one either.
- **Elevation SVG (the `ELEVATION PROFILE` script, around `index.html:861`):**
  - Add a third inline coordinate string next to `STORE` and `LILLE`, without the tunnel points.
  - Draw it as a second inset, styled like the barnebakke inset, labelled "168m / 111m / 250m · X%". Work out X from the data, the same way as for barnebakken.
  - Keep the coordinates inline. Don't fetch the KML at runtime (that adds a network request, breaks on `file://`, and the data changes only once a season).
- **`om-oss.html` (around line 166):** add one sentence about Cross-løypa next to "både en hovedbakke og en barnebakke", and update the "Bakker" chip to match.
- **`docs/`:** commit `store.kml`, `lille.kml` and the new track. `git mv` `lengdeprofil.kml` to `crossloype.kml` so the source data is kept.
- **`CONTEXT.md`:** add **Cross-løypa** to the glossary.

Out of scope: `index-v2.html` and `index-v3.html` (untracked old mockups), Sanity/CMS, and the stale-stats note in `om-oss.html` (that is 020).

## Acceptance criteria

- [ ] The Haukåsløypa section shows the Cross-løypa text, the two new fact chips and the "Ny denne sesongen" badge.
- [ ] The elevation SVG shows a Cross-løypa inset with no tunnel dip, labelled with its top and bottom height, its length and a computed gradient.
- [ ] `om-oss.html` mentions Cross-løypa, and its "Bakker" chip includes it.
- [ ] `docs/store.kml`, `docs/lille.kml` and `docs/crossloype.kml` are committed.
- [ ] `CONTEXT.md` defines Cross-løypa.
- [ ] Checked on localhost at desktop and phone width, and `npm run test:a11y` passes.

## Comments
