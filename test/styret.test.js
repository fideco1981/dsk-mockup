'use strict';

// Integration test for styret.html. Loads the real HTML file, runs site.js
// against it (as a browser would) with Sanity stubbed, and asserts the board
// renders from the CMS with personal contact details masked.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const site = require('../site');
const { stubFetch } = require('./helpers');

const HTML = fs.readFileSync(
  path.join(__dirname, '..', 'styret.html'),
  'utf8',
);

/** Load styret.html into a JSDOM document and run the shared layout engine. */
function renderStyret() {
  const doc = new JSDOM(HTML).window.document;
  site.init(doc);
  return doc;
}

/** Load styret.html with Sanity stubbed to `respond`, and wait for init. */
async function renderWithCms(respond) {
  const doc = new JSDOM(HTML, { url: 'https://example.com/' }).window.document;
  stubFetch(doc, respond);
  await site.init(doc);
  return doc;
}

const TERM = 'Valgt på årsmøtet 2026, sittende inntil årsmøtet 2027';

// A CMS board fixture in Studio order (made-up people).
const BOARD = [
  { name: 'Kari Nordmann', position: 'Styreleder' },
  { name: 'Ola Nordmann', position: 'Nestleder' },
  { name: 'Anne Vara Berg', position: 'Vara' },
  { name: 'Per Olav Hansen', position: 'Sportslig leder' },
  { name: 'Lise Lie', position: 'Styremedlem' },
  { name: 'Jon Dahl', position: 'Vara' },
];

/** Both board grids, [members, deputies]: null when hidden, else [{ initials, name, role, vara }]. */
function grids(doc) {
  return [...doc.querySelectorAll('.board-grid')].map((g) => (g.hidden ? null : [...g.querySelectorAll('.board-card')].map((c) => ({
    initials: c.querySelector('.board-avatar').textContent,
    name: c.querySelector('.board-name').textContent,
    role: c.querySelector('.board-role').textContent,
    vara: c.querySelector('.board-avatar').classList.contains('board-avatar-vara'),
  }))));
}

const varaHeading = (doc) => [...doc.querySelectorAll('h2')].find((h) => h.textContent === 'Varamedlemmer');
const termLine = (doc) => doc.querySelector('[data-board-term]');

// The "Styret" table of the gitignored content-baseline.md, as rows
// { role, name, phone, email }. This file lives in a PUBLIC repo, so it never
// embeds real phone numbers / emails. Null when the baseline is absent (e.g. a
// fresh clone); the leak check is then skipped and the masking check still runs.
const BASELINE = path.join(__dirname, '..', 'content-baseline.md');

function loadBaselineRows() {
  if (!fs.existsSync(BASELINE)) return null;
  const lines = fs.readFileSync(BASELINE, 'utf8').split('\n');
  const start = lines.findIndex(l => /^##\s+Styret/.test(l));
  if (start === -1) return null;
  const rows = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('## ')) break;
    if (!line.startsWith('|')) continue;
    const cols = line.split('|').map(c => c.trim());
    // cols: ['', Role, Name, Phone, Email, ''] — skip header and separator rows
    if (cols.length < 6) continue;
    if (cols[1] === 'Role' || /^-+$/.test(cols[1])) continue;
    rows.push({ role: cols[1], name: cols[2], phone: cols[3], email: cols[4] });
  }
  return rows.length ? rows : null;
}

test('styret: Styret nav link is marked active after layout injection', () => {
  const doc = renderStyret();
  const active = doc.querySelectorAll('#nav .nav-links a.active');
  assert.equal(active.length, 1, 'exactly one active nav link');
  assert.equal(active[0].textContent.trim(), 'Styret');
  assert.equal(active[0].getAttribute('aria-current'), 'page');
});

test('styret: members render in array order, split into board and Vara grids', async () => {
  const doc = await renderWithCms({ board: { term: TERM, members: BOARD } });
  const [members, deputies] = grids(doc);
  assert.deepEqual(members.map((m) => [m.name, m.role]), [
    ['Kari Nordmann', 'Styreleder'],
    ['Ola Nordmann', 'Nestleder'],
    ['Per Olav Hansen', 'Sportslig leder'],
    ['Lise Lie', 'Styremedlem'],
  ]);
  assert.deepEqual(deputies.map((m) => [m.name, m.role]), [['Anne Vara Berg', 'Vara'], ['Jon Dahl', 'Vara']]);
  assert.ok(deputies.every((m) => m.vara) && !members.some((m) => m.vara), 'deputy avatar style only on Vara');
  assert.ok(!varaHeading(doc).closest('[hidden]'), 'Vara subheading shown');
});

