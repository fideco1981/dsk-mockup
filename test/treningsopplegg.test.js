'use strict';

// Integration test for treningsopplegg.html — the four-group training
// page (issue 007). Loads the real HTML file, runs site.js against it,
// and asserts: the shared layout marks "Treningsopplegg" active, all
// four groups (Rekrutten / Teknikeren / DSK Fun / U12–U16 DSK) render
// with their correct ages, schedules, locations, and fees per
// content-baseline.md, in-page anchor navigation links each group
// section, "Teknikeren" is spelled correctly, and the U12–U16 price
// is marked provisional (pending issue 009 club input).

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const site = require('../site');

const HTML = fs.readFileSync(
  path.join(__dirname, '..', 'treningsopplegg.html'),
  'utf8',
);

function renderTreningsopplegg() {
  const doc = new JSDOM(HTML).window.document;
  site.init(doc);
  return doc;
}

test('treningsopplegg: Treningsopplegg nav link is marked active after layout injection', () => {
  const doc = renderTreningsopplegg();
  const active = doc.querySelectorAll('#nav .nav-links a.active');
  assert.equal(active.length, 1, 'exactly one active nav link');
  assert.equal(active[0].textContent.trim(), 'Treningsopplegg');
  assert.equal(active[0].getAttribute('aria-current'), 'page');
});

test('treningsopplegg: all four group sections are present with their IDs', () => {
  const doc = renderTreningsopplegg();
  // Anchor IDs for in-page nav between groups.
  for (const id of ['rekrutten', 'teknikeren', 'dsk-fun', 'u12-u16']) {
    assert.ok(
      doc.getElementById(id),
      `section with id="${id}" must exist for in-page anchor nav`,
    );
  }
});

test('treningsopplegg: in-page anchor nav links to all four group sections', () => {
  const doc = renderTreningsopplegg();
  const main = doc.querySelector('main');
  const anchors = [...main.querySelectorAll('a[href^="#"]')]
    .map((a) => a.getAttribute('href'));
  for (const id of ['#rekrutten', '#teknikeren', '#dsk-fun', '#u12-u16']) {
    assert.ok(
      anchors.includes(id),
      `in-page nav must include anchor link "${id}"`,
    );
  }
});

test('treningsopplegg: Rekrutten (U8) shows age, schedule, locations, and fee', () => {
  const doc = renderTreningsopplegg();
  const rekrutten = doc.getElementById('rekrutten');
  assert.ok(rekrutten, 'rekrutten section exists');
  const text = rekrutten.textContent;
  // Age group: U8
  assert.match(text, /U8/, 'mentions U8 age group');
  // Schedule: Man + Ons 18:00-19:30
  assert.match(text, /mandag|man\b/i, 'mentions Monday');
  assert.match(text, /onsdag|ons\b/i, 'mentions Wednesday');
  assert.match(text, /18[:.]00\s*[–-]\s*19[:.]30/, 'mentions 18:00-19:30 window');
  // Mainly barnebakke
  assert.match(text.toLowerCase(), /barnebakke/, 'mentions barnebakke');
  // Fees: 300 kr membership + 3 500 kr training
  assert.match(text, /3\s*500\s*kr/, 'Rekrutten training fee 3 500 kr');
  assert.match(text, /300\s*kr/, 'membership 300 kr');
});

test('treningsopplegg: Teknikeren (U10) shows age, schedule, locations, and fee', () => {
  const doc = renderTreningsopplegg();
  const teknikeren = doc.getElementById('teknikeren');
  assert.ok(teknikeren, 'teknikeren section exists');
  const text = teknikeren.textContent;
  // Age group: U10 + strong U8
  assert.match(text, /U10/, 'mentions U10 age group');
  // Schedule: Man/Ons/Tor 18:00-19:30
  assert.match(text, /tor[a-z]*dag|tor\b/i, 'mentions Thursday');
  // Locations: Haukåsløypa, Skimore Drammen, Skimore Kongsberg
  assert.match(text, /Hauk[åa]s/i, 'mentions Haukås');
  assert.match(text, /Skimore\s+Drammen/i, 'mentions Skimore Drammen');
  assert.match(text, /Skimore\s+Kongsberg/i, 'mentions Skimore Kongsberg');
  // Fee: 4 500 kr training
  assert.match(text, /4\s*500\s*kr/, 'Teknikeren training fee 4 500 kr');
});

