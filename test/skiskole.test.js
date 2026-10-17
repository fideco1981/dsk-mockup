'use strict';

// Integration test for skiskole.html (issues 006, 024). Loads the real HTML,
// runs site.js against it, and checks the Ski school text and Courses from
// Sanity plus the hand-written fallback (the 2026/27 courses in docs/skiskole.pdf).

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { stubFetch } = require('./helpers');
const site = require('../site');

const HTML = fs.readFileSync(path.join(__dirname, '..', 'skiskole.html'), 'utf8');
const COURSES_URL = 'https://club.spond.com/landing/courses/drammensk';

/** Run site.js on the real page. `cms` is a Sanity result or a failing fetch. */
async function render(cms) {
  const doc = new JSDOM(HTML).window.document;
  if (cms !== undefined) stubFetch(doc, cms);
  await site.init(doc);
  return doc;
}

const cards = (doc) => [...doc.querySelectorAll('#courses .course-card')];
const titles = (doc) => cards(doc).map((c) => c.querySelector('.course-title').textContent);

const SCHOOL = {
  intro: 'Velkommen til skiskole.',
  age: '4–10 år (fylte 4 år per 1. januar 2027)',
  includes: ['Medlemskap', 'Sesongkort i Haukåsløypa'],
  equipment: 'Deltakerne må ha eget skiutstyr.',
  meetup: 'Møt opp 15 minutter før kursstart.',
  reservation: 'Minst 6 deltakere.',
};
const WEEKEND = {
  title: 'Helgekurs', signupDeadline: '2999-01-10', startDate: '2999-01-16', endDate: '2999-01-17',
  sessions: [{ day: 'Søndag', from: '10:00', to: '14:00' }, { day: 'Lørdag', from: '10:00', to: '14:00' }],
  price: '2 500 kr', link: 'https://club.spond.com/kurs', note: 'Tillegg 450 kr for å fortsette i treningsgruppe',
};
const ENDED = { title: 'Ferdig kurs', startDate: '2000-01-04', endDate: '2000-01-20', link: 'https://club.spond.com/old' };
const AFTERNOON = {
  title: 'Ettermiddag', startDate: '2000-01-05', endDate: '2999-01-22',
  sessions: [{ day: 'Torsdag', from: '17:30', to: '18:45' }, { day: 'Tirsdag', from: '17:30', to: '18:45' }],
  link: 'https://club.spond.com/ettermiddag',
};

test('skiskole: Skiskole nav link is marked active after layout injection', async () => {
  const doc = await render();
  const active = doc.querySelectorAll('#nav .nav-links a.active');
  assert.equal(active.length, 1, 'exactly one active nav link');
  assert.equal(active[0].textContent.trim(), 'Skiskole');
  assert.equal(active[0].getAttribute('aria-current'), 'page');
});

test('skiskole: the shared section renders from skiSchool; includes is a list', async () => {
  const doc = await render({ skiSchool: SCHOOL, courses: [] });
  const school = doc.getElementById('ski-school');
  assert.ok(!school.hidden);
  const text = school.textContent;
  for (const t of [SCHOOL.intro, SCHOOL.age, SCHOOL.equipment, SCHOOL.meetup, SCHOOL.reservation]) assert.ok(text.includes(t), t);
  assert.deepEqual([...school.querySelectorAll('ul li')].map((li) => li.textContent), SCHOOL.includes);
  assert.doesNotMatch(text, /1\. januar 2026|Henrik/, 'fallback text is gone');
});

test('skiskole: ended courses (2000) are left out; the rest are sorted by startDate', async () => {
  const doc = await render({ skiSchool: SCHOOL, courses: [WEEKEND, ENDED, AFTERNOON] });
  assert.deepEqual(titles(doc), ['Ettermiddag', 'Helgekurs']);
  assert.ok(!doc.getElementById('courses').hidden);
});

test('skiskole: zero unfinished courses shows "Ingen kurs" with the Spond link, not the fallback', async () => {
  for (const courses of [[], [ENDED], undefined]) {
    const doc = await render({ skiSchool: SCHOOL, courses });
    assert.equal(cards(doc).length, 0);
    const mount = doc.getElementById('courses');
    assert.ok(!mount.hidden);
    assert.match(mount.textContent, /Ingen kurs akkurat nå — følg med på Spond/);
    assert.equal(mount.querySelector('a').getAttribute('href'), COURSES_URL);
  }
});

