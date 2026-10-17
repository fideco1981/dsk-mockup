# Drammen Slalåmklubb site

Glossary for the club website. Decisions live in `docs/adr/`.

- **Event** (Arrangement, Sanity type `event`): a dated club happening shown on the landing page. Only upcoming ones are shown, nearest first, at most three.
- **Topbar message** (Sanity type `topbarMessage`): the site-wide announcement line at the top of every page. A singleton with text, an optional link and a show/hide toggle.
- **Sponsor** (Sanity type `sponsor`): a club sponsor shown as a logo in the strip at the top of every page's footer, sorted by its order field. The only Sanity type with an image (ADR 0002). It has no Fallback content: the strip is hidden when Sanity fails.
- **Studio**: the Sanity editing app, sourced from `studio/` and hosted on `*.sanity.studio`. Where editors change Events, the Topbar message and Sponsors.
- **Fallback content**: the hand-written HTML shown without JS or when Sanity fails. A snapshot that may drift; Sanity wins whenever it answers.
- **Chip**: a fixed-vocabulary event tag with a colour (Renn, Gratis, Årsmøte, Medlemmer). Adding one means updating the Studio schema and the colour map in `site.js` together.
- **Cross-løypa**: the slope, new for 2026/27, that links hovedløypa and barnebakken. It ends at the top of barnebakken. Its GPS track is `docs/crossloype.kml`, which has two ~41 m points from the road tunnel under the slope. Filter those out before use.
