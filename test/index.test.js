'use strict';

// Integration test for index.html — landing page content accuracy (issue 008).
//
// Loads the real HTML file, runs site.js against it, and asserts the corrections
// from content-baseline.md: the Arrangement section lists the
// real events (Årsmøte 25 mars 2026 + three Telenorkarusellen dates) instead of
// invented placeholders; the Spond signup CTAs are present and target Spond;
// and the legacy schedule.html standalone file is removed. The Treningsplan
// (#schedule) is covered by test/treningsplan.test.js (issue 026).

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const site = require('../site');

const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

function renderIndex() {
  const doc = new JSDOM(HTML).window.document;
  site.init(doc);
  return doc;
}

test('index: Hjem nav link is marked active after layout injection', () => {
  const doc = renderIndex();
  const active = doc.querySelectorAll('#nav .nav-links a.active');
  assert.equal(active.length, 1, 'exactly one active nav link');
  assert.equal(active[0].textContent.trim(), 'Hjem');
  assert.equal(active[0].getAttribute('aria-current'), 'page');
});

test('index: arrangement section lists Årsmøte 25. mars 2026 kl. 18:00', () => {
  const doc = renderIndex();
  const events = doc.getElementById('events');
  assert.ok(events, 'events section exists');
  const text = events.textContent;
  assert.match(text, /Årsmøte/i, 'mentions Årsmøte');
  // Allow "25 mars", "25. mars", "25/3", etc.
  assert.match(text, /25\.?\s*mars|25\/3/i, 'mentions the 25 mars date');
  assert.match(text, /2026/, 'mentions year 2026');
  assert.match(text, /18[:.]00/, 'mentions 18:00 start time');
});

test('index: arrangement section lists all three Telenorkarusellen dates', () => {
  const doc = renderIndex();
  const events = doc.getElementById('events');
  const text = events.textContent;
  assert.match(text, /Telenorkarusellen/i, 'mentions Telenorkarusellen');
  // 19. januar, 18. februar, 9. mars
  assert.match(text, /19\.?\s*jan/i, 'mentions 19 jan');
  assert.match(text, /18\.?\s*feb/i, 'mentions 18 feb');
  assert.match(text, /9\.?\s*mars|9\.?\s*mar\b/i, 'mentions 9 mars');
});

test('index: hero and membership CTAs link to the Spond signup form', () => {
  const doc = renderIndex();
  const hero = doc.querySelector('.hero-ctas');
  assert.ok(hero, 'hero CTA block exists');
  const heroSpond = [...hero.querySelectorAll('a[href]')].find((a) =>
    /club\.spond\.com/.test(a.getAttribute('href') || ''),
  );
  assert.ok(heroSpond, 'hero has a Spond signup CTA');
  assert.equal(heroSpond.getAttribute('target'), '_blank');
  assert.match(heroSpond.getAttribute('rel') || '', /noopener/);

  const membership = doc.getElementById('membership');
  assert.ok(membership, 'membership section exists');
  const memSpond = [...membership.querySelectorAll('a[href]')].find((a) =>
    /club\.spond\.com/.test(a.getAttribute('href') || ''),
  );
  assert.ok(memSpond, 'membership has a Spond signup CTA');
  assert.equal(memSpond.getAttribute('target'), '_blank');
  assert.match(memSpond.getAttribute('rel') || '', /noopener/);
});

test('index: the hero "Se Skiskolen" button links to skiskole.html (issue 024)', () => {
  const doc = renderIndex();
  const btn = [...doc.querySelectorAll('.hero a')].find((a) => /Se Skiskolen/.test(a.textContent));
  assert.ok(btn, 'hero has a Se Skiskolen button');
  assert.equal(btn.getAttribute('href'), 'skiskole.html');
  assert.equal(btn.textContent.trim(), 'Se Skiskolen');
});

test('index: legacy schedule.html standalone file has been removed', () => {
  assert.equal(
    fs.existsSync(path.join(ROOT, 'schedule.html')),
    false,
    'schedule.html must be deleted — its content lives in index.html now',
  );
});

test('index: page has no absolute internal links (subpath-safe)', () => {
  const bad = [];
  const re = /(?:href|src)="([^"]*)"/g;
  let m;
  while ((m = re.exec(HTML)) !== null) {
    const url = m[1];
    if (url.startsWith('/') && !url.startsWith('//')) bad.push(url);
  }
  assert.deepEqual(bad, [], `index.html has absolute internal links: ${bad.join(', ')}`);
});

