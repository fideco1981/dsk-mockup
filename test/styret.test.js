'use strict';

// Integration test for styret.html — the tracer for the "new page" pattern.
// Loads the real HTML file, runs site.js against it (as a browser would),
// and asserts the page consumes the shared layout correctly and renders the
// board per content-baseline.md with personal contact details masked.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const site = require('../site');

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

// The board, straight from content-baseline.md → "Styret 2024–2025".
const BOARD = [
  { role: 'Styreleder', name: 'Kenneth Larsen' },
  { role: 'Nestleder', name: 'Kristian Marheim' },
  { role: 'Sportslig leder', name: 'Alexandra Forbord' },
  { role: 'Styremedlem', name: 'Line Kristin Hafsal' },
  { role: 'Styremedlem', name: 'Henrik Bentsrud' },
  { role: 'Styremedlem', name: 'Jon Sæther' },
  { role: 'Styremedlem', name: 'Jarl Andre Møller' },
  { role: 'Styremedlem', name: 'Bent Hagberg' },
  { role: 'Vara', name: 'Karianne Nordahl' },
  { role: 'Vara', name: 'Henrik Hagberg' },
];

// Personal details that must NOT appear on the page. Parsed from the
// gitignored content-baseline.md at test time so this file (which lives in
// a PUBLIC repo) never embeds real phone numbers / emails. When the baseline
// is absent (e.g. a fresh clone without the local content drop), the leak
// check is skipped — the masking-affordance check still runs.
const BASELINE = path.join(__dirname, '..', 'content-baseline.md');

function loadLeakedFromBaseline() {
  if (!fs.existsSync(BASELINE)) return null;
  const md = fs.readFileSync(BASELINE, 'utf8');
  // Locate the "Styret 2024–2025" markdown table; columns: Role | Name | Phone | Email
  const lines = md.split('\n');
  const start = lines.findIndex(l => /^##\s+Styret/.test(l));
  if (start === -1) return null;
  const leaked = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('## ')) break;
    if (!line.startsWith('|')) continue;
    const cols = line.split('|').map(c => c.trim());
    // cols: ['', Role, Name, Phone, Email, ''] — skip header and separator rows
    if (cols.length < 6) continue;
    if (cols[1] === 'Role' || /^-+$/.test(cols[1])) continue;
    if (cols[3]) leaked.push(cols[3]);
    if (cols[4]) leaked.push(cols[4]);
  }
  return leaked.length ? leaked : null;
}

test('styret: Styret nav link is marked active after layout injection', () => {
  const doc = renderStyret();
  const active = doc.querySelectorAll('#nav .nav-links a.active');
  assert.equal(active.length, 1, 'exactly one active nav link');
  assert.equal(active[0].textContent.trim(), 'Styret');
  assert.equal(active[0].getAttribute('aria-current'), 'page');
});

test('styret: every board member is rendered with name and role', () => {
  const doc = renderStyret();
  const text = doc.body.textContent;
  for (const { name, role } of BOARD) {
    assert.ok(text.includes(name), `renders board member "${name}"`);
    assert.ok(text.includes(role), `renders role "${role}"`);
  }
});

test('styret: personal phone numbers and emails are masked', (t) => {
  const doc = renderStyret();
  const html = doc.documentElement.innerHTML;
  const leaked = loadLeakedFromBaseline();
  if (leaked) {
    for (const secret of leaked) {
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

test('styret: season line clarifies the board is sitting until the 2026 årsmøte', () => {
  const doc = renderStyret();
  const text = doc.body.textContent;
  // Per issue 009: same board still applies. The "2024–2025" line stays
  // (that's the season they were elected for) but a note explains they
  // remain seated until the next årsmøte on 25 March 2026.
  assert.match(
    text,
    /sittende.*(25.\s*mars|årsmøte).*(2026)/i,
    'styret season line must indicate the board sits until the 25 March 2026 årsmøte',
  );
});
