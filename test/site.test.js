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
