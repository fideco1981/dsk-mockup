# Drammen Slalåmklubb site

Glossary for the club website. Decisions live in `docs/adr/`.

- **Event** (Arrangement, Sanity type `event`): a dated club happening shown on the landing page. Only upcoming ones are shown, nearest first, at most three.
- **Topbar message** (Sanity type `topbarMessage`): the site-wide announcement line at the top of every page. A singleton with text, an optional link and a show/hide toggle.
- **Studio**: the Sanity editing app, sourced from `studio/` and hosted on `*.sanity.studio`. Where editors change Events and the Topbar message.
- **Fallback content**: the hand-written HTML shown without JS or when Sanity fails. A snapshot that may drift; Sanity wins whenever it answers.
- **Chip**: a fixed-vocabulary event tag with a colour (Renn, Gratis, Årsmøte, Medlemmer). Adding one means updating the Studio schema and the colour map in `site.js` together.
