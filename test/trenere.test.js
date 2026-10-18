'use strict';

// Integration test for trenere.html (ticket 037). Loads the real HTML file,
// runs site.js against it with Sanity stubbed, and asserts the trainers render
// from the CMS, with contact details only with consent (ADR 0004).

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const site = require('../site');
const { stubFetch } = require('./helpers');

const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'trenere.html'), 'utf8');

/** Load trenere.html with Sanity stubbed to `respond`, and wait for init. */
async function renderWithCms(respond) {
  const doc = new JSDOM(HTML, { url: 'https://example.com/' }).window.document;
  stubFetch(doc, respond);
  await site.init(doc);
  return doc;
}

test('trenere: the menu has Trenere after Treningsopplegg on every page, active only on Trenere', () => {
  for (const { href } of site.NAV_MODEL.links) {
    const doc = new JSDOM(fs.readFileSync(path.join(ROOT, href), 'utf8')).window.document;
    site.init(doc);
    const links = [...doc.querySelectorAll('#nav .nav-links a')];
    const labels = links.map((a) => a.textContent.trim());
    assert.equal(labels[labels.indexOf('Treningsopplegg') + 1], 'Trenere', href);
    const active = links.filter((a) => a.classList.contains('active')).map((a) => a.textContent.trim());
    assert.equal(active[0] === 'Trenere', href === 'trenere.html', href);
  }
});

// A CMS trainers fixture in Studio order (made-up people).
const TRAINERS = [
  { name: 'Kari Nordmann', role: 'Hovedtrener', presentation: 'Har trent barn i ti år.', merits: ['Trener 2 alpint', 'NM-gull storslalåm 2010'] },
  { name: 'Ola', presentation: 'Instruktør i skiskolen.', merits: ['Trener 1 alpint'] },
  { name: 'Per Olav Hansen', role: 'Assistenttrener', presentation: 'Tidligere rennløper.', merits: ['Trener 1 alpint'] },
];

/** The trainer grid: null when hidden, else [{ initials, name, role, presentation, merits }]. */
function cards(doc) {
  const grid = doc.querySelector('[data-trainers-grid]');
  if (grid.hidden) return null;
  const text = (c, sel) => { const n = c.querySelector(sel); return n ? n.textContent : null; };
  return [...grid.querySelectorAll('.board-card')].map((c) => ({
    initials: text(c, '.board-avatar'),
    name: text(c, '.board-name'),
    role: text(c, '.board-role'),
    presentation: text(c, '.trainer-presentation'),
    merits: c.querySelector('.trainer-merits') && [...c.querySelectorAll('.trainer-merits li')].map((li) => li.textContent),
  }));
}

test('trenere: trainers render in Studio order with name, role, presentation and merits', async () => {
  const doc = await renderWithCms({ trainers: [...TRAINERS, { role: 'Uten navn' }, { name: 42 }, null] });
  assert.deepEqual(cards(doc), [
    { initials: 'KN', name: 'Kari Nordmann', role: 'Hovedtrener', presentation: TRAINERS[0].presentation, merits: TRAINERS[0].merits },
    { initials: 'O', name: 'Ola', role: null, presentation: TRAINERS[1].presentation, merits: TRAINERS[1].merits },
    { initials: 'PH', name: 'Per Olav Hansen', role: 'Assistenttrener', presentation: TRAINERS[2].presentation, merits: TRAINERS[2].merits },
  ]);
});

test('trenere: a trainer without merits gets no merits list', async () => {
  const doc = await renderWithCms({ trainers: [{ ...TRAINERS[0], merits: [] }, { ...TRAINERS[1], merits: undefined }] });
  assert.deepEqual(cards(doc).map((c) => c.merits), [null, null]);
  assert.equal(doc.querySelector('.trainer-merits'), null);
});

// Contact details with consent (ADR 0004), as on Styret. Fake values only.
const PHONE = '+47 000 00 000';
const EMAIL = 'kari@example.no';
const contacts = (doc) => [...doc.querySelectorAll('[data-trainers-grid] .board-card')].map((c) =>
  [...c.querySelectorAll('.board-contact')].map((n) => [n.getAttribute('href'), n.textContent.trim()]));

test('trenere: with consent, phone and email render as tel:/mailto: links', async () => {
  const doc = await renderWithCms({ trainers: [{ ...TRAINERS[0], phone: PHONE, email: EMAIL, consent: true, consentDate: '2026-10-18' }] });
  assert.deepEqual(contacts(doc), [[['tel:+4700000000', PHONE], ['mailto:' + EMAIL, EMAIL]]]);
});

test('trenere: without consent, details appear nowhere and the card simply ends', async () => {
  const doc = await renderWithCms({ trainers: [{ ...TRAINERS[0], phone: PHONE, email: EMAIL, consent: false }, { ...TRAINERS[1], phone: PHONE, email: EMAIL }] });
  const html = doc.documentElement.innerHTML;
  assert.ok(!html.includes('000 00 000') && !html.includes(EMAIL));
  assert.deepEqual(contacts(doc), [[], []]);
  assert.doesNotMatch(doc.querySelector('[data-trainers-grid]').textContent, /kontakt via/i);
});

test('trenere: malformed details are not links', async () => {
  const doc = await renderWithCms({ trainers: [
    { ...TRAINERS[0], phone: 'ring meg', email: 'ikke-en-epost', consent: true },
    { ...TRAINERS[1], email: 'kari@example.no?bcc=evil.no', consent: true },
  ] });
  assert.equal(doc.querySelector('a[href^="tel:"], a[href^="mailto:"]'), null);
  assert.deepEqual(contacts(doc), [[], []]);
});

test('trenere: markup in every text field renders as text', async () => {
  const evil = '<img src=x onerror=alert(1)><b>Hei Du</b>';
  const doc = await renderWithCms({ trainers: [
    { name: evil, role: evil, presentation: evil, merits: [evil], phone: evil, email: evil + '@example.no', consent: true },
  ] });
  assert.deepEqual(cards(doc), [{ initials: '<D', name: evil, role: evil, presentation: evil, merits: [evil] }]);
  assert.equal(doc.querySelector('main img, main b'), null);
});

const grid = (doc) => doc.querySelector('[data-trainers-grid]');
function assertPageStays(doc) {
  assert.equal(doc.querySelector('.page-hero-title').textContent, 'Trenere', 'hero stays');
  assert.ok(!doc.querySelector('.section-sub').closest('[hidden]'), 'intro stays');
  assert.ok(!doc.querySelector('.board-note').closest('[hidden]'), 'privacy note stays');
}

test('trenere: without JS, and before Sanity answers, the grid is hidden', () => {
  assert.equal(grid(new JSDOM(HTML).window.document).hidden, true, 'no JS');
  const doc = new JSDOM(HTML, { url: 'https://example.com/' }).window.document;
  stubFetch(doc, () => new Promise(() => {}));
  site.init(doc);
  assert.equal(grid(doc).hidden, true);
  assertPageStays(doc);
});

test('trenere: on a rejected fetch, the grid stays hidden', async () => {
  const doc = await renderWithCms(() => Promise.reject(new TypeError('offline')));
  assert.equal(grid(doc).hidden, true);
  assertPageStays(doc);
});

test('trenere: with no trainers (or no singleton), the grid stays hidden', async () => {
  for (const trainers of [[], null, [{ role: 'Uten navn' }]]) {
    const doc = await renderWithCms({ trainers });
    assert.equal(grid(doc).hidden, true, JSON.stringify(trainers));
    assert.equal(grid(doc).children.length, 0);
    assertPageStays(doc);
  }
});
