/*
 * site.js — shared layout engine for Drammen Slalåmklubb.
 *
 * Single source of truth for the site nav + footer. Every page includes this
 * script and provides two mount points plus a page marker:
 *
 *   <body data-page="index">
 *     <div id="site-nav"></div>     <- topbar + nav + mobile menu injected here
 *     ...page content...
 *     <div id="site-footer"></div>  <- footer injected here
 *
 * Public behaviour (covered by test/site.test.js):
 *   - inject the nav from NAV_MODEL into #site-nav
 *   - inject the footer into #site-footer
 *   - mark the current page's nav link active (aria-current + .active)
 *   - wire the mobile hamburger open/close + aria-expanded
 *   - load the Topbar message and landing-page Events from Sanity
 *     (test/cms.test.js); init(doc)
 *     returns a Promise that resolves once CMS content or the fallback shows
 *
 * No build step: in a browser this auto-runs on DOMContentLoaded. Under a
 * CommonJS test runner it exports its functions and does NOT auto-run, so
 * tests drive init(doc) against a JSDOM document explicitly.
 */
(function (factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    // CommonJS (tests) — export, do not auto-init.
    module.exports = api;
  } else if (typeof document !== 'undefined') {
    // Browser — progressive enhancement.
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        api.init();
      });
    } else {
      api.init();
    }
  }
})(function () {
  'use strict';

  const SPOND_URL =
    'https://club.spond.com/landing/signup/drammensk/form/79B423729D544EBABC46631C0E5DB0F3';

  // Public by design (issue 011): reads need no token. Never add one here.
  const SANITY_PROJECT_ID = 'uoseskhv';
  const SANITY_DATASET = 'production';
  // Live API (not apicdn) so a publish in Studio shows on the next reload.
  const CMS_QUERY =
    '{"topbar": *[_type == "topbarMessage"][0]{text, link, show},' +
    ' "events": *[_type == "event"]{title, date, startTime, location, description, link, chips}}';
  const CMS_URL =
    'https://' + SANITY_PROJECT_ID + '.api.sanity.io/v2025-02-19/data/query/' +
    SANITY_DATASET + '?query=' + encodeURIComponent(CMS_QUERY);

  // Single source of truth for navigation. `page` matches body[data-page].
  const NAV_MODEL = {
    links: [
      { page: 'index', href: 'index.html', label: 'Hjem' },
      { page: 'skiskole', href: 'skiskole.html', label: 'Skiskole' },
      { page: 'treningsopplegg', href: 'treningsopplegg.html', label: 'Treningsopplegg' },
      { page: 'om-oss', href: 'om-oss.html', label: 'Om oss' },
      { page: 'styret', href: 'styret.html', label: 'Styret' },
      { page: 'kontakt', href: 'kontakt.html', label: 'Kontakt' },
    ],
    cta: { href: SPOND_URL, label: 'Bli Medlem' },
  };

  // Palette swatches shown in the topbar. The first entry is the default
  // (no body[data-palette] attribute needed). `swatch` is the visible dot
  // colour; the actual palette comes from CSS body[data-palette="<key>"].
  const PALETTES = [
    { key: 'blue',  label: 'Alpine Edge (blå)',  swatch: '#009FE3' },
    { key: 'red',   label: 'Rødt Spor (rød)',    swatch: '#E8001C' },
    { key: 'green', label: 'Grønt Fjell (grønn)', swatch: '#00B87A' },
  ];
  const PALETTE_STORAGE_KEY = 'dsk-palette';

  /** Build the palette-switcher widget (3 colour dots in the topbar). */
  function paletteSwitcherHTML() {
    return (
      '<span class="palette-switcher" role="group" aria-label="Velg palett">' +
      PALETTES.map(function (p) {
        return (
          '<button type="button" data-palette="' + p.key + '"' +
          ' aria-label="' + p.label + '" aria-pressed="false"' +
          ' style="--swatch: ' + p.swatch + '"></button>'
        );
      }).join('') +
      '</span>'
    );
  }

  /** Build the nav links markup (shared by desktop nav + mobile menu). */
  function navLinksHTML(currentPage, opts) {
    const onClick = opts && opts.onClick ? ` onclick="${opts.onClick}"` : '';
    return NAV_MODEL.links
      .map(function (link) {
        const active = link.page === currentPage;
        const aria = active ? ' aria-current="page"' : '';
        const cls = active ? ' class="active"' : '';
        return (
          '<li><a href="' + link.href + '"' + cls + aria + onClick + '>' +
          link.label +
          '</a></li>'
        );
      })
      .join('');
  }

  /** Build the topbar + desktop nav + mobile menu markup. */
  function navHTML(currentPage) {
    const closeMobile =
      "document.getElementById('mobileMenu').classList.remove('open')";
    return (
      '<div class="topbar">' +
        // Hidden until the CMS answers; this hand-written text is the fallback.
        '<span class="topbar-msg" hidden>' +
          '<svg class="icon" aria-hidden="true" focusable="false"><use href="#icon-snowflake"/></svg> ' +
          'Sesong 2025/26 er i gang!&nbsp;&nbsp;·&nbsp;&nbsp;Påmelding til skiskolen er nå åpen — ' +
          '<a href="https://club.spond.com/landing/courses/drammensk" target="_blank" rel="noopener"><strong>Meld deg på her →</strong></a>' +
        '</span>' +
        paletteSwitcherHTML() +
      '</div>' +
      '<nav id="nav">' +
        '<div class="nav-logo">' +
          '<img class="logo-svg" src="logo.png" alt="Drammen Slalåmklubb logo">' +
          '<div class="wordmark">Drammen <em>Slalåmklubb</em></div>' +
        '</div>' +
        '<ul class="nav-links">' + navLinksHTML(currentPage) + '</ul>' +
        '<a href="' + NAV_MODEL.cta.href + '" target="_blank" rel="noopener" class="btn-nav">' +
          NAV_MODEL.cta.label +
        '</a>' +
        '<button class="hamburger" id="hamburger" aria-label="Åpne meny" aria-expanded="false" aria-controls="mobileMenu">' +
          '<svg class="icon" aria-hidden="true" focusable="false"><use href="#icon-menu"/></svg>' +
        '</button>' +
      '</nav>' +
      '<div class="mobile-menu" id="mobileMenu" role="dialog" aria-modal="true" aria-label="Navigasjon">' +
        '<button class="mobile-close" id="mobileClose" aria-label="Lukk meny">' +
          '<svg class="icon" aria-hidden="true" focusable="false"><use href="#icon-close"/></svg>' +
        '</button>' +
        '<ul class="nav-links">' + navLinksHTML(currentPage, { onClick: closeMobile }) + '</ul>' +
        '<a href="' + NAV_MODEL.cta.href + '" target="_blank" rel="noopener" class="btn-primary" onclick="' +
          closeMobile + '">' + NAV_MODEL.cta.label + ' →</a>' +
      '</div>'
    );
  }

  /** Build the footer markup. */
  function footerHTML() {
    const sideLinks = NAV_MODEL.links
      .map(function (l) {
        return '<li><a href="' + l.href + '">' + l.label + '</a></li>';
      })
      .join('');
    return (
      '<div class="footer-inner">' +
        '<div class="footer-brand">' +
          '<div class="nav-logo" style="margin-bottom:16px">' +
            '<img class="logo-svg" src="logo.png" alt="Drammen Slalåmklubb logo">' +
            '<div class="wordmark">Drammen <em>Slalåmklubb</em></div>' +
          '</div>' +
          '<p>Drammen Slalåmklubb — alpinsport for barn, unge og voksne i hjertet av Drammen siden 1936.</p>' +
          '<div class="footer-social">' +
            '<a href="https://www.instagram.com/drammenslalomklubb" target="_blank" rel="noopener" class="social-btn" aria-label="Instagram"><svg class="icon" aria-hidden="true" focusable="false"><use href="#icon-camera"/></svg></a>' +
            '<a href="https://www.facebook.com/drammenslalomklubb" target="_blank" rel="noopener" class="social-btn" aria-label="Facebook"><svg class="icon" aria-hidden="true" focusable="false"><use href="#icon-users"/></svg></a>' +
          '</div>' +
        '</div>' +
        '<div class="footer-col">' +
          '<h4>Sider</h4>' +
          '<ul>' + sideLinks + '</ul>' +
        '</div>' +
        '<div class="footer-col">' +
          '<h4>Kontakt</h4>' +
          '<ul>' +
            '<li>Blektjernveien 18</li>' +
            '<li>Postboks 2404, 3003 Drammen</li>' +
            '<li><a href="' + NAV_MODEL.cta.href + '" target="_blank" rel="noopener">Bli Medlem</a></li>' +
          '</ul>' +
        '</div>' +
      '</div>' +
      '<div class="footer-bottom">' +
        '<span>© 2026 Drammen Slalåmklubb.</span>' +
        '<span>Mockup — ikke den offisielle nettsiden.</span>' +
      '</div>'
    );
  }

  /**
   * Determine the current page key.
   * Prefers body[data-page]; falls back to the filename in the path.
   */
  function currentPage(doc) {
    const body = doc.body;
    if (body && body.dataset && body.dataset.page) return body.dataset.page;
    const loc = doc.defaultView && doc.defaultView.location;
    const path = loc ? loc.pathname : '';
    const file = path.split('/').pop() || 'index.html';
    return file.replace(/\.html$/, '') || 'index';
  }

  /** Inject nav + footer, mark active link, wire the hamburger + palette. */
  function init(doc) {
    doc = doc || (typeof document !== 'undefined' ? document : null);
    if (!doc) return;
    const page = currentPage(doc);

    const navMount = doc.getElementById('site-nav');
    if (navMount) navMount.innerHTML = navHTML(page);

    const footerMount = doc.getElementById('site-footer');
    if (footerMount) footerMount.innerHTML = footerHTML();

    wireHamburger(doc);
    wirePaletteSwitcher(doc);
    return loadCms(doc);
  }

  /**
   * One query to Sanity, then render the Topbar message and (where the
   * #events-list mount exists) the upcoming Events. Any failure (rejection,
   * non-OK, malformed data, no fetch) reveals that part's fallback content.
   * Never rejects.
   */
  function loadCms(doc) {
    const win = doc.defaultView;
    const msg = doc.querySelector('.topbar-msg');
    const events = doc.getElementById('events-list');
    function apply(result) {
      const topbar = result && result.topbar;
      if (msg) {
        if (topbar && typeof topbar.text === 'string') renderTopbar(doc, msg, topbar);
        else msg.hidden = false;
      }
      if (events) {
        if (result && Array.isArray(result.events)) renderEvents(doc, events, result.events);
        else events.hidden = false;
      }
    }
    if (!win || typeof win.fetch !== 'function') {
      apply(null);
      return Promise.resolve();
    }
    // Promise.resolve().then so a synchronous throw from fetch also falls back.
    return Promise.resolve()
      .then(function () { return win.fetch(CMS_URL); })
      .then(function (res) {
        if (!res.ok) throw new Error('Sanity HTTP ' + res.status);
        return res.json();
      })
      .then(function (body) { return body && body.result; }, function () { return null; })
      .then(apply);
  }

  /** A new-tab link for an http(s) URL from the CMS; null for anything else. */
  function externalLink(doc, href, text) {
    if (typeof href !== 'string' || !/^https?:\/\//i.test(href)) return null;
    const a = doc.createElement('a');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = text;
    return a;
  }

  /** Replace the fallback with the CMS message. CMS strings go in as text. */
  function renderTopbar(doc, msg, topbar) {
    const icon = msg.querySelector('svg.icon');
    msg.textContent = '';
    if (icon) msg.append(icon, ' ');
    msg.append(externalLink(doc, topbar.link, topbar.text) || topbar.text);
    msg.hidden = topbar.show === false;
  }

  // Chip value → colour class. Must match studio/schemaTypes' CHIPS.
  const CHIP_COLOURS = { 'Renn': 'chip-blue', 'Gratis': 'chip-orange', 'Årsmøte': 'chip-green', 'Medlemmer': 'chip-blue' };
  const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];
  const MONTHS = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
  const WEEKDAYS = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function el(doc, tag, className, text) {
    const e = doc.createElement(tag);
    if (className) e.className = className;
    if (text != null) e.textContent = text;
    return e;
  }

  /**
   * Replace the fallback cards with the next 3 Events dated today or later
   * (visitor's local time), nearest first. CMS strings go in as text.
   */
  function renderEvents(doc, mount, events) {
    const now = new Date();
    const today = now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-' + pad2(now.getDate());
    const upcoming = events
      .filter(function (e) {
        return e && typeof e.title === 'string' &&
          typeof e.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.date) && e.date >= today;
      })
      .sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; })
      .slice(0, 3);
    mount.textContent = '';
    if (!upcoming.length) mount.append(el(doc, 'p', 'events-empty', 'Ingen kommende arrangementer akkurat nå.'));
    upcoming.forEach(function (e) { mount.append(eventCard(doc, e)); });
    mount.hidden = false;
  }

  /** One card, same markup as the hand-written ones in index.html, minus fade-in. */
  function eventCard(doc, e) {
    const parts = e.date.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    let title = e.title + ' — ' + WEEKDAYS[d.getDay()] + ' ' + parts[2] + '. ' + MONTHS[parts[1] - 1] + ' ' + parts[0];
    if (typeof e.startTime === 'string' && e.startTime) title += ' kl. ' + e.startTime;

    const card = el(doc, 'div', 'event-card');
    const date = el(doc, 'div', 'event-date');
    date.append(el(doc, 'div', 'day', pad2(parts[2])), el(doc, 'div', 'month', MONTHS_SHORT[parts[1] - 1]));

    const info = el(doc, 'div', 'event-info');
    if (Array.isArray(e.chips) && e.chips.length) {
      const chips = el(doc, 'div', 'event-chips');
      e.chips.forEach(function (c) {
        if (typeof c === 'string') chips.append(el(doc, 'span', 'event-chip ' + (CHIP_COLOURS[c] || 'chip-blue'), c));
      });
      info.append(chips);
    }
    info.append(el(doc, 'h3', 'event-title', title));

    const text = [e.location, e.description].filter(function (t) { return typeof t === 'string' && t; }).join(' — ');
    const link = externalLink(doc, e.link, 'Mer info →');
    if (text || link) {
      const loc = el(doc, 'div', 'event-location');
      loc.innerHTML = '<svg class="icon" aria-hidden="true" focusable="false"><use href="#icon-pin"/></svg>';
      if (text) loc.append(text);
      if (link) loc.append(link);
      info.append(loc);
    }
    card.append(date, info);
    return card;
  }

  /** Apply the persisted palette and wire the topbar swatches. */
  function wirePaletteSwitcher(doc) {
    const win = doc.defaultView;
    const buttons = doc.querySelectorAll('.palette-switcher button[data-palette]');
    if (!buttons.length) return;

    let saved = 'blue';
    try {
      saved = (win && win.localStorage.getItem(PALETTE_STORAGE_KEY)) || 'blue';
    } catch (_) { /* localStorage may be disabled — fall back to default */ }
    apply(saved);

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const key = btn.getAttribute('data-palette');
        apply(key);
        try {
          if (win) win.localStorage.setItem(PALETTE_STORAGE_KEY, key);
        } catch (_) { /* silent — picker still works in-session */ }
      });
    });

    function apply(key) {
      const known = PALETTES.some(function (p) { return p.key === key; });
      const active = known ? key : 'blue';
      if (active === 'blue') delete doc.body.dataset.palette;
      else doc.body.dataset.palette = active;
      buttons.forEach(function (b) {
        b.setAttribute('aria-pressed',
          b.getAttribute('data-palette') === active ? 'true' : 'false');
      });
    }
  }

  /** Wire the mobile hamburger menu (open/close, aria-expanded, focus, Esc). */
  function wireHamburger(doc) {
    const hamburger = doc.getElementById('hamburger');
    const mobileClose = doc.getElementById('mobileClose');
    const menu = doc.getElementById('mobileMenu');
    if (!hamburger || !mobileClose || !menu) return;

    const FOCUSABLE =
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function openMenu() {
      menu.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      const first = menu.querySelectorAll(FOCUSABLE)[0];
      if (first) setTimeout(function () { first.focus(); }, 50);
    }

    function closeMenu() {
      menu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.focus();
    }

    hamburger.addEventListener('click', openMenu);
    mobileClose.addEventListener('click', closeMenu);

    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
    });

    menu.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      const focusable = Array.prototype.slice.call(menu.querySelectorAll(FOCUSABLE));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (doc.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  return {
    NAV_MODEL: NAV_MODEL,
    PALETTES: PALETTES,
    init: init,
    currentPage: currentPage,
    navHTML: navHTML,
    footerHTML: footerHTML,
    wireHamburger: wireHamburger,
  };
});
