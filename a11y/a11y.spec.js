'use strict';

// Real-browser axe scan of every page (issue 015). JSDOM (npm test) can't see
// colour contrast, focus or landmarks; this can. The site is served from disk
// by route stubbing, Sanity is stubbed, and every other request is aborted,
// so the suite runs offline and never reaches the real Sanity.

const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('node:fs');
const path = require('node:path');
const { NAV_MODEL } = require('../site');

const ROOT = path.join(__dirname, '..');
const ORIGIN = 'http://dsk.test';

const EVENT = {
  title: 'Telenorkarusellen', date: '2099-01-19', startTime: '18:00',
  location: 'Drammen skisenter', description: 'Renn for alle', link: 'https://example.org/renn',
  chips: ['Renn', 'Gratis'],
};
// Two messages, so the rotation's pause button is shown and scanned.
const TOPBAR = { show: true, messages: [{ text: 'Renn på lørdag!', link: 'https://example.org/x' }, { text: 'Åpent for alle' }] };
// Served from logo.png (see open()). Enough of them to scroll at phone width.
const SPONSORS = ['A', 'B', 'C', 'D'].map((n) => ({
  name: `Sponsor ${n}`, url: 'https://example.org/s', logo: `https://cdn.sanity.io/images/p/d/${n}.png`,
}));

// One per colour, so every tag colour's contrast is scanned. Fun runs past
// the lift closing, so the Treningsplan's "Kun Fun" end piece is scanned too.
const TRAINING_GROUPS = [['Grønn', 'Grønn'], ['Blå', 'Blå'], ['Rød', 'Rød'], ['Sort', 'Sort'], ['Fun', 'Orange']].map(([title, colour]) => ({
  title, colour, age: 'U10', place: 'Haukåsløypa', price: '3 500 kr', description: 'Lek og mestring.',
  sessions: [{ day: 'Mandag', from: '18:00', to: title === 'Fun' ? '20:30' : '19:30' }],
}));

const SKI_SCHOOL = {
  intro: 'Lek og mestring.', age: '4–10 år', includes: ['Medlemskap', 'Sesongkort'],
  equipment: 'Eget skiutstyr.', meetup: 'Møt opp 15 minutter før.', reservation: 'Minst 6 deltakere.',
};
const COURSES = [{
  title: 'Helgekurs', signupDeadline: '2999-01-10', startDate: '2999-01-16', endDate: '2999-01-17',
  sessions: [{ day: 'Lørdag', from: '10:00', to: '14:00' }], price: '2 500 kroner',
  link: 'https://example.org/kurs', note: 'Snøforbehold.',
}, {
  // Always in the current week and starting before the lift: scans the
  // Treningsplan's ski-school colour and its "Kun skiskole" piece (issue 026).
  title: 'Skiskole ettermiddag', startDate: '2000-01-01', endDate: '2999-12-31',
  sessions: [{ day: 'Mandag', from: '17:30', to: '19:00' }],
}];
const LIFT_HOURS = { note: 'Stengt i høstferien.', hours: [{ day: 'Mandag', from: '18:00', to: '20:00' }] };
// Featured posts (ticket 033), also served from logo.png.
const FEATURED_POSTS = [1, 2, 3].map((n) => ({
  image: `https://cdn.sanity.io/images/p/d/post${n}.jpg`, alt: `Innlegg ${n}`, link: 'https://example.org/p', order: n,
}));

// Sanity responses per CMS state. A function is a route handler (failure).
const CMS = {
  success: { topbar: TOPBAR, events: [EVENT, { ...EVENT, title: 'Årsmøte', date: '2099-03-01', chips: ['Årsmøte'] }], sponsors: SPONSORS, trainingGroups: TRAINING_GROUPS,
    skiSchool: SKI_SCHOOL, courses: COURSES, liftHours: LIFT_HOURS, featuredPosts: FEATURED_POSTS },
  failure: (route) => route.fulfill({ status: 500, body: '{}' }),
  empty: { topbar: TOPBAR, events: [] },
  'topbar off': { topbar: { ...TOPBAR, show: false }, events: [EVENT] },
};