test('treningsopplegg: DSK Fun (10–13) shows age, schedule, locations, and fee', () => {
  const doc = renderTreningsopplegg();
  const dskFun = doc.getElementById('dsk-fun');
  assert.ok(dskFun, 'dsk-fun section exists');
  const text = dskFun.textContent;
  // Age group: 10–13
  assert.match(text, /10\s*[–-]\s*13/, 'mentions age range 10-13');
  // Schedule: Tue + Thu + select weekends
  assert.match(text, /tir[a-z]*dag|tir\b/i, 'mentions Tuesday');
  assert.match(text, /tor[a-z]*dag|tor\b/i, 'mentions Thursday');
  // Locations: Haukåsløypa, Skimore Drammen, Skimore Kongsberg
  assert.match(text, /Hauk[åa]s/i, 'mentions Haukås');
  assert.match(text, /Skimore/i, 'mentions Skimore');
  // Fee: 3 000 kr training
  assert.match(text, /3\s*000\s*kr/, 'DSK Fun training fee 3 000 kr');
});

test('treningsopplegg: U12–U16 DSK shows age, schedule, locations, and provisional price', () => {
  const doc = renderTreningsopplegg();
  const u12 = doc.getElementById('u12-u16');
  assert.ok(u12, 'u12-u16 section exists');
  const text = u12.textContent;
  // Age group: U12-U16
  assert.match(text, /U12\s*[–-]\s*U16|U12-U16/i, 'mentions U12-U16');
  // Locations: Skimore Kongsberg + Drammen skisenter
  assert.match(text, /Skimore\s+Kongsberg/i, 'mentions Skimore Kongsberg');
  assert.match(text, /Drammen\s+skisenter|Skimore\s+Drammen/i, 'mentions Drammen skisenter');
  // Price must be provisional — NOT a hard number; must include some
  // "ikke bekreftet" / "kontakt for pris" / "avklares" wording.
  assert.match(
    text.toLowerCase(),
    /kontakt for pris|pris.*ikke|avklares|må bekreftes|ikke bekreftet|kommer|oppgis.*spond/,
    'U12-U16 price marked provisional pending club input',
  );
});

test('treningsopplegg: "Teknikeren" is spelled correctly (not "Teknikern") throughout', () => {
  const doc = renderTreningsopplegg();
  const text = doc.body.textContent;
  // The misspelling "Teknikern" (without the final "e") should never appear.
  // Match boundary-safe so "Teknikeren" itself is excluded.
  assert.equal(
    /Teknikern(?!e)/i.test(text),
    false,
    'misspelling "Teknikern" must not appear',
  );
  // And the correct spelling must appear at least once.
  assert.ok(/Teknikeren/.test(text), 'correct spelling "Teknikeren" present');
});

test('treningsopplegg: Telenorkarusellen dates appear (linked from Rekrutten)', () => {
  const doc = renderTreningsopplegg();
  const text = doc.body.textContent;
  // Rekrutten section ties into Telenorkarusellen (19 Jan / 18 Feb / 9 Mar).
  assert.match(text, /Telenorkarusellen/i, 'mentions Telenorkarusellen');
});

test('treningsopplegg: Spond signup link is present and opens in a new tab', () => {
  const doc = renderTreningsopplegg();
  const main = doc.querySelector('main');
  const spond = [...main.querySelectorAll('a[href]')].filter((a) =>
    /club\.spond\.com/.test(a.getAttribute('href') || ''),
  );
  assert.ok(spond.length >= 1, 'main content has a Spond CTA');
  for (const a of spond) {
    assert.equal(a.getAttribute('target'), '_blank', 'opens in new tab');
    assert.match(
      a.getAttribute('rel') || '',
      /noopener/,
      'rel includes noopener',
    );
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
