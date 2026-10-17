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
 *   - load the Topbar message, landing-page Events, the footer's Sponsor
 *     strip, the Training groups, the Ski school, Courses and Lift hours from
 *     Sanity (test/cms.test.js, test/treningsopplegg.test.js,
 *     test/skiskole.test.js, test/lift-hours.test.js); init(doc)
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
    '{"topbar": *[_type == "topbarMessage"][0]{show, messages[]{text, link}},' +
    ' "events": *[_type == "event"]{title, date, startTime, location, description, link, chips},' +
    ' "sponsors": *[_type == "sponsor"] | order(order asc){name, url, "logo": logo.asset->url},' +
    ' "trainingGroups": *[_type == "trainingGroup"] | order(order asc){title, colour, age, place, price, description, sessions[]{day, from, to}},' +
    ' "skiSchool": *[_type == "skiSchool"][0]{intro, age, includes, equipment, meetup, reservation},' +
    ' "courses": *[_type == "course"]{title, signupDeadline, startDate, endDate, sessions[]{day, from, to}, price, link, note},' +
    ' "liftHours": *[_type == "liftHours"][0]{note, hours[]{day, from, to}}}';
  const SPOND_COURSES_URL = 'https://club.spond.com/landing/courses/drammensk';
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
        // Shown only when there are several messages to rotate (WCAG 2.2.2).
        '<button type="button" class="topbar-pause" aria-label="Pause meldingene" aria-pressed="false" hidden>' +
          '<svg class="icon icon-pause" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>' +
          '<svg class="icon icon-play" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l12-7z"/></svg>' +
        '</button>' +
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
      // Hidden until the CMS answers; no fallback copy (ADR 0002).
      '<div class="sponsor-strip" hidden>' +
        '<h4>Takk til våre sponsorer</h4>' +
        '<div class="sponsor-viewport"><div class="sponsor-track"></div></div>' +
      '</div>' +
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

  /** Inject nav + footer, mark active link, wire the hamburger. */
  function init(doc) {
    doc = doc || (typeof document !== 'undefined' ? document : null);
    if (!doc) return;
    const page = currentPage(doc);

    const navMount = doc.getElementById('site-nav');
    if (navMount) navMount.innerHTML = navHTML(page);

    const footerMount = doc.getElementById('site-footer');
    if (footerMount) footerMount.innerHTML = footerHTML();

    wireHamburger(doc);
    return loadCms(doc);
  }

  /**
   * One query to Sanity, then render the Topbar message, the Sponsor strip
   * and, where their mounts exist, the upcoming Events and Training groups
   * (sections on treningsopplegg.html, cards on the landing page), the
   * Ski school with its Courses (skiskole.html) and the Lift hours. Any failure
   * (rejection, non-OK, malformed data, no fetch) reveals that part's fallback.
   * Never rejects.
   */
  function loadCms(doc) {
    const win = doc.defaultView;
    const msg = doc.querySelector('.topbar-msg');
    const events = doc.getElementById('events-list');
    const sponsors = doc.querySelector('.sponsor-strip');
    const groups = doc.getElementById('training-groups');
    const groupNav = doc.getElementById('training-nav');
    const groupCount = doc.querySelector('.training-quick-nav .section-title');
    const programs = doc.getElementById('programs-grid');
    const coursesMount = doc.getElementById('courses');
    const schoolMount = doc.getElementById('ski-school');
    const liftMounts = doc.querySelectorAll('[data-lift-hours], [data-lift-note], .lift-header[data-day]');
    function apply(result) {
      const topbar = result && result.topbar;
      const messages = topbar && Array.isArray(topbar.messages)
        ? topbar.messages.filter(function (m) { return m && typeof m.text === 'string' && m.text; })
        : [];
      if (msg) {
        if (messages.length) renderTopbar(doc, msg, topbar, messages);
        else msg.hidden = false;
      }
      if (events) {
        if (result && Array.isArray(result.events)) renderEvents(doc, events, result.events);
        else events.hidden = false;
      }
      if (sponsors && result && Array.isArray(result.sponsors)) renderSponsors(doc, sponsors, result.sponsors);
      const trainingGroups = validGroups(result && result.trainingGroups);
      if (groups && groupNav) renderTrainingGroups(doc, groups, groupNav, groupCount, trainingGroups);
      if (programs) renderProgramCards(doc, programs, trainingGroups);
      if (coursesMount && schoolMount) renderSkiSchool(doc, schoolMount, coursesMount, result && result.skiSchool, result && result.courses);
      const lift = result && result.liftHours;
      if (lift && typeof lift === 'object') renderLiftHours(liftMounts, lift);
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

  /**
   * Replace the fallback with the CMS messages, rotating when there are
   * several. CMS strings go in as text.
   */
  function renderTopbar(doc, msg, topbar, messages) {
    const icon = msg.querySelector('svg.icon');
    function show(m) {
      msg.textContent = '';
      if (icon) msg.append(icon, ' ');
      msg.append(externalLink(doc, m.link, m.text) || m.text);
    }
    show(messages[0]);
    msg.hidden = topbar.show === false;
    if (!msg.hidden && messages.length > 1) rotateTopbar(doc, msg, messages, show);
  }

  const TOPBAR_INTERVAL = 5000; // ms per message
  const TOPBAR_FADE = 500;      // ms, matches the .topbar-msg transition

  /**
   * Show the next message every TOPBAR_INTERVAL, fading between them. Paused
   * while the bar is hovered or holds focus, or by the pause button. Not a
   * live region: screen readers aren't interrupted on every change.
   */
  function rotateTopbar(doc, msg, messages, show) {
    const win = doc.defaultView;
    const bar = msg.parentNode;
    const pause = bar.querySelector('.topbar-pause');
    let i = 0;
    let hover = false;
    let focus = false;
    pause.hidden = false;
    pause.addEventListener('click', function () {
      pause.setAttribute('aria-pressed', pause.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    });
    bar.addEventListener('mouseenter', function () { hover = true; });
    bar.addEventListener('mouseleave', function () { hover = false; });
    bar.addEventListener('focusin', function () { focus = true; });
    bar.addEventListener('focusout', function (e) { focus = bar.contains(e.relatedTarget); });
    win.setInterval(function () {
      if (hover || focus || pause.getAttribute('aria-pressed') === 'true') return;
      msg.classList.add('fade-out');
      win.setTimeout(function () {
        i = (i + 1) % messages.length;
        show(messages[i]);
        msg.classList.remove('fade-out');
      }, TOPBAR_FADE);
    }, TOPBAR_INTERVAL);
  }

  // Chip value → colour class. Must match studio/schemaTypes' CHIPS.
  const CHIP_COLOURS = { 'Renn': 'chip-blue', 'Gratis': 'chip-orange', 'Årsmøte': 'chip-green', 'Medlemmer': 'chip-blue' };
  const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];
  const MONTHS = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
  const WEEKDAYS = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  /** Today as YYYY-MM-DD in the visitor's local time. */
  function todayISO() {
    const now = new Date();
    return now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-' + pad2(now.getDate());
  }

  function isISODate(d) { return typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d); }

  /** Ascending string order, for sort callbacks. */
  function compareStr(a, b) { return a < b ? -1 : a > b ? 1 : 0; }

  /** "2027-01-05" → "5. januar 2027" (or "5. januar" without the year). */
  function longDate(iso, withYear) {
    const p = iso.split('-').map(Number);
    return p[2] + '. ' + MONTHS[p[1] - 1] + (withYear === false ? '' : ' ' + p[0]);
  }

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
    const today = todayISO();
    const upcoming = events
      .filter(function (e) {
        return e && typeof e.title === 'string' &&
          isISODate(e.date) && e.date >= today;
      })
      .sort(function (a, b) { return compareStr(a.date, b.date); })
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

  // Training group colour → class. Must match studio/schemaTypes' GROUP_COLOURS and styles.css.
  const GROUP_CLASSES = { 'Grønn': 'group-gronn', 'Blå': 'group-bla', 'Rød': 'group-rod', 'Sort': 'group-sort', 'Orange': 'group-orange' };
  const DAYS = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];
  const COUNTS = ['', 'Én gruppe', 'To grupper', 'Tre grupper', 'Fire grupper', 'Fem grupper', 'Seks grupper',
    'Sju grupper', 'Åtte grupper', 'Ni grupper', 'Ti grupper'];

  /** Section anchor from a title: "Grønn" → "gronn", "Blå" → "bla". */
  function slug(title) {
    return title.toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function isText(t) { return typeof t === 'string' && t !== ''; }

  /** A facts-list line: decorative icon plus text, optionally with a bold label. */
  function factLine(doc, icon, label, text, className) {
    const li = el(doc, 'li', className);
    li.innerHTML = '<svg class="icon" aria-hidden="true" focusable="false"><use href="#icon-' + icon + '"/></svg>';
    const span = el(doc, 'span');
    if (label) span.append(el(doc, 'strong', null, label), ' ');
    span.append(text);
    li.append(span);
    return li;
  }

  /** One facts line per valid session, sorted Monday→Sunday: "Mandag 18:00–19:30". */
  function sessionLines(doc, sessions, className) {
    return (Array.isArray(sessions) ? sessions : [])
      .filter(function (s) { return s && DAYS.indexOf(s.day) >= 0 && isText(s.from) && isText(s.to); })
      .sort(function (a, b) { return DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || compareStr(a.from, b.from); })
      .map(function (s) { return factLine(doc, 'clock', null, s.day + ' ' + s.from + '–' + s.to, className); });
  }

  /** Training groups from the CMS that can be shown (title with a usable slug), in CMS order. */
  function validGroups(groups) {
    return Array.isArray(groups)
      ? groups.filter(function (g) { return g && isText(g.title) && slug(g.title); })
      : [];
  }

  function groupClass(g) { return GROUP_CLASSES[g.colour] || 'group-bla'; }

  /**
   * Replace the landing page's fallback cards with one card per Training
   * group, linking to its section. With none valid, reveal the fallback.
   * CMS strings go in as text.
   */
  function renderProgramCards(doc, mount, groups) {
    if (groups.length) {
      mount.textContent = '';
      groups.forEach(function (g) {
        const body = el(doc, 'div', 'program-card-body');
        if (isText(g.age)) body.append(el(doc, 'span', 'program-age', g.age));
        body.append(el(doc, 'h3', 'program-name', g.title));
        if (isText(g.description)) body.append(el(doc, 'p', 'program-desc', g.description));
        const link = el(doc, 'a', 'program-link', 'Les mer →');
        link.href = 'treningsopplegg.html#' + slug(g.title);
        link.setAttribute('aria-label', 'Les mer om ' + g.title);
        body.append(link);
        const card = el(doc, 'div', 'program-card ' + groupClass(g));
        card.append(el(doc, 'div', 'program-card-top-border'), el(doc, 'div', 'program-card-art'), body);
        mount.append(card);
      });
    }
    mount.hidden = false;
  }

  /**
   * Replace the fallback quick-nav cards and group sections with Training
   * groups (in CMS order). With none valid, or on failure, reveal the
   * fallback as-is. CMS strings go in as text.
   */
  function renderTrainingGroups(doc, mount, nav, count, valid) {
    if (valid.length) {
      mount.textContent = '';
      nav.textContent = '';
      valid.forEach(function (g, i) {
        const id = slug(g.title);
        const colour = groupClass(g);

        const card = el(doc, 'a', 'quick-nav-card ' + colour);
        card.href = '#' + id;
        if (isText(g.age)) card.append(el(doc, 'span', 'quick-nav-age', g.age));
        card.append(el(doc, 'span', 'quick-nav-name', g.title));
        card.insertAdjacentHTML('beforeend', '<svg class="icon quick-nav-arrow" aria-hidden="true" focusable="false"><use href="#icon-arrow-down"/></svg>');
        const li = el(doc, 'li');
        li.append(card);
        nav.append(li);

        const header = el(doc, 'div', 'section-header');
        if (isText(g.age)) header.append(el(doc, 'div', 'training-tag', g.age));
        header.append(el(doc, 'h2', 'section-title', g.title));
        if (isText(g.description)) header.append(el(doc, 'p', 'section-sub', g.description));
        const inner = el(doc, 'div', 'section-inner');
        inner.append(header);

        const facts = el(doc, 'ul', 'course-facts training-facts');
        facts.append.apply(facts, sessionLines(doc, g.sessions, 'training-session'));
        if (isText(g.place)) facts.append(factLine(doc, 'pin', 'Sted:', g.place));
        if (isText(g.price)) facts.append(factLine(doc, 'tag', 'Pris:', g.price));
        if (facts.children.length) inner.append(facts);

        const section = el(doc, 'section', 'training-group ' + colour + (i % 2 ? '' : ' training-group-alt'));
        section.id = id;
        section.append(inner);
        mount.append(section);
      });
      if (count) count.textContent = COUNTS[valid.length] || valid.length + ' grupper';
    }
    mount.hidden = false;
    nav.hidden = false;
  }

  /**
   * Fill the Lift hours mounts from the CMS: the compact week
   * ("Man–Tor 18:00–20:00 · Fre stengt · …"), the per-day lift labels on the
   * landing page and the note. A day without an entry is closed. Called only
   * when the singleton exists, so failure keeps the HTML. CMS strings go in as text.
   */
  function renderLiftHours(mounts, lift) {
    const byDay = {};
    (Array.isArray(lift.hours) ? lift.hours : []).forEach(function (s) {
      if (s && DAYS.indexOf(s.day) >= 0 && isText(s.from) && isText(s.to) && !byDay[s.day]) byDay[s.day] = s.from + '–' + s.to;
    });
    const runs = [];
    DAYS.forEach(function (d) {
      const hours = byDay[d] || 'stengt';
      const last = runs[runs.length - 1];
      if (last && last.hours === hours) last.to = d;
      else runs.push({ from: d, to: d, hours: hours });
    });
    const short = function (d) { return d.slice(0, 3); };
    const week = runs.map(function (r) {
      return short(r.from) + (r.to === r.from ? '' : '–' + short(r.to)) + ' ' + r.hours;
    }).join(' · ');
    mounts.forEach(function (m) {
      if (m.hasAttribute('data-lift-hours')) m.textContent = week;
      else if (m.hasAttribute('data-lift-note')) {
        if (isText(lift.note)) m.textContent = lift.note;
        else m.parentNode.hidden = true;
      } else {
        const hours = byDay[m.dataset.day];
        const icon = m.querySelector('svg');
        m.textContent = '';
        if (icon) m.append(icon);
        m.append(hours ? 'Heis ' + hours.replace('–', ' – ') : 'Heis stengt');
        m.parentNode.classList.toggle('lift-closed', !hours);
      }
    });
  }

  /** An info card with a decorative icon, a heading and a body element. */
  function infoCard(doc, icon, heading, body) {
    const card = el(doc, 'div', 'info-card');
    card.innerHTML = '<div class="info-icon" aria-hidden="true"><svg class="icon" focusable="false"><use href="#icon-' + icon + '"/></svg></div>';
    card.append(el(doc, 'h3', null, heading), body);
    return card;
  }

  /**
   * Replace the fallback Ski school text and course cards with the CMS ones.
   * Without a Ski school (failure or not entered yet), reveal the fallback
   * as-is. Courses whose endDate has passed are left out; none left gives a
   * short message. CMS strings go in as text.
   */
  function renderSkiSchool(doc, schoolMount, coursesMount, school, courseList) {
    const sub = schoolMount.querySelector('.section-sub');
    const grid = schoolMount.querySelector('.info-grid');
    // Missing markup degrades to the fallback rather than throwing with the section hidden.
    if (school && typeof school === 'object' && sub && grid) {
      if (isText(school.intro)) sub.textContent = school.intro;
      else sub.remove();
      grid.textContent = '';
      if (isText(school.age)) grid.append(infoCard(doc, 'users', 'Alder', el(doc, 'p', null, school.age)));
      const includes = (Array.isArray(school.includes) ? school.includes : []).filter(isText);
      if (includes.length) {
        const ul = el(doc, 'ul');
        includes.forEach(function (t) { ul.append(el(doc, 'li', null, t)); });
        grid.append(infoCard(doc, 'check', 'Kursavgiften inkluderer', ul));
      }
      if (isText(school.equipment)) grid.append(infoCard(doc, 'snowflake', 'Utstyr', el(doc, 'p', null, school.equipment)));
      if (isText(school.meetup)) grid.append(infoCard(doc, 'clock', 'Oppmøte', el(doc, 'p', null, school.meetup)));
      if (isText(school.reservation)) grid.append(infoCard(doc, 'info', 'Forbehold', el(doc, 'p', null, school.reservation)));
      renderCourses(doc, coursesMount, courseList);
    }
    schoolMount.hidden = false;
    coursesMount.hidden = false;
  }

  /** Courses that haven't ended, by startDate; with none, a pointer to Spond. */
  function renderCourses(doc, mount, list) {
    const today = todayISO();
    const upcoming = (Array.isArray(list) ? list : [])
      .filter(function (c) {
        return c && isText(c.title) && isISODate(c.startDate) && isISODate(c.endDate) && c.endDate >= today;
      })
      .sort(function (a, b) { return compareStr(a.startDate, b.startDate); });
    mount.textContent = '';
    if (!upcoming.length) {
      const p = el(doc, 'p', 'courses-empty', 'Ingen kurs akkurat nå — ');
      p.append(externalLink(doc, SPOND_COURSES_URL, 'følg med på Spond'));
      mount.append(p);
    }
    upcoming.forEach(function (c) { mount.append(courseCard(doc, c)); });
  }

  /** One course card, same markup as the fallback cards in skiskole.html. */
  function courseCard(doc, c) {
    const card = el(doc, 'article', 'course-card');
    card.append(el(doc, 'h3', 'course-title', c.title));
    const facts = el(doc, 'ul', 'course-facts');
    const sameYear = c.startDate.slice(0, 4) === c.endDate.slice(0, 4);
    facts.append(factLine(doc, 'calendar', 'Periode:', longDate(c.startDate, !sameYear) + ' – ' + longDate(c.endDate)));
    if (isISODate(c.signupDeadline)) facts.append(factLine(doc, 'info', 'Påmeldingsfrist:', longDate(c.signupDeadline)));
    facts.append.apply(facts, sessionLines(doc, c.sessions, 'course-session'));
    if (isText(c.price)) facts.append(factLine(doc, 'tag', 'Pris:', c.price));
    card.append(facts);
    if (isText(c.note)) card.append(el(doc, 'p', 'course-note', c.note));
    const link = externalLink(doc, c.link, 'Meld på →');
    if (link) {
      link.className = 'btn-primary course-cta';
      link.setAttribute('aria-label', 'Meld på ' + c.title);
      card.append(link);
    }
    return card;
  }

  const SPONSOR_SPEED = 40; // marquee px per second, whatever the logo count

  /**
   * Fill the footer strip with Sponsor logos (in CMS order) and show it if any
   * are valid. Stays hidden on failure or an empty list. CMS strings go in as text.
   */
  function renderSponsors(doc, strip, sponsors) {
    const set = el(doc, 'ul', 'sponsor-set');
    sponsors.forEach(function (s) {
      if (!s || typeof s.name !== 'string' || typeof s.logo !== 'string' || !/^https:\/\//i.test(s.logo)) return;
      const img = el(doc, 'img');
      img.src = s.logo + '?h=128&auto=format'; // 2x the 64px CSS height
      img.alt = s.name;
      img.addEventListener('load', function () { layoutSponsors(strip); });
      const a = externalLink(doc, s.url, '');
      if (a) a.append(img);
      const li = el(doc, 'li', 'sponsor-card');
      li.append(a || img);
      set.append(li);
    });
    if (!set.children.length) return;
    const track = strip.querySelector('.sponsor-track');
    track.textContent = '';
    track.append(set);
    strip.hidden = false;
    layoutSponsors(strip);
    if (doc.defaultView) doc.defaultView.addEventListener('resize', function () { layoutSponsors(strip); });
  }

  /**
   * Static centred row when the logos fit; otherwise a seamless marquee: the
   * set plus one copy, animated by -50%. The copy is hidden from screen
   * readers and Tab so each sponsor is announced and focused once.
   */
  function layoutSponsors(strip) {
    const track = strip.querySelector('.sponsor-track');
    const set = track.firstElementChild;
    while (track.children.length > 1) track.lastElementChild.remove();
    strip.classList.remove('is-scrolling');
    const width = set.offsetWidth;
    if (!width || width <= strip.querySelector('.sponsor-viewport').clientWidth) return;
    const copy = set.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.querySelectorAll('a').forEach(function (a) { a.tabIndex = -1; });
    track.append(copy);
    strip.classList.add('is-scrolling');
    track.style.setProperty('--sponsor-duration', (width / SPONSOR_SPEED) + 's');
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
    init: init,
    currentPage: currentPage,
    navHTML: navHTML,
    footerHTML: footerHTML,
    wireHamburger: wireHamburger,
  };
});
