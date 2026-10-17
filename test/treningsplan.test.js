'use strict';

// Treningsplan (issue 026): the landing page's #schedule built from Training
// group sessions, Courses in the current week and Lift hours. A failed fetch
// or no groups keeps the HTML fallback.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { stubFetch } = require('./helpers');
const site = require('../site');

const HTML = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const VIEWS = ['week-grid', 'mobile-schedule'];

async function render(cms) {
  const doc = new JSDOM(HTML).window.document;
  stubFetch(doc, cms);
  await site.init(doc);
  return doc;
}

const session = (day, from, to) => ({ day, from, to });
const LIFT = { hours: ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag'].map((d) => session(d, '18:00', '20:00')) };
const GROUPS = [
  { title: 'Grønn', colour: 'Grønn', place: 'Barnebakken', sessions: [session('Mandag', '18:30', '19:30')] },
  { title: 'Fun', colour: 'Orange', sessions: [session('Mandag', '18:00', '19:00'), session('Onsdag', '18:00', '19:30')] },
];

/** The lift wrapper for a day in one view. */
const day = (doc, view, d) => doc.querySelector(`#schedule .${view} .lift-header[data-day="${d}"]`).parentNode;
/** [[title, class, time], …] of a day's session cards. */
const cards = (doc, view, d) => [...day(doc, view, d).querySelectorAll('.session-card')]
  .map((c) => [c.querySelector('.s-group').textContent, c.className, c.querySelector('.s-time').textContent]);
const legend = (doc) => [...doc.querySelectorAll('#schedule .legend-item')].map((i) => i.textContent.trim());

test('treningsplan: group sessions go on their day in the group colour, sorted by from, in both views', async () => {
  const doc = await render({ trainingGroups: GROUPS, liftHours: LIFT });
  for (const view of VIEWS) {
    assert.deepEqual(cards(doc, view, 'Mandag'), [
      ['Fun', 'session-card group-orange', '18:00 – 19:00'],
      ['Grønn', 'session-card group-gronn', '18:30 – 19:30'],
    ], view);
    assert.deepEqual(cards(doc, view, 'Onsdag').map((c) => c[0]), ['Fun'], view);
    assert.deepEqual(cards(doc, view, 'Tirsdag'), [], view);
    assert.equal(day(doc, view, 'Mandag').querySelector('.s-loc').textContent, 'Barnebakken', view);
  }
  assert.deepEqual(legend(doc), ['Grønn', 'Fun']);
  assert.ok(doc.querySelector('#schedule .legend-item .legend-dot.group-orange'));
  assert.equal(doc.querySelector('[data-schedule-fallback]'), null, 'fallback text removed');
});

const course = (startDate, endDate, extra) => ({
  title: 'Skiskole ettermiddag', startDate, endDate, sessions: [session('Tirsdag', '17:30', '19:00')], ...extra,
});
const courseCards = (doc, view) => [...doc.querySelectorAll(`#schedule .${view} .session-card.group-skiskole`)];

test('treningsplan: a course in the current week shows, a past one or one skipping every week does not', async () => {
  const shown = await render({ trainingGroups: GROUPS, liftHours: LIFT, courses: [course('2000-01-01', '2999-12-31')] });
  for (const view of VIEWS) {
    const [card] = courseCards(shown, view);
    assert.equal(courseCards(shown, view).length, 1, view);
    assert.equal(card.closest('.lift-wrapper').querySelector('.lift-header').dataset.day, 'Tirsdag', view);
    assert.equal(card.querySelector('.s-group').textContent, 'Skiskole ettermiddag', view);
    assert.equal(card.getAttribute('href'), 'skiskole.html', view);
  }
  const allWeeks = Array.from({ length: 53 }, (_, i) => i + 1);
  for (const c of [course('2000-01-01', '2000-12-31'), course('2000-01-01', '2999-12-31', { skipWeeks: allWeeks })]) {
    const doc = await render({ trainingGroups: GROUPS, liftHours: LIFT, courses: [c] });
    for (const view of VIEWS) assert.equal(courseCards(doc, view).length, 0, view);
  }
});

test('treningsplan: the "Skiskole" legend entry appears only when a course is shown', async () => {
  const shown = await render({ trainingGroups: GROUPS, liftHours: LIFT, courses: [course('2000-01-01', '2999-12-31')] });
  assert.deepEqual(legend(shown), ['Grønn', 'Fun', 'Skiskole']);
  assert.ok(shown.querySelector('#schedule .legend-dot.group-skiskole'));
  const past = await render({ trainingGroups: GROUPS, liftHours: LIFT, courses: [course('2000-01-01', '2000-12-31')] });
  assert.deepEqual(legend(past), ['Grønn', 'Fun']);
});

const pre = (doc, view, d) => day(doc, view, d).querySelector('.lift-pre');
const tail = (doc, view, d) => day(doc, view, d).querySelector('.lift-tail')?.textContent;

test('treningsplan: a course before the lift opens gets a "Kun skiskole" piece; one after opening does not', async () => {
  const early = await render({ trainingGroups: GROUPS, liftHours: LIFT, courses: [course('2000-01-01', '2999-12-31')] });
  const late = await render({ trainingGroups: GROUPS, liftHours: LIFT, courses: [course('2000-01-01', '2999-12-31', { sessions: [session('Tirsdag', '18:15', '19:00')] })] });
  for (const view of VIEWS) {
    assert.equal(pre(early, view, 'Tirsdag').textContent, 'Kun skiskole 17:30 – 18:00', view);
    assert.equal(pre(early, view, 'Tirsdag').nextElementSibling, day(early, view, 'Tirsdag').querySelector('.lift-header'), view + ': before the lift label');
    assert.equal(pre(late, view, 'Tirsdag'), null, view);
    assert.equal(pre(early, view, 'Mandag'), null, view + ': groups never get one');
  }
});

test('treningsplan: the lift tail runs from the last session to closing; a closed day shows "Heis stengt"', async () => {
  const doc = await render({ trainingGroups: GROUPS, liftHours: LIFT });
  for (const view of VIEWS) {
    assert.equal(tail(doc, view, 'Mandag'), '19:30 – 20:00', view);
    assert.equal(tail(doc, view, 'Tirsdag'), undefined, view + ': no sessions, no tail');
    assert.equal(day(doc, view, 'Fredag').querySelector('.lift-header').textContent, 'Heis stengt', view);
    assert.ok(day(doc, view, 'Fredag').classList.contains('lift-closed'), view);
  }
});

test('treningsplan: a Sanity error or zero groups keeps the fallback', async () => {
  const fresh = new JSDOM(HTML).window.document.getElementById('schedule');
  for (const cms of [() => Promise.reject(new Error('offline')), { trainingGroups: [], liftHours: LIFT, courses: [course('2000-01-01', '2999-12-31')] }]) {
    const doc = await render(cms);
    assert.deepEqual(legend(doc), ['Grønn', 'Blå', 'Rød', 'Sort', 'Fun']);
    assert.equal(doc.querySelectorAll('#schedule .session-card').length, 0);
    const link = doc.querySelector('[data-schedule-fallback] a');
    assert.equal(link.textContent, 'Tider kommer — se treningsopplegg og Spond');
    assert.equal(link.getAttribute('href'), 'treningsopplegg.html');
    assert.equal(doc.querySelectorAll('#schedule .lift-header').length, fresh.querySelectorAll('.lift-header').length);
  }
});

test('treningsplan: the HTML fallback has no old group names and no session times', () => {
  const schedule = new JSDOM(HTML).window.document.getElementById('schedule');
  assert.doesNotMatch(schedule.textContent, /Rekrutten|Teknikeren|DSK Fun/);
  // The only times are the lift labels (025).
  const lift = [...schedule.querySelectorAll('.lift-header')].map((l) => l.textContent).join(' ');
  const times = (t) => t.match(/\d\d:\d\d/g) || [];
  assert.deepEqual(times(schedule.textContent), times(lift));
});
