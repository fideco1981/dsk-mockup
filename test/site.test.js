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

test('palette switcher renders three swatches (blue/red/green) in the topbar', () => {
  const doc = makeDoc('index');
  site.init(doc);
  const buttons = doc.querySelectorAll('.palette-switcher button[data-palette]');
  const palettes = [...buttons].map((b) => b.getAttribute('data-palette'));
  assert.deepEqual(palettes, ['blue', 'red', 'green']);
});

test('palette switcher click sets body[data-palette] and updates aria-pressed', () => {
  const doc = makeDoc('index');
  site.init(doc);
  const red = doc.querySelector('.palette-switcher button[data-palette="red"]');
  assert.ok(red, 'red swatch button exists');
  red.dispatchEvent(new doc.defaultView.Event('click'));
  assert.equal(doc.body.dataset.palette, 'red');
  assert.equal(red.getAttribute('aria-pressed'), 'true');
  // Only one swatch can claim aria-pressed=true at a time.
  const pressed = [...doc.querySelectorAll('.palette-switcher button[aria-pressed="true"]')];
  assert.equal(pressed.length, 1);
});

test('palette switcher persists choice across page loads via localStorage', () => {
  const doc1 = makeDoc('index');
  site.init(doc1);
  doc1
    .querySelector('.palette-switcher button[data-palette="green"]')
    .dispatchEvent(new doc1.defaultView.Event('click'));

  // Simulate navigation: a fresh document on a different page, same localStorage.
  // JSDOM gives each window its own localStorage — copy the saved value across.
  const saved = doc1.defaultView.localStorage.getItem('dsk-palette');
  assert.equal(saved, 'green', 'choice written to localStorage');

  const doc2 = makeDoc('styret');
  doc2.defaultView.localStorage.setItem('dsk-palette', saved);
  site.init(doc2);
  assert.equal(doc2.body.dataset.palette, 'green', 'restored on next page load');
  assert.equal(
    doc2.querySelector('.palette-switcher button[data-palette="green"]')
      .getAttribute('aria-pressed'),
    'true',
  );
});

test('styles.css declares palette overrides for red and green', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const css = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
  const red = css.match(/body\[data-palette\s*=\s*"red"\]\s*\{([^}]+)\}/);
  const green = css.match(/body\[data-palette\s*=\s*"green"\]\s*\{([^}]+)\}/);
  assert.ok(red, 'red palette block must exist');
  assert.ok(green, 'green palette block must exist');
  assert.match(red[1], /--blue:\s*#/, 'red palette must override --blue');
  assert.match(green[1], /--blue:\s*#/, 'green palette must override --blue');
});
