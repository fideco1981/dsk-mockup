'use strict';

// Integration test for treningsopplegg.html (issues 007, 023). Loads the real
// HTML, runs site.js against it, and checks the Training groups from Sanity
// plus the hand-written fallback.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { stubFetch } = require('./helpers');
const site = require('../site');

const HTML = fs.readFileSync(
  path.join(__dirname, '..', 'treningsopplegg.html'),
  'utf8',
);
const FALLBACK_IDS = ['gronn', 'bla', 'rod', 'sort', 'fun'];

/** Run site.js on the real page. `cms` is a Sanity result or a failing fetch. */
async function render(cms) {
  const doc = new JSDOM(HTML).window.document;
  if (cms !== undefined) stubFetch(doc, cms);
  await site.init(doc);
  return doc;
}

const cards = (doc) => [...doc.querySelectorAll('.quick-nav-card')];
const sections = (doc) => [...doc.querySelectorAll('#training-groups > section')];

const GROUPS = [
  {
    title: 'Blå', colour: 'Blå', order: 2, age: 'U10', place: 'Haukåsløypa', price: '4 500 kr',
    description: 'Teknikk og fri kjøring.',
    sessions: [
      { day: 'Torsdag', from: '18:00', to: '19:30' },
      { day: 'Mandag', from: '17:00', to: '18:30' },
      { day: 'Søndag', from: '10:00', to: '12:00' },
      { day: 'Mandag', from: '19:00', to: '20:00' },
    ],
  },
  { title: 'Grønn', colour: 'Grønn', order: 1, age: 'U8' },
  { title: 'Fun', colour: 'Orange', order: 5 },
];
// What the query's `order(order asc)` returns.
const SORTED = [GROUPS[1], GROUPS[0], GROUPS[2]];

test('treningsopplegg: Treningsopplegg nav link is marked active after layout injection', async () => {
  const doc = await render();
  const active = doc.querySelectorAll('#nav .nav-links a.active');
  assert.equal(active.length, 1, 'exactly one active nav link');
  assert.equal(active[0].textContent.trim(), 'Treningsopplegg');
  assert.equal(active[0].getAttribute('aria-current'), 'page');
});

test('treningsopplegg: the fallback has the five groups, each linked from the quick nav', async () => {
  const doc = await render();
  assert.deepEqual(sections(doc).map((s) => s.id), FALLBACK_IDS);
  assert.deepEqual(cards(doc).map((a) => a.getAttribute('href')), FALLBACK_IDS.map((id) => '#' + id));
  assert.equal(doc.querySelector('.training-quick-nav .section-title').textContent, 'Fem grupper');
  for (const s of sections(doc)) assert.match(s.textContent, /Tider og pris kommer — se Spond/);
  assert.deepEqual(sections(doc).map((s) => s.classList[1]), ['group-gronn', 'group-bla', 'group-rod', 'group-sort', 'group-orange']);
});

test('treningsopplegg: groups are hidden until the CMS answers, with a noscript reveal', () => {
  const doc = new JSDOM(HTML).window.document;
  assert.ok(doc.getElementById('training-groups').hidden);
  assert.ok(doc.getElementById('training-nav').hidden);
  assert.match(HTML, /<noscript><style>[^<]*#training-groups\[hidden\][^<]*<\/style><\/noscript>/);
});

test('treningsopplegg: CMS groups render in order; cards and sections match via slugged anchors', async () => {
  const doc = await render({ trainingGroups: SORTED });
  assert.deepEqual(sections(doc).map((s) => s.id), ['gronn', 'bla', 'fun']);
  assert.deepEqual(sections(doc).map((s) => s.querySelector('h2').textContent), ['Grønn', 'Blå', 'Fun']);
  assert.deepEqual(cards(doc).map((a) => a.getAttribute('href')), ['#gronn', '#bla', '#fun']);
  assert.deepEqual(cards(doc).map((a) => a.querySelector('.quick-nav-name').textContent), ['Grønn', 'Blå', 'Fun']);
  assert.equal(cards(doc)[0].querySelector('.quick-nav-age').textContent, 'U8');
  assert.equal(doc.querySelector('.training-quick-nav .section-title').textContent, 'Tre grupper');
  assert.ok(!doc.getElementById('training-groups').hidden);
  assert.ok(!doc.getElementById('training-nav').hidden);
  // Colour classes on card and section; Fun is orange. The tag shows the age.
  assert.ok(cards(doc)[2].classList.contains('group-orange'));
  assert.ok(sections(doc)[2].classList.contains('group-orange'));
  assert.equal(sections(doc)[1].querySelector('.training-tag').textContent, 'U10');
});

test('treningsopplegg: anchors slug æ/ø/å and other characters', async () => {
  const doc = await render({ trainingGroups: [
    { title: 'Rød', colour: 'Rød' }, { title: 'Sort', colour: 'Sort' }, { title: 'Ærlig Gøy & Fart', colour: 'Blå' },
  ] });
  assert.deepEqual(sections(doc).map((s) => s.id), ['rod', 'sort', 'aerlig-goy-fart']);
});

test('treningsopplegg: sessions are one line each, sorted Monday→Sunday', async () => {
  const doc = await render({ trainingGroups: SORTED });
  const lines = [...sections(doc)[1].querySelectorAll('.training-session')].map((li) => li.textContent.trim());
  assert.deepEqual(lines, ['Mandag 17:00–18:30', 'Mandag 19:00–20:00', 'Torsdag 18:00–19:30', 'Søndag 10:00–12:00']);
  const text = sections(doc)[1].textContent;
  assert.match(text, /Haukåsløypa/);
  assert.match(text, /4 500 kr/);
  assert.match(text, /Teknikk og fri kjøring\./);
});

test('treningsopplegg: a group with only title and colour has no empty lines', async () => {
  const doc = await render({ trainingGroups: [{ title: 'Fun', colour: 'Orange' }] });
  const [s] = sections(doc);
  assert.equal(s.querySelector('.training-facts'), null, 'no facts list');
  assert.equal(s.querySelector('.section-sub'), null, 'no description');
  assert.equal(s.querySelector('.training-tag'), null, 'no age tag');
  assert.doesNotMatch(s.textContent, /Sted|Pris|undefined|null/);
  assert.equal(cards(doc)[0].querySelector('.quick-nav-age'), null, 'no age on the card');
  assert.equal(doc.querySelector('.training-quick-nav .section-title').textContent, 'Én gruppe');
});

test('treningsopplegg: markup in CMS fields is rendered as text', async () => {
  const doc = await render({ trainingGroups: [{ title: '<b>X</b>', colour: 'Blå', place: '<img src=x>' }] });
  assert.equal(doc.querySelector('#training-groups b, #training-groups img'), null);
  assert.match(sections(doc)[0].textContent, /<img src=x>/);
});

test('treningsopplegg: a Sanity error, an empty list and malformed data all keep the fallback', async () => {
  for (const cms of [
    () => Promise.reject(new Error('offline')),
    () => Promise.resolve({ ok: false, status: 500 }),
    { trainingGroups: [] },
    { trainingGroups: [{ colour: 'Blå' }, null] },
    {},
  ]) {
    const doc = await render(cms);
    assert.deepEqual(sections(doc).map((s) => s.id), FALLBACK_IDS);
    assert.ok(!doc.getElementById('training-groups').hidden);
    assert.ok(!doc.getElementById('training-nav').hidden);
    assert.equal(doc.querySelector('.training-quick-nav .section-title').textContent, 'Fem grupper');
  }
});

test('treningsopplegg: the query sorts training groups by their order field', async () => {
  const doc = new JSDOM(HTML).window.document;
  const calls = stubFetch(doc, {});
  await site.init(doc);
  assert.match(decodeURIComponent(calls[0]), /_type == "trainingGroup"\] \| order\(order asc\)/);
});

