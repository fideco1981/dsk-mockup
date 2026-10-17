'use strict';

// Lift hours (issue 025): one Sanity singleton read on om-oss.html,
// kontakt.html (compact form plus note) and index.html (per-day lift labels
// in #schedule plus note). A failed fetch or no singleton keeps the HTML.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { stubFetch } = require('./helpers');
const site = require('../site');

const html = (page) => fs.readFileSync(path.join(__dirname, '..', page + '.html'), 'utf8');
const FALLBACK = 'Man–Tor 18:00–20:00 · Fre stengt · Lør–Søn 11:00–15:00';

/** Run site.js on the real page. `cms` is a Sanity result or a failing fetch. */
async function render(page, cms) {
  const doc = new JSDOM(html(page)).window.document;
  stubFetch(doc, cms);
  await site.init(doc);
  return doc;
}

const compact = (doc) => doc.querySelector('[data-lift-hours]').textContent;
const note = (doc) => doc.querySelector('[data-lift-note]');
const fail = () => Promise.reject(new Error('offline'));

const session = (day, from, to) => ({ day, from, to });
const WEEK = [
  session('Mandag', '18:00', '20:00'), session('Tirsdag', '18:00', '20:00'),
  session('Torsdag', '18:00', '20:00'), session('Fredag', '17:00', '20:00'),
  session('Søndag', '11:00', '15:00'), session('Lørdag', '11:00', '15:00'),
];

test('lift hours: compact form merges consecutive equal days and shows closed days as "stengt"', async () => {
  const doc = await render('om-oss', { liftHours: { hours: WEEK, note: 'Dugnad.' } });
  assert.equal(compact(doc), 'Man–Tir 18:00–20:00 · Ons stengt · Tor 18:00–20:00 · Fre 17:00–20:00 · Lør–Søn 11:00–15:00');
});

test('lift hours: om-oss and kontakt render the hours and note from Sanity', async () => {
  for (const page of ['om-oss', 'kontakt']) {
    const doc = await render(page, { liftHours: { hours: [session('Lørdag', '10:00', '14:00')], note: 'Stengt i påsken.' } });
    assert.equal(compact(doc), 'Man–Fre stengt · Lør 10:00–14:00 · Søn stengt', page);
    assert.equal(note(doc).textContent, 'Stengt i påsken.', page);
    assert.ok(note(doc).parentNode.querySelector('svg.icon'), page + ': icon kept');
  }
});

const DAYS = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];
/** index.html #schedule lift labels, per view: { Mandag: 'Heis …', … }. */
function liftLabels(doc, view) {
  const out = {};
  doc.querySelectorAll(`#schedule .${view} .lift-header`).forEach((l) => { out[l.dataset.day] = l.textContent; });
  return out;
}

test('lift hours: index lift labels come from Sanity, "Heis stengt" for missing days, in both views', async () => {
  const doc = await render('index', { liftHours: { hours: WEEK, note: 'Dugnad.' } });
  const expected = {
    Mandag: 'Heis 18:00 – 20:00', Tirsdag: 'Heis 18:00 – 20:00', Onsdag: 'Heis stengt', Torsdag: 'Heis 18:00 – 20:00',
    Fredag: 'Heis 17:00 – 20:00', Lørdag: 'Heis 11:00 – 15:00', Søndag: 'Heis 11:00 – 15:00',
  };
  for (const view of ['week-grid', 'mobile-schedule']) {
    assert.deepEqual(liftLabels(doc, view), expected, view);
    const closed = [...doc.querySelectorAll(`#schedule .${view} .lift-closed .lift-header`)].map((l) => l.dataset.day);
    assert.deepEqual(closed, ['Onsdag'], view);
  }
  assert.equal(doc.querySelector('#schedule [data-lift-note]').textContent, 'Dugnad.');
});

/** The hand-written HTML fallback as Sanity data: FALLBACK in session form. */
const FALLBACK_WEEK = [
  ...DAYS.slice(0, 4).map((d) => session(d, '18:00', '20:00')),
  session('Lørdag', '11:00', '15:00'), session('Søndag', '11:00', '15:00'),
];

test('lift hours: the fallback week matches FALLBACK, so it can stand in as the fallback source', async () => {
  const doc = await render('om-oss', { liftHours: { hours: FALLBACK_WEEK } });
  assert.equal(compact(doc), FALLBACK);
});

test('lift hours: index keeps the fallback labels and the same note as om-oss and kontakt on a fetch error', async () => {
  const doc = await render('index', fail);
  const fromFallback = await render('index', { liftHours: { hours: FALLBACK_WEEK } });
  for (const view of ['week-grid', 'mobile-schedule']) {
    assert.equal(Object.keys(liftLabels(doc, view)).length, 7, view);
    assert.deepEqual(liftLabels(doc, view), liftLabels(fromFallback, view), view);
  }
  for (const page of ['om-oss', 'kontakt']) {
    assert.equal(note(doc).textContent, note(new JSDOM(html(page)).window.document).textContent, 'same fallback note as ' + page);
  }
});

test('lift hours: a singleton without valid hours keeps the fallback hours and labels but shows its note', async () => {
  for (const hours of [[], undefined, [session('Mandag', '', '20:00')]]) {
    for (const page of ['om-oss', 'kontakt']) {
      const doc = await render(page, { liftHours: { hours, note: 'Dugnad.' } });
      assert.equal(compact(doc), FALLBACK, page);
      assert.equal(note(doc).textContent, 'Dugnad.', page);
    }
    const doc = await render('index', { liftHours: { hours } });
    const before = await render('index', fail);
    assert.deepEqual(liftLabels(doc, 'week-grid'), liftLabels(before, 'week-grid'));
    assert.equal(doc.querySelectorAll('#schedule .lift-closed').length, before.querySelectorAll('#schedule .lift-closed').length);
  }
});

test('lift hours: a fetch error or no singleton keeps the fallback hours and note', async () => {
  for (const page of ['om-oss', 'kontakt']) {
    const before = note(new JSDOM(html(page)).window.document).textContent;
    for (const cms of [fail, { liftHours: null }]) {
      const doc = await render(page, cms);
      assert.equal(compact(doc), FALLBACK, page);
      assert.equal(note(doc).textContent, before, page);
    }
  }
});

test('lift hours: the Studio rejects two entries for the same day and reuses the session type', async () => {
  const { liftHours } = await import('../studio/schemaTypes/liftHours.js');
  const { trainingGroup } = await import('../studio/schemaTypes/trainingGroup.js');
  const field = (t, name) => t.fields.find((f) => f.name === name);
  const hours = field(liftHours, 'hours');
  assert.equal(hours.of[0], field(trainingGroup, 'sessions').of[0], 'same session type');
  const check = hours.validation({ custom: (fn) => fn });
  assert.equal(check(undefined), true);
  assert.equal(check(WEEK), true);
  assert.notEqual(check([...WEEK, session('Mandag', '10:00', '12:00')]), true, 'Mandag twice');
});