test('skiskole: a card shows period, deadline, sessions Monday→Sunday, price, note and "Meld på"', async () => {
  const doc = await render({ skiSchool: SCHOOL, courses: [WEEKEND] });
  const [card] = cards(doc);
  const text = card.textContent;
  assert.match(text, /Periode: 16\. januar – 17\. januar 2999/);
  assert.match(text, /Påmeldingsfrist: 10\. januar 2999/);
  assert.deepEqual([...card.querySelectorAll('.course-session')].map((li) => li.textContent.trim()),
    ['Lørdag 10:00–14:00', 'Søndag 10:00–14:00']);
  assert.match(text, /Pris: 2 500 kr/);
  assert.equal(card.querySelector('.course-note').textContent, WEEKEND.note);
  const cta = card.querySelector('a.course-cta');
  assert.equal(cta.getAttribute('href'), WEEKEND.link);
  assert.match(cta.textContent, /Meld på/);
  assert.equal(cta.getAttribute('target'), '_blank');
});

test('skiskole: a card leaves out empty price, note and deadline; the period spans years', async () => {
  const doc = await render({ skiSchool: SCHOOL, courses: [AFTERNOON] });
  const [card] = cards(doc);
  assert.deepEqual([...card.querySelectorAll('.course-session')].map((li) => li.textContent.trim()),
    ['Tirsdag 17:30–18:45', 'Torsdag 17:30–18:45']);
  assert.match(card.textContent, /5\. januar 2000 – 22\. januar 2999/);
  assert.doesNotMatch(card.textContent, /Pris|Påmeldingsfrist|undefined|null/);
  assert.equal(card.querySelector('.course-note'), null);
});

test('skiskole: CMS markup renders as text; only http(s) links are rendered', async () => {
  const doc = await render({
    skiSchool: { ...SCHOOL, intro: '<b>Hei</b>', includes: ['<img src=x>'] },
    courses: [{ ...WEEKEND, title: '<i>Kurs</i>', note: '<script>x</script>', link: 'javascript:alert(1)' }],
  });
  const main = doc.querySelector('main');
  assert.equal(main.querySelector('b, img, i, script'), null);
  assert.match(main.textContent, /<b>Hei<\/b>/);
  assert.match(main.textContent, /<img src=x>/);
  assert.equal(titles(doc)[0], '<i>Kurs</i>');
  assert.equal(cards(doc)[0].querySelector('a'), null, 'no link for a javascript: URL');
});

// The 2026/27 courses in docs/skiskole.pdf (Spond snapshot, 17.10.2026).
const PDF_COURSES = [
  ['Skiskole ettermiddag uke 1-3 2027', '5. januar – 22. januar 2027', '1. januar 2027', 'Tirsdag', '2 950 kroner'],
  ['Helgekurs uke 2 2027', '16. januar – 17. januar 2027', '10. januar 2027', 'Lørdag', '2 500 kroner'],
  ['Skiskole ettermiddag uke 4-6 2027', '26. januar – 11. februar 2027', '24. januar 2027', 'Tirsdag', '2 950 kroner'],
  ['Helgekurs uke 4 2027', '30. januar – 31. januar 2027', '24. januar 2027', 'Lørdag', '2 500 kroner'],
  ['Skiskole ettermiddag uke 7,8 og 10, 2027', '16. februar – 11. mars 2027', '11. februar 2027', 'Tirsdag', '2 950 kroner'],
];

function assertFallback(doc) {
  assert.ok(!doc.getElementById('courses').hidden);
  assert.ok(!doc.getElementById('ski-school').hidden);
  assert.deepEqual(titles(doc), PDF_COURSES.map((c) => c[0]));
  cards(doc).forEach((card, i) => {
    const [, period, deadline, day, price] = PDF_COURSES[i];
    const text = card.textContent.replace(/\s+/g, ' ');
    assert.ok(text.includes('Periode: ' + period), period);
    assert.ok(text.includes('Påmeldingsfrist: ' + deadline), deadline);
    assert.ok(text.includes('Pris: ' + price), price);
    const sessions = [...card.querySelectorAll('.course-session')].map((li) => li.textContent.trim());
    assert.deepEqual(sessions, day === 'Tirsdag'
      ? ['Tirsdag 17:30–18:45', 'Torsdag 17:30–18:45'] : ['Lørdag 10:00–14:00', 'Søndag 10:00–14:00']);
    if (day === 'Lørdag') assert.match(text, /tillegg på 450 kroner.*Snøforbehold/);
    else assert.match(text, /minst 6 deltakere/);
    assert.equal(card.querySelector('a.course-cta').getAttribute('href'), COURSES_URL);
  });
  const school = doc.getElementById('ski-school').textContent.replace(/\s+/g, ' ');
  assert.match(school, /4–10 år \(fylte 4 år per 1\. januar 2027\)/);
  assert.match(school, /Medlemskap i Drammen Slalåmklubb for sesongen 2026–2027/);
  assert.match(school, /Sesongkort i Haukåsløypa/);
  assert.match(school, /Grønn/);
  assert.match(school, /Deltakerne må ha eget skiutstyr\./);
  assert.match(school, /Møt opp 15 minutter før kursstart\./);
}

