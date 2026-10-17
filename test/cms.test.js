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

// ── Events (issue 014) ──

function eventsList(doc) {
  return doc.getElementById('events-list');
}

function cards(doc) {
  return [...eventsList(doc).querySelectorAll('.event-card')];
}

test('cms events: only upcoming events, nearest first, at most 3', async () => {
  const doc = makeDoc('index');
  stubFetch(doc, {
    topbar: { text: 'x' },
    events: [
      { title: 'Gammelt', date: '2000-01-01' },
      { title: 'D', date: '2999-04-01' },
      { title: 'B', date: '2999-02-01' },
      { title: 'A', date: '2999-01-15', startTime: '18:00' },
      { title: 'C', date: '2999-03-01' },
    ],
  });
  await site.init(doc);
  assert.ok(!eventsList(doc).hidden);
  const titles = cards(doc).map((c) => c.querySelector('h3.event-title').textContent);
  assert.equal(titles.length, 3);
  assert.match(titles[0], /^A — tirsdag 15\. januar 2999 kl\. 18:00$/);
  assert.match(titles[1], /^B — fredag 1\. februar 2999$/);
  assert.match(titles[2], /^C /);
  assert.ok(!eventsList(doc).textContent.includes('Fallback-arrangement'));
  const first = cards(doc)[0];
  assert.equal(first.querySelector('.event-date .day').textContent, '15');
  assert.equal(first.querySelector('.event-date .month').textContent, 'Jan');
});

test('cms events: rendered cards are not in the fade-in hidden state', async () => {
  const doc = makeDoc('index');
  stubFetch(doc, { events: [{ title: 'A', date: '2999-01-01' }] });
  await site.init(doc);
  const card = cards(doc)[0];
  assert.ok(!card.classList.contains('fade-in') || card.classList.contains('visible'));
});

test('cms events: chips render with their mapped colours', async () => {
  const doc = makeDoc('index');
  stubFetch(doc, { events: [{ title: 'A', date: '2999-01-01', chips: ['Renn', 'Gratis', 'Årsmøte', 'Medlemmer'] }] });
  await site.init(doc);
  const chips = [...cards(doc)[0].querySelectorAll('.event-chips .event-chip')];
  assert.deepEqual(
    chips.map((c) => [c.textContent, c.classList.contains('chip-blue') ? 'blue' : c.classList.contains('chip-orange') ? 'orange' : c.classList.contains('chip-green') ? 'green' : '?']),
    [['Renn', 'blue'], ['Gratis', 'orange'], ['Årsmøte', 'green'], ['Medlemmer', 'blue']],
  );
});

test('cms events: location line has the decorative pin, description and an http(s) link', async () => {
  const doc = makeDoc('index');
  stubFetch(doc, { events: [{ title: 'A', date: '2999-01-01', location: 'Haukåsløypa', description: 'Åpent for alle.', link: 'https://example.org/p' }] });
  await site.init(doc);
  const loc = cards(doc)[0].querySelector('.event-location');
  assert.equal(loc.querySelector('svg.icon').getAttribute('aria-hidden'), 'true');
  assert.match(loc.textContent, /Haukåsløypa — Åpent for alle\./);
  const a = loc.querySelector('a');
  assert.equal(a.getAttribute('href'), 'https://example.org/p');
  assert.equal(a.getAttribute('target'), '_blank');
  assert.equal(a.getAttribute('rel'), 'noopener');
});

test('cms events: a non-http(s) event link is not rendered', async () => {
  const doc = makeDoc('index');
  stubFetch(doc, { events: [{ title: 'A', date: '2999-01-01', link: 'javascript:alert(1)' }] });
  await site.init(doc);
  assert.equal(cards(doc)[0].querySelector('a'), null);
});

test('cms events: markup in event fields is rendered as text', async () => {
  const doc = makeDoc('index');
  const evil = '<img src=x onerror=alert(1)><b>hei</b>';
  stubFetch(doc, { events: [{ title: evil, date: '2999-01-01', location: evil, description: evil, chips: [evil] }] });
  await site.init(doc);
  assert.equal(eventsList(doc).querySelector('img, b'), null);
  assert.ok(cards(doc)[0].textContent.includes('<b>hei</b>'));
});

test('cms events: an empty list shows the "no upcoming events" message, not the fallback', async () => {
  const doc = makeDoc('index');
  stubFetch(doc, { events: [{ title: 'Gammelt', date: '2000-01-01' }] });
  await site.init(doc);
  assert.ok(!eventsList(doc).hidden);
  assert.equal(cards(doc).length, 0);
  assert.match(eventsList(doc).textContent, /Ingen kommende arrangementer/);
});

test('cms events: hidden while loading', () => {
  const doc = makeDoc('index');
  stubFetch(doc, () => new Promise(() => {}));
  site.init(doc);
  assert.ok(eventsList(doc).hidden);
});

test('cms events: a fetch failure reveals the fallback cards', async () => {
  for (const respond of [() => Promise.reject(new TypeError('offline')), () => Promise.resolve({ ok: false, status: 500, json: async () => ({}) }), { topbar: { text: 'x' }, events: 'nope' }]) {
    const doc = makeDoc('index');
    stubFetch(doc, respond);
    await site.init(doc);
    assert.ok(!eventsList(doc).hidden);
    assert.ok(eventsList(doc).textContent.includes('Fallback-arrangement'));
  }
});

test('cms events: malformed events are skipped, valid ones still render', async () => {
  const doc = makeDoc('index');
  stubFetch(doc, { events: [null, { title: 'Uten dato' }, { title: 'X', date: 'snart' }, { title: 'OK', date: '2999-01-01', chips: 'Renn' }] });
  await site.init(doc);
  assert.deepEqual(cards(doc).map((c) => c.querySelector('h3').textContent.split(' — ')[0]), ['OK']);
});

test('cms events: index.html has the events mount, hidden, with fallback cards and a noscript reveal', () => {
  const { JSDOM } = require('jsdom');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const doc = new JSDOM(html).window.document;
  const list = doc.getElementById('events-list');
  assert.ok(list && list.hidden);
  assert.ok(list.querySelectorAll('.event-card').length > 0);
  assert.match(html, /<noscript><style>[^<]*\.events-grid\[hidden\][^<]*<\/style><\/noscript>/);
});