test('styret: initials come from the first and last word of the name', async () => {
  const doc = await renderWithCms({ board: { members: BOARD } });
  const [members] = grids(doc);
  assert.deepEqual(members.map((m) => m.initials), ['KN', 'ON', 'PH', 'LL']);
});

test('styret: with no Vara members, the Vara subheading and grid are hidden', async () => {
  const doc = await renderWithCms({ board: { term: TERM, members: BOARD.filter((m) => m.position !== 'Vara') } });
  const [members, deputies] = grids(doc);
  assert.equal(members.length, 4);
  assert.equal(deputies, null, 'Vara grid hidden');
  assert.ok(varaHeading(doc).closest('[hidden]'), 'Vara subheading hidden');
});

test('styret: the term line shows the term text', async () => {
  const doc = await renderWithCms({ board: { term: TERM, members: BOARD } });
  assert.equal(termLine(doc).textContent, TERM);
  assert.equal(termLine(doc).hidden, false);
});

test('styret: before Sanity answers, the board and term are hidden', () => {
  const doc = new JSDOM(HTML, { url: 'https://example.com/' }).window.document;
  stubFetch(doc, () => new Promise(() => {}));
  site.init(doc);
  assert.deepEqual(grids(doc), [null, null]);
  assert.ok(varaHeading(doc).closest('[hidden]'));
  assert.equal(termLine(doc).hidden, true);
});

test('styret: on a rejected fetch, the board grids and term line stay hidden', async () => {
  const doc = await renderWithCms(() => Promise.reject(new TypeError('offline')));
  assert.deepEqual(grids(doc), [null, null]);
  assert.ok(varaHeading(doc).closest('[hidden]'));
  assert.equal(termLine(doc).hidden, true);
  assert.equal(doc.querySelector('.page-hero-title').textContent, 'Styret', 'hero title stays');
  assert.ok(doc.querySelector('.board-note'), 'privacy note stays');
});

test('styret: a name and term containing markup render as text', async () => {
  const evil = '<img src=x onerror=alert(1)><b>Hei Du</b>';
  const doc = await renderWithCms({ board: { term: evil, members: [{ name: evil, position: 'Styreleder' }] } });
  const [members] = grids(doc);
  assert.equal(members[0].name, evil);
  assert.equal(termLine(doc).textContent, evil);
  assert.equal(doc.querySelector('main img, main b'), null);
});

test('styret: the subtitles claim no member counts', () => {
  const subs = [...renderStyret().querySelectorAll('.board .section-sub')].map((p) => p.textContent);
  assert.equal(subs.length, 2);
  for (const s of subs) assert.doesNotMatch(s, /\b(en|ett|to|tre|fire|fem|seks|sju|syv|åtte|ni|ti|\d+)\s+(styre|vara)medlem/i);
});

test('styret: personal phone numbers and emails are masked', async (t) => {
  // The baseline's own board goes through the CMS, so the guard checks the rendered cards.
  const rows = loadBaselineRows();
  const members = rows ? rows.map((r) => ({ name: r.name, position: r.role })) : BOARD;
  const doc = await renderWithCms({ board: { term: TERM, members } });
  const html = doc.documentElement.innerHTML;
  if (rows) {
    assert.ok(doc.body.textContent.includes(rows[0].name), 'the baseline board is rendered');
    for (const secret of rows.flatMap((r) => [r.phone, r.email]).filter(Boolean)) {
      assert.ok(!html.includes(secret), `does not leak "${secret}"`);
    }
  } else {
    t.diagnostic('content-baseline.md absent — PII leak check skipped (run locally with the baseline present)');
  }
  // Contact is routed via a masked affordance instead — checked unconditionally.
  assert.ok(
    doc.body.textContent.toLowerCase().includes('kontakt via styret'),
    'offers a masked "kontakt via styret" affordance',
  );
});