test('skiskole: the fallback is the five 2026/27 courses from Spond (docs/skiskole.pdf)', async () => {
  assertFallback(await render());
});

test('skiskole: a fetch error, a non-OK answer or a missing skiSchool keeps the fallback', async () => {
  for (const cms of [
    () => Promise.reject(new Error('offline')),
    () => Promise.resolve({ ok: false, status: 500 }),
    { courses: [WEEKEND] },
    { skiSchool: null, courses: [WEEKEND] },
  ]) {
    assertFallback(await render(cms));
  }
});

test('skiskole: Ski school markup without .section-sub/.info-grid reveals the fallback instead of throwing', async () => {
  const doc = new JSDOM(HTML).window.document;
  doc.querySelectorAll('#ski-school .section-sub, #ski-school .info-grid').forEach((n) => n.remove());
  stubFetch(doc, { skiSchool: SCHOOL, courses: [WEEKEND] });
  await site.init(doc);
  assert.ok(!doc.getElementById('ski-school').hidden);
  assert.ok(!doc.getElementById('courses').hidden);
  assert.deepEqual(titles(doc), PDF_COURSES.map((c) => c[0]));
});

test('skiskole: courses and Ski school are hidden until the CMS answers, with a noscript reveal', () => {
  const doc = new JSDOM(HTML).window.document;
  assert.ok(doc.getElementById('courses').hidden);
  assert.ok(doc.getElementById('ski-school').hidden);
  assert.match(HTML, /<noscript><style>[^<]*#courses\[hidden\][^<]*#ski-school\[hidden\][^<]*<\/style><\/noscript>/);
});

// ── Studio schema (issue 024): course rules, driven without Sanity ──

/** A Rule stub recording required/min/max/integer; custom() returns its check. */
function rule() {
  const r = { req: false };
  r.required = () => { r.req = true; return r; };
  r.integer = () => { r.int = true; return r; };
  r.min = (n) => { r.lo = n; return r; };
  r.max = (n) => { r.hi = n; return r; };
  r.error = r.warning = () => r;
  r.custom = (fn) => fn;
  return r;
}

test('skiskole: the Studio rejects endDate before startDate, skipWeeks outside 1–53, and shares session rules', async () => {
  const { course } = await import('../studio/schemaTypes/course.js');
  const { trainingGroup } = await import('../studio/schemaTypes/trainingGroup.js');
  const field = (t, name) => t.fields.find((f) => f.name === name);

  assert.ok(field(course, 'title').validation(rule()).req);
  assert.ok(field(course, 'startDate').validation(rule()).req);
  const end = field(course, 'endDate').validation(rule());
  const ctx = { document: { startDate: '2027-01-05' } };
  assert.equal(end('2027-01-22', ctx), true);
  assert.equal(end('2027-01-05', ctx), true, 'same day is fine');
  assert.notEqual(end('2027-01-04', ctx), true, 'end before start');

  const week = field(course, 'skipWeeks').of[0].validation(rule());
  assert.deepEqual([week.int, week.lo, week.hi], [true, 1, 53]);

  assert.equal(field(course, 'sessions').of[0], field(trainingGroup, 'sessions').of[0], 'same session type');
});

test('skiskole: page has no absolute internal links (subpath-safe)', () => {
  const bad = [];
  const re = /(?:href|src)="([^"]*)"/g;
  let m;
  while ((m = re.exec(HTML)) !== null) {
    const url = m[1];
    if (url.startsWith('/') && !url.startsWith('//')) bad.push(url);
  }
  assert.deepEqual(bad, [], `skiskole.html has absolute internal links: ${bad.join(', ')}`);
});
