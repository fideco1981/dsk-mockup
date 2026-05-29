'use strict';

// Integration test for skiskole.html — the ski-school / alpine-course
// page for ages 4-10 (issue 006). Loads the real HTML file, runs site.js
// against it, and asserts: the shared layout marks "Skiskole" active,
// both course types render with their full price + schedule, the "what
// is included" line is shown (incl. the +450 kr continuation note), the
// age + equipment + arrival notes are present, and the Spond CTA is the
// real signup form opened in a new tab.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const site = require('../site');

const HTML = fs.readFileSync(
  path.join(__dirname, '..', 'skiskole.html'),
  'utf8',
);

function renderSkiskole() {
  const doc = new JSDOM(HTML).window.document;
  site.init(doc);
  return doc;
}

test('skiskole: Skiskole nav link is marked active after layout injection', () => {
  const doc = renderSkiskole();
  const active = doc.querySelectorAll('#nav .nav-links a.active');
  assert.equal(active.length, 1, 'exactly one active nav link');
  assert.equal(active[0].textContent.trim(), 'Skiskole');
  assert.equal(active[0].getAttribute('aria-current'), 'page');
});

test('skiskole: afternoon course shows correct days, times, sessions, and price', () => {
  const doc = renderSkiskole();
  const text = doc.body.textContent;
  // Afternoon course: Tue + Thu 17:30–18:45, 6 sessions over 3 weeks, 2 950 kr.
  assert.match(text, /tirsdag|tir\b|tue/i, 'mentions Tuesday');
  assert.match(text, /torsdag|tor\b|thu/i, 'mentions Thursday');
  assert.match(text, /17[:.]30\s*[–-]\s*18[:.]45/, 'afternoon time window');
  assert.match(text, /6\s*(?:kvelder|samlinger|økter|sessions|ganger)/i, '6 sessions');
  assert.match(text, /2\s*950\s*kr/i, 'afternoon course price 2 950 kr');
});

test('skiskole: weekend course shows correct days, times, and price', () => {
  const doc = renderSkiskole();
  const text = doc.body.textContent;
  // Weekend course: Sat + Sun 10:00–14:00 daily, 6h total, 2 500 kr.
  assert.match(text, /lørdag|sat/i, 'mentions Saturday');
  assert.match(text, /søndag|sun/i, 'mentions Sunday');
  assert.match(text, /10[:.]00\s*[–-]\s*14[:.]00/, 'weekend time window');
  assert.match(text, /2\s*500\s*kr/i, 'weekend course price 2 500 kr');
});

test('skiskole: lists what is included + the +450 kr continuation note', () => {
  const doc = renderSkiskole();
  const text = doc.body.textContent.toLowerCase();
  // Includes: season membership 2025-2026, Haukåsløypa season pass,
  // Rekrutten activity fee. Weekend-course kids continuing pay +450 kr.
  assert.ok(text.includes('medlem'), 'mentions membership');
  assert.ok(text.includes('sesongkort') || text.includes('sesong'), 'mentions season pass');
  assert.ok(text.includes('rekrutt'), 'mentions Rekrutten activity fee');
  assert.match(text, /\+?\s*450\s*kr/, '+450 kr continuation note');
});

test('skiskole: age requirement, equipment, and arrival notes are shown', () => {
  const doc = renderSkiskole();
  const text = doc.body.textContent;
  // Ages 4-10, must be 4 by 1 Jan 2026.
  assert.match(text, /4\s*[–-]\s*10/, 'age range 4-10');
  assert.match(text, /1\.?\s*januar\s*2026|01[./]01[./]2026/i, '4 by 1 Jan 2026');
  // Equipment: bring own skis (no loaner gear).
  assert.match(
    text.toLowerCase(),
    /egne ski|ta med.*ski|medbring/,
    'bring own skis',
  );
  // Arrival: arrive 15 min early, skis ready.
  assert.match(text, /15\s*min/i, 'arrive 15 min early');
});

test('skiskole: Bli medlem / signup CTA links to the real Spond form', () => {
  const doc = renderSkiskole();
  const anchors = [...doc.querySelectorAll('a[href]')];
  const spond = anchors.find((a) =>
    /club\.spond\.com\/landing\/signup\/drammensk\/form\/79B423729D544EBABC46631C0E5DB0F3/.test(
      a.getAttribute('href') || '',
    ),
  );
  assert.ok(spond, 'page links to the Spond signup form');
  // External CTA should open in a new tab safely.
  // (At least one of the Spond links — the page-body CTA — must do so.
  // The footer link does not, which is fine, so we filter to body links.)
  const main = doc.querySelector('main');
  const mainSpond = [...main.querySelectorAll('a[href]')].filter((a) =>
    /club\.spond\.com/.test(a.getAttribute('href') || ''),
  );
  assert.ok(mainSpond.length >= 1, 'main content has a Spond CTA');
  for (const a of mainSpond) {
    assert.equal(a.getAttribute('target'), '_blank', 'opens in new tab');
    assert.match(
      a.getAttribute('rel') || '',
      /noopener/,
      'rel includes noopener',
    );
  }
});

test('skiskole: page has no absolute internal links (subpath-safe)', () => {
  // Belt-and-braces check on top of test/deploy.test.js, which already
  // auto-scans every NAV_MODEL page on disk.
  const bad = [];
  const re = /(?:href|src)="([^"]*)"/g;
  let m;
  while ((m = re.exec(HTML)) !== null) {
    const url = m[1];
    if (url.startsWith('/') && !url.startsWith('//')) bad.push(url);
  }
  assert.deepEqual(bad, [], `skiskole.html has absolute internal links: ${bad.join(', ')}`);
});
