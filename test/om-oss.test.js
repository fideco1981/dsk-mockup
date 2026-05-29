'use strict';

// Integration test for om-oss.html — the club's identity page (issue 004).
//
// Loads the real HTML file, runs site.js against it (as a browser would),
// and asserts the page consumes the shared layout correctly and presents the
// identity content per content-baseline.md: founding date 7 January 1936
// prominently, the "Norway's oldest pure alpine club" claim, the mission
// quote, the three named achievements, and the Haukåsløypa overview with
// unconfirmed stats treated as provisional (not stated as fact) per
// acceptance criterion 3 — those numbers are blocked on issue 009.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const site = require('../site');

const HTML = fs.readFileSync(
  path.join(__dirname, '..', 'om-oss.html'),
  'utf8',
);

function renderOmOss() {
  const doc = new JSDOM(HTML).window.document;
  site.init(doc);
  return doc;
}

test('om-oss: Om oss nav link is marked active after layout injection', () => {
  const doc = renderOmOss();
  const active = doc.querySelectorAll('#nav .nav-links a.active');
  assert.equal(active.length, 1, 'exactly one active nav link');
  assert.equal(active[0].textContent.trim(), 'Om oss');
  assert.equal(active[0].getAttribute('aria-current'), 'page');
});

test('om-oss: founding date 7. januar 1936 is presented prominently', () => {
  const doc = renderOmOss();
  const text = doc.body.textContent;
  // Allow either "7. januar 1936" or "7 januar 1936" — both Norwegian-correct.
  assert.match(text, /7\.?\s*januar\s*1936/i, 'mentions founding date');
});

test('om-oss: "Norway\'s oldest pure alpine club" claim is shown', () => {
  const doc = renderOmOss();
  const text = doc.body.textContent.toLowerCase();
  // The Norwegian framing: "eldste" (oldest) + an alpine/slalåm qualifier.
  assert.ok(text.includes('eldste'), 'mentions "eldste" (oldest)');
  assert.ok(
    text.includes('alpin') || text.includes('slalåm'),
    'qualifies the claim as alpine/slalåm-specific',
  );
});

test('om-oss: mission statement is shown', () => {
  const doc = renderOmOss();
  const text = doc.body.textContent;
  // The exact mission quote from content-baseline.md.
  assert.ok(
    text.includes('hovedaktør for utvikling av alpinidrett'),
    'renders the mission quote about being a "hovedaktør for utvikling av alpinidrett"',
  );
});

test('om-oss: three notable achievements/members are named', () => {
  const doc = renderOmOss();
  const text = doc.body.textContent;
  // From content-baseline.md "Achievements":
  for (const name of [
    'Hildegunn Meinstad',
    'Jørgen Brath',
    'Espen Theodorsen',
    'Trygve Brunsell',
  ]) {
    assert.ok(text.includes(name), `names "${name}"`);
  }
});

test('om-oss: unconfirmed Haukås numbers are not stated as fact', () => {
  const doc = renderOmOss();
  const text = doc.body.textContent;
  // The mockup-only stats are 500m length / 133m vertical / 47% gradient — not
  // confirmed on the live site. If ANY of these appear, they must be qualified
  // (provisional / pending / uavklart / ubekreftet / etc.) — verified by
  // having one of those qualifying words in the body. Easiest pass: omit them
  // entirely.
  const hasNumbers =
    /\b500\s*m\b/.test(text) || /\b133\s*m\b/.test(text) || /\b47\s*%/.test(text);
  if (hasNumbers) {
    const qualifiers =
      /(uavklart|ubekreftet|provisional|pending|ikke bekreftet|må bekreftes|venter bekreft|beregnet|målt|GPS|kml)/i;
    assert.match(
      text,
      qualifiers,
      'if Haukås mockup numbers are present they must be qualified as unconfirmed',
    );
  }
});

test('om-oss: Haukåsløypa is described as a multi-generation meeting place', () => {
  const doc = renderOmOss();
  const text = doc.body.textContent.toLowerCase();
  // "Haukåsløypa er et møtested for flere generasjoner." — the club's
  // own framing from the live site.
  assert.ok(text.includes('haukås'), 'mentions Haukåsløypa');
  assert.ok(
    text.includes('generasjon'),
    'frames it as a place for multiple generations',
  );
});
