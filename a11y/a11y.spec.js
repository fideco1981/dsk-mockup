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

// Sanity responses per CMS state. A function is a route handler (failure).
const CMS = {
  success: { topbar: TOPBAR, events: [EVENT, { ...EVENT, title: 'Årsmøte', date: '2099-03-01', chips: ['Årsmøte'] }], sponsors: SPONSORS },
  failure: (route) => route.fulfill({ status: 500, body: '{}' }),
  empty: { topbar: TOPBAR, events: [] },
  'topbar off': { topbar: { ...TOPBAR, show: false }, events: [EVENT] },
};

// Proof each state rendered, so a drifted stub can't quietly scan the fallback.
const RENDERED = {
  success: async (page) => {
    await expect(page.locator('#events-list')).toContainText(EVENT.title);
    await expect(page.locator('.sponsor-strip')).toBeVisible();
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