test('index: Haukåsløypa section presents Cross-løypa as new this season (issue 019)', () => {
  const doc = renderIndex();
  const section = doc.getElementById('haukos');
  const text = section.textContent.replace(/\s+/g, ' ');
  assert.match(text, /Cross-løypa er ca\. 250 meter med 57 meters fall/);
  assert.match(text, /Ny denne sesongen/);
  const chips = [...section.querySelectorAll('.fact-chip')].map((c) =>
    c.textContent.replace(/\s+/g, ' ').trim(),
  );
  assert.ok(chips.some((c) => /Cross-løypa — lengde ≈250m/.test(c)), 'length chip');
  assert.ok(chips.some((c) => /Cross-løypa — høydeforskjell 57m/.test(c)), 'drop chip');
});

test('index: inline Cross-løypa track has no tunnel points (issue 019)', () => {
  const m = HTML.match(/const CROSS = '([^']+)'/);
  assert.ok(m, 'CROSS coordinate string is inline in index.html');
  const elev = m[1].trim().split(/\s+/).map((t) => +t.split(',')[2]);
  assert.equal(elev[0], 168, 'starts at 168 m');
  assert.equal(elev[elev.length - 1], 111, 'ends at 111 m, top of barnebakken');
  assert.ok(elev.every((e) => e >= 111 && e <= 168), 'no point outside 111–168 m');
});

// ── Training group cards (Våre Treningsgrupper), from Sanity ──

const { stubFetch } = require('./helpers');

async function renderWith(cms) {
  const doc = new JSDOM(HTML).window.document;
  stubFetch(doc, cms);
  await site.init(doc);
  return doc;
}
const programCards = (doc) => [...doc.querySelectorAll('#programs-grid .program-card')];

test('index: training group cards are hidden until the CMS answers, with a noscript reveal', () => {
  const grid = new JSDOM(HTML).window.document.getElementById('programs-grid');
  assert.ok(grid.hidden);
  assert.match(HTML, /<noscript><style>[^<]*#programs-grid\[hidden\][^<]*<\/style><\/noscript>/);
});

test('index: the fallback cards are the five new groups, linking to their sections', async () => {
  const doc = await renderWith(() => Promise.reject(new Error('offline')));
  assert.ok(!doc.getElementById('programs-grid').hidden);
  assert.deepEqual(programCards(doc).map((c) => c.querySelector('.program-name').textContent), ['Grønn', 'Blå', 'Rød', 'Sort', 'Fun']);
  assert.deepEqual(programCards(doc).map((c) => c.querySelector('.program-link').getAttribute('href')),
    ['gronn', 'bla', 'rod', 'sort', 'fun'].map((id) => 'treningsopplegg.html#' + id));
});

test('index: training group cards follow Sanity (order, colour, age, description, link)', async () => {
  const doc = await renderWith({ trainingGroups: [
    { title: 'Grønn', colour: 'Grønn', age: 'U8', description: 'Lek og mestring.' },
    { title: 'Fun', colour: 'Orange' },
  ] });
  const [a, b] = programCards(doc);
  assert.equal(programCards(doc).length, 2);
  assert.ok(a.classList.contains('group-gronn') && b.classList.contains('group-orange'));
  assert.ok(!a.classList.contains('fade-in'), 'not stuck in the fade-in hidden state');
  assert.equal(a.querySelector('.program-age').textContent, 'U8');
  assert.equal(a.querySelector('.program-desc').textContent, 'Lek og mestring.');
  assert.equal(a.querySelector('.program-link').getAttribute('href'), 'treningsopplegg.html#gronn');
  assert.equal(a.querySelector('.program-link').getAttribute('aria-label'), 'Les mer om Grønn');
  assert.equal(b.querySelector('.program-age'), null, 'no empty age');
  assert.equal(b.querySelector('.program-desc'), null, 'no empty description');
});

test('index: zero training groups keeps the fallback cards', async () => {
  const doc = await renderWith({ trainingGroups: [] });
  assert.equal(programCards(doc).length, 5);
  assert.ok(!doc.getElementById('programs-grid').hidden);
});