test('treningsopplegg: Spond signup link is present and opens in a new tab', async () => {
  const doc = await render();
  const main = doc.querySelector('main');
  const spond = [...main.querySelectorAll('a[href]')].filter((a) =>
    /club\.spond\.com/.test(a.getAttribute('href') || ''),
  );
  assert.ok(spond.length >= 1, 'main content has a Spond CTA');
  for (const a of spond) {
    assert.equal(a.getAttribute('target'), '_blank', 'opens in new tab');
    assert.match(a.getAttribute('rel') || '', /noopener/, 'rel includes noopener');
  }
});

test('treningsopplegg: page has no absolute internal links (subpath-safe)', () => {
  const bad = [];
  const re = /(?:href|src)="([^"]*)"/g;
  let m;
  while ((m = re.exec(HTML)) !== null) {
    const url = m[1];
    if (url.startsWith('/') && !url.startsWith('//')) bad.push(url);
  }
  assert.deepEqual(bad, [], `treningsopplegg.html has absolute internal links: ${bad.join(', ')}`);
});

// ── Studio schema (issue 023): session rules, driven without Sanity ──

test('treningsopplegg: the Studio schema rejects bad sessions and matches site.js colours', async () => {
  const { trainingGroup, GROUP_COLOURS } = await import('../studio/schemaTypes/trainingGroup.js');
  const session = trainingGroup.fields.find((f) => f.name === 'sessions').of[0];
  // A Rule stub that records required() and regex(); custom() returns its check.
  const rule = () => {
    const r = { req: false, re: null };
    r.required = () => { r.req = true; return r; };
    r.regex = (re) => { r.re = re; return r; };
    r.error = () => r;
    r.custom = (fn) => fn;
    return r;
  };
  for (const name of ['day', 'from', 'to']) {
    assert.ok(session.fields.find((f) => f.name === name).validation(rule()).req, `${name} is required`);
  }
  const time = session.fields.find((f) => f.name === 'from').validation(rule()).re;
  for (const ok of ['00:00', '18:00', '23:59']) assert.match(ok, time);
  for (const bad of ['24:00', '8:00', '18.00', '18:60', '1800']) assert.doesNotMatch(bad, time);

  const check = session.validation(rule());
  assert.equal(check({ day: 'Mandag', from: '18:00', to: '19:30' }), true);
  assert.notEqual(check({ day: 'Mandag', from: '18:00', to: '18:00' }), true, 'to equal to from');
  assert.notEqual(check({ day: 'Mandag', from: '19:30', to: '18:00' }), true, 'to before from');

  // Every colour has a site.js class: none fall back to the default blue.
  const doc = await render({ trainingGroups: GROUP_COLOURS.map((c) => ({ title: c + ' gruppe', colour: c })) });
  const classes = cards(doc).map((a) => a.className.split(' ')[1]);
  assert.deepEqual(classes, ['group-gronn', 'group-bla', 'group-rod', 'group-sort', 'group-orange']);
});
