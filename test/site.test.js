'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { makeDoc } = require('./helpers');
const site = require('../site');

test('init injects the nav with every link from the nav model', () => {
  const doc = makeDoc('index');
  site.init(doc);

  const labels = [...doc.querySelectorAll('#nav .nav-links a')].map((a) =>
    a.textContent.trim(),
  );
  assert.deepEqual(labels, [
    'Hjem',
    'Skiskole',
    'Treningsopplegg',
    'Om oss',
    'Styret',
    'Kontakt',
  ]);
});

test('the current page link is marked active (aria-current + .active)', () => {
  const doc = makeDoc('styret');
  site.init(doc);

  const active = doc.querySelectorAll('#nav .nav-links a.active');
  assert.equal(active.length, 1, 'exactly one active link');
  assert.equal(active[0].textContent.trim(), 'Styret');
  assert.equal(active[0].getAttribute('aria-current'), 'page');

  // No other link claims to be current.
  const currents = doc.querySelectorAll('#nav .nav-links a[aria-current]');
  assert.equal(currents.length, 1);
});

test('init injects the footer with the site links', () => {
  const doc = makeDoc('index');
  site.init(doc);

  const footer = doc.getElementById('site-footer');
  const labels = [...footer.querySelectorAll('.footer-col a')].map((a) =>
    a.textContent.trim(),
  );
  assert.ok(labels.includes('Kontakt'), 'footer lists Kontakt');
  assert.ok(labels.includes('Styret'), 'footer lists Styret');
});

test('footer has Instagram, Facebook and TikTok buttons with brand icons', () => {
  const doc = makeDoc('index');
  site.init(doc);

  const btns = [...doc.querySelectorAll('#site-footer .social-btn')];
  assert.deepEqual(
    btns.map((a) => a.getAttribute('aria-label')),
    ['Instagram', 'Facebook', 'TikTok'],
  );
  const tiktok = btns[2];
  assert.equal(tiktok.getAttribute('href'), 'https://www.tiktok.com/@drammen_slalomklubb');
  for (const a of btns) {
    const svg = a.querySelector('svg');
    assert.equal(svg.getAttribute('aria-hidden'), 'true');
    const icon = svg.querySelector('use').getAttribute('href');
    assert.equal(icon, '#icon-' + a.getAttribute('aria-label').toLowerCase());
  }
});

test('every page sprite carries the brand icons and resolves every icon it uses', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const { JSDOM } = require('jsdom');
  for (const { href } of site.NAV_MODEL.links) {
    const html = fs.readFileSync(path.join(__dirname, '..', href), 'utf8');
    const doc = new JSDOM(html).window.document;
    site.init(doc);
    const ids = new Set([...doc.querySelectorAll('symbol')].map((s) => s.id));
    for (const id of ['icon-instagram', 'icon-facebook', 'icon-tiktok']) {
      assert.ok(ids.has(id), `${href} sprite has #${id}`);
    }
    for (const use of doc.querySelectorAll('use')) {
      const ref = use.getAttribute('href');
      assert.ok(ids.has(ref.slice(1)), `${href} resolves ${ref}`);
    }
  }
});

test('clicking the hamburger toggles the menu open and aria-expanded', () => {
  const doc = makeDoc('index');
  site.init(doc);

  const hamburger = doc.getElementById('hamburger');
  const menu = doc.getElementById('mobileMenu');
  assert.equal(hamburger.getAttribute('aria-expanded'), 'false');
  assert.ok(!menu.classList.contains('open'));

  hamburger.dispatchEvent(new doc.defaultView.Event('click'));
  assert.equal(hamburger.getAttribute('aria-expanded'), 'true');
  assert.ok(menu.classList.contains('open'));

  doc.getElementById('mobileClose').dispatchEvent(new doc.defaultView.Event('click'));
  assert.equal(hamburger.getAttribute('aria-expanded'), 'false');
  assert.ok(!menu.classList.contains('open'));
});

test('init is robust when mount points are absent', () => {
  const { JSDOM } = require('jsdom');
  const doc = new JSDOM('<!DOCTYPE html><body data-page="index"></body>').window
    .document;
  assert.doesNotThrow(() => site.init(doc));
});

test('currentPage falls back to the location filename without data-page', () => {
  const { JSDOM } = require('jsdom');
  const doc = new JSDOM('<!DOCTYPE html><body></body>', {
    url: 'https://example.com/dsk-mockup/kontakt.html',
  }).window.document;
  assert.equal(site.currentPage(doc), 'kontakt');
});

test('mobile-menu .btn-primary is sized down so it does not dominate the open menu', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const css = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
  const rule = css.match(/\.mobile-menu\s+\.btn-primary\s*\{([^}]+)\}/);
  assert.ok(
    rule,
    '.mobile-menu .btn-primary rule must exist — without it, the .mobile-menu a (0,1,1) ' +
      'selector beats .btn-primary (0,1,0) and the CTA renders at 28px/700 weight, ' +
      'dominating the open menu',
  );
  assert.match(rule[1], /font-size:\s*(1[4-9]|20)px/, 'CTA font-size must stay <= 20px');
  assert.match(rule[1], /font-weight:\s*[56]00/, 'CTA font-weight must be 500 or 600');
});

test('mobile-menu allows scrolling when content overflows the viewport', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const css = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
  const rule = css.match(/\.mobile-menu\s*\{([^}]+)\}/);
  assert.ok(rule, '.mobile-menu base rule must exist');
  assert.match(
    rule[1],
    /overflow-y:\s*auto/,
    'mobile-menu must allow vertical scroll so links + CTA stay reachable on short viewports (landscape phones)',
  );
});

test('mobile-menu .nav-links stays visible (un-hides from the global mobile rule)', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const css = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
  const rule = css.match(/\.mobile-menu\s+\.nav-links\s*\{([^}]+)\}/);
  assert.ok(
    rule,
    '.mobile-menu .nav-links rule must exist — at <=768px, `.nav-links, .btn-nav { display: none; }` ' +
      'hides EVERY .nav-links element including the one inside the open mobile menu, ' +
      'leaving the menu showing only the CTA. Higher-specificity rule restores it.',
  );
  assert.match(
    rule[1],
    /display:\s*flex/,
    'mobile-menu .nav-links must use display: flex (column) so links render in the open menu',
  );
});

