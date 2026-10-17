'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { makeDoc, stubFetch } = require('./helpers');
const site = require('../site');

const FALLBACK = 'Sesong 2025/26 er i gang!';

function topbar(doc) {
  return doc.querySelector('.topbar-msg');
}

test('cms: after await init, the topbar shows the CMS text', async () => {
  const doc = makeDoc('index');
  const calls = stubFetch(doc, { topbar: { text: 'Renn på lørdag!', show: true }, events: [] });
  await site.init(doc);
  assert.equal(calls.length, 1, 'one query per page load');
  assert.match(calls[0], /^https:\/\/\w+\.api\.sanity\.io\//, 'live API, not apicdn');
  const msg = topbar(doc);
  assert.ok(!msg.hidden);
  assert.match(msg.textContent, /Renn på lørdag!/);
  assert.doesNotMatch(msg.textContent, /Sesong 2025\/26/);
  assert.equal(msg.querySelector('svg.icon').getAttribute('aria-hidden'), 'true');
});

test('cms: the topbar message is hidden until the response arrives', () => {
  const doc = makeDoc('index');
  stubFetch(doc, () => new Promise(() => {}));
  site.init(doc);
  assert.ok(topbar(doc).hidden);
});

test('cms: an http(s) link opens in a new tab with rel=noopener', async () => {
  const doc = makeDoc('index');
  stubFetch(doc, { topbar: { text: 'Meld deg på', link: 'https://example.org/x' } });
  await site.init(doc);
  const a = topbar(doc).querySelector('a');
  assert.equal(a.getAttribute('href'), 'https://example.org/x');
  assert.equal(a.getAttribute('target'), '_blank');
  assert.equal(a.getAttribute('rel'), 'noopener');
  assert.equal(a.textContent, 'Meld deg på');
});

test('cms: a non-http(s) link is not rendered', async () => {
  const doc = makeDoc('index');
  stubFetch(doc, { topbar: { text: 'Klikk', link: 'javascript:alert(1)' } });
  await site.init(doc);
  assert.equal(topbar(doc).querySelector('a'), null);
  assert.match(topbar(doc).textContent, /Klikk/);
});

test('cms: with the toggle off, the topbar message is hidden', async () => {
  const doc = makeDoc('index');
  stubFetch(doc, { topbar: { text: 'Skjult', show: false } });
  await site.init(doc);
  assert.ok(topbar(doc).hidden);
});

test('cms: a fetch rejection reveals the fallback text', async () => {
  const doc = makeDoc('index');
  stubFetch(doc, () => Promise.reject(new TypeError('offline')));
  await site.init(doc);
  assert.ok(!topbar(doc).hidden);
  assert.match(topbar(doc).textContent, new RegExp(FALLBACK.replace(/[/]/g, '\\/')));
});

test('cms: a non-OK response reveals the fallback text', async () => {
  const doc = makeDoc('index');
  stubFetch(doc, () => Promise.resolve({ ok: false, status: 500, json: async () => ({}) }));
  await site.init(doc);
  assert.ok(!topbar(doc).hidden);
  assert.ok(topbar(doc).textContent.includes(FALLBACK));
});

test('cms: malformed data reveals the fallback text', async () => {
  for (const result of [null, {}, { topbar: null }, { topbar: { text: 42 } }]) {
    const doc = makeDoc('index');
    stubFetch(doc, result);
    await site.init(doc);
    assert.ok(!topbar(doc).hidden, JSON.stringify(result));
    assert.ok(topbar(doc).textContent.includes(FALLBACK), JSON.stringify(result));
  }
});

test('cms: a CMS string containing markup is rendered as text', async () => {
  const doc = makeDoc('index');
  stubFetch(doc, { topbar: { text: '<img src=x onerror=alert(1)><b>hei</b>' } });
  await site.init(doc);
  assert.equal(topbar(doc).querySelector('img, b'), null);
  assert.ok(topbar(doc).textContent.includes('<b>hei</b>'));
});

test('cms: a non-landing page (no events mount) gets the CMS topbar', async () => {
  const doc = makeDoc('styret');
  stubFetch(doc, { topbar: { text: 'Årsmøte snart' }, events: [{ title: 'X', date: '2999-01-01' }] });
  await site.init(doc);
  assert.match(topbar(doc).textContent, /Årsmøte snart/);
});

test('cms: without fetch (old browser / plain JSDOM) the fallback is revealed', async () => {
  const doc = makeDoc('index');
  doc.defaultView.fetch = undefined; // explicit, in case a future JSDOM ships fetch
  await site.init(doc);
  assert.ok(!topbar(doc).hidden);
  assert.ok(topbar(doc).textContent.includes(FALLBACK));
});

test('cms: site.js contains no Sanity token', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'site.js'), 'utf8');
  // Sanity tokens start with "sk" followed by a long alphanumeric run.
  assert.doesNotMatch(src, /\bsk[A-Za-z0-9]{40,}/, 'no Sanity token literal');
  assert.doesNotMatch(src, /authorization|bearer/i, 'no auth header');
});

test('cms: a synchronous fetch throw reveals the fallback text', async () => {
  const doc = makeDoc('index');
  stubFetch(doc, () => { throw new TypeError('bad url'); });
  await site.init(doc);
  assert.ok(!topbar(doc).hidden);
  assert.ok(topbar(doc).textContent.includes(FALLBACK));
});

test('cms: every page shows the fallback topbar to <noscript> visitors', () => {
  const { JSDOM } = require('jsdom');
  for (const page of ['index', 'skiskole', 'treningsopplegg', 'om-oss', 'styret', 'kontakt']) {
    const html = fs.readFileSync(path.join(__dirname, '..', `${page}.html`), 'utf8');
    // JSDOM without runScripts parses <noscript> content as a no-JS browser does.
    const msg = new JSDOM(html).window.document.querySelector('noscript .topbar .topbar-msg');
    assert.ok(msg, `${page}: noscript topbar`);
    assert.ok(msg.textContent.includes(FALLBACK), `${page}: fallback text`);
  }
});