// Proof each state rendered, so a drifted stub can't quietly scan the fallback.
const RENDERED = {
  success: async (page) => {
    await expect(page.locator('#events-list')).toContainText(EVENT.title);
    await expect(page.locator('.sponsor-strip')).toBeVisible();
    await expect(page.locator('[data-featured-posts] img').first()).toBeVisible();
    await expect(page.locator('#programs-grid .program-age').first()).toBeVisible();
    await expect(page.locator('#schedule .lift-pre').filter({ visible: true })).toHaveText('Kun skiskole 17:30 – 18:00');
    await expect(page.locator('#schedule .session-card.group-skiskole').filter({ visible: true })).toBeVisible();
    await expect(page.locator('#schedule .lift-post').filter({ visible: true })).toHaveText('Kun Fun 20:00 – 20:30');
  },
  failure: (page) => expect(page.locator('.topbar-msg')).toContainText('Sesong'),
  empty: (page) => expect(page.locator('.events-empty')).toBeVisible(),
  'topbar off': (page) => expect(page.locator('.topbar-msg')).toBeHidden(),
};

// axe can't run with scripting disabled, so the no-JS state is served as a
// no-JS browser parses it: scripts dropped, <noscript> contents rendered.
function withoutJs(html) {
  return html.replace(/<script\b[\s\S]*?<\/script>/g, '').replace(/<\/?noscript>/g, '');
}

async function open(page, file, cms = CMS.success, { js = true } = {}) {
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.hostname.endsWith('.api.sanity.io')) {
      return typeof cms === 'function'
        ? cms(route)
        : route.fulfill({ json: { result: cms } });
    }
    if (url.hostname === 'cdn.sanity.io') return route.fulfill({ path: path.join(ROOT, 'logo.png') });
    if (url.origin !== ORIGIN) return route.abort(); // fonts etc.: stay offline
    const diskPath = path.join(ROOT, url.pathname);
    if (!js && diskPath.endsWith('.html')) {
      return route.fulfill({ contentType: 'text/html', body: withoutJs(fs.readFileSync(diskPath, 'utf8')) });
    }
    return route.fulfill({ path: diskPath });
  });
  await page.goto(`${ORIGIN}/${file}`);
  await page.waitForLoadState('networkidle'); // the stubbed CMS answer has rendered
  // Below-the-fold content fades in on scroll; reveal it so axe can check it.
  // No transition: its delay outlasts reducedMotion and axe would see it mid-fade.
  if (js) {
    await page.evaluate(() => document.querySelectorAll('.fade-in').forEach((e) => {
      e.style.transition = 'none';
      e.classList.add('visible');
    }));
  }
}

// Known violations, each scoped to one rule and a selector. Remove an entry once fixed.
const KNOWN = [];

async function expectNoViolations(page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const found = [];
  for (const v of violations) {
    const known = KNOWN.filter((k) => k.rule === v.id).map((k) => k.selector);
    for (const n of v.nodes) {
      const target = n.target.join(' ');
      const isKnown = known.length && await page.evaluate(
        ([t, sels]) => sels.some((s) => document.querySelector(t).matches(s)), [target, known]);
      // axe's own message: for contrast, the ratio and colours.
      if (!isKnown) found.push(`${v.id}: ${target} :: ${[...n.any, ...n.all][0]?.message}`);
    }
  }
  expect(found).toEqual([]);
}

for (const { href } of NAV_MODEL.links) {
  test(href, async ({ page }) => {
    await open(page, href);
    await expect(page.locator('.topbar-pause')).toBeVisible();
    if (href === 'treningsopplegg.html') await expect(page.locator('#rod .training-session')).toBeVisible();
    if (href === 'skiskole.html') await expect(page.locator('#courses .course-note')).toHaveText('Snøforbehold.');
    await expectNoViolations(page);
  });

  test(`${href} with the mobile menu open`, async ({ page }, { project }) => {
    test.skip(project.name !== 'phone', 'the hamburger only shows at phone width');
    await open(page, href);
    await page.click('#hamburger');
    await expect(page.locator('#mobileMenu')).toBeVisible();
    await expectNoViolations(page);
  });

  test(`${href} with JavaScript disabled (<noscript> fallback)`, async ({ page }) => {
    await open(page, href, CMS.success, { js: false });
    await expect(page.locator('.nav-fallback')).toBeVisible();
    if (href === 'index.html') await expect(page.locator('#events-list .event-card').first()).toBeVisible();
    if (href === 'treningsopplegg.html') await expect(page.locator('#sort')).toBeVisible();
    await expectNoViolations(page);
  });
}

for (const [state, cms] of Object.entries(CMS)) {
  test(`index.html, CMS ${state}`, async ({ page }) => {
    await open(page, 'index.html', cms);
    await expect(page.locator('#events-list')).toBeVisible();
    await RENDERED[state](page);
    await expectNoViolations(page);
  });
}
