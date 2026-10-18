'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { makeDoc, stubFetch } = require('./helpers');
const site = require('../site');

const FALLBACK = 'Vi venter i spenning på snøen!';

function topbar(doc) {
  return doc.querySelector('.topbar-msg');
}

test('cms: after await init, the topbar shows the CMS text', async () => {
  const doc = makeDoc('index');
  const calls = stubFetch(doc, { topbar: { messages: [{ text: 'Renn på lørdag!' }], show: true }, events: [] });
  await site.init(doc);
  assert.equal(calls.length, 1, 'one query per page load');
  assert.match(calls[0], /^https:\/\/\w+\.api\.sanity\.io\//, 'live API, not apicdn');
  const msg = topbar(doc);
  assert.ok(!msg.hidden);
  assert.match(msg.textContent, /Renn på lørdag!/);
  assert.ok(!msg.textContent.includes(FALLBACK));
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
  stubFetch(doc, { topbar: { messages: [{ text: 'Meld deg på', link: 'https://example.org/x' }] } });
  await site.init(doc);
  const a = topbar(doc).querySelector('a');
  assert.equal(a.getAttribute('href'), 'https://example.org/x');
  assert.equal(a.getAttribute('target'), '_blank');
  assert.equal(a.getAttribute('rel'), 'noopener');
  assert.equal(a.textContent, 'Meld deg på');
});

test('cms: a non-http(s) link is not rendered', async () => {
  const doc = makeDoc('index');
  stubFetch(doc, { topbar: { messages: [{ text: 'Klikk', link: 'javascript:alert(1)' }] } });
  await site.init(doc);
  assert.equal(topbar(doc).querySelector('a'), null);
  assert.match(topbar(doc).textContent, /Klikk/);
});

test('cms: with the toggle off, the topbar message is hidden', async () => {
  const doc = makeDoc('index');
  stubFetch(doc, { topbar: { messages: [{ text: 'Skjult' }], show: false } });
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
  for (const result of [null, {}, { topbar: null }, { topbar: { messages: [] } }, { topbar: { messages: [{ text: 42 }, null] } }]) {
    const doc = makeDoc('index');
    stubFetch(doc, result);
    await site.init(doc);
    assert.ok(!topbar(doc).hidden, JSON.stringify(result));
    assert.ok(topbar(doc).textContent.includes(FALLBACK), JSON.stringify(result));
  }
});

test('cms: a CMS string containing markup is rendered as text', async () => {
  const doc = makeDoc('index');
  stubFetch(doc, { topbar: { messages: [{ text: '<img src=x onerror=alert(1)><b>hei</b>' }] } });
  await site.init(doc);
  assert.equal(topbar(doc).querySelector('img, b'), null);
  assert.ok(topbar(doc).textContent.includes('<b>hei</b>'));
});

test('cms: a non-landing page (no events mount) gets the CMS topbar', async () => {
  const doc = makeDoc('styret');
  stubFetch(doc, { topbar: { messages: [{ text: 'Årsmøte snart' }] }, events: [{ title: 'X', date: '2999-01-01' }] });
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
  for (const page of ['index', 'skiskole', 'treningsopplegg', 'trenere', 'om-oss', 'styret', 'kontakt']) {
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
    topbar: { messages: [{ text: 'x' }] },
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
  assert.deepEqual(titles, ['A', 'B', 'C']);
  const when = cards(doc).map((c) => c.querySelector('.event-when').textContent);
  assert.equal(when[0], 'tirsdag 15. januar 2999 kl. 18:00');
  assert.equal(when[1], 'fredag 1. februar 2999');
  assert.ok(!eventsList(doc).textContent.includes('Fallback-arrangement'));
  const first = cards(doc)[0];
  assert.equal(first.querySelector('.event-date .day').textContent, '15');
  assert.equal(first.querySelector('.event-date .month').textContent, 'Jan');
  assert.equal(cards(doc)[1].querySelector('.event-date .day').textContent, '1', 'no leading zero');
});

test('cms events: a multi-day event shows its date range and stays until its end date', async () => {
  const doc = makeDoc('index');
  const today = new Date();
  const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const yesterday = iso(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1));
  stubFetch(doc, {
    events: [
      { title: 'Pågår', date: yesterday, endDate: iso(today) },
      { title: 'BAMA', date: '2999-01-18', endDate: '2999-01-20', startTime: '17:00' },
      { title: 'Over månedsskiftet', date: '2999-01-30', endDate: '2999-02-01' },
    ],
  });
  await site.init(doc);
  const [ongoing, bama, cross] = cards(doc);
  assert.equal(ongoing.querySelector('h3.event-title').textContent, 'Pågår', 'still shown on its last day');
  assert.equal(bama.querySelector('.event-when').textContent, 'fredag 18.–søndag 20. januar 2999 kl. 17:00');
  assert.equal(bama.querySelector('.event-date .day').textContent, '18–20');
  assert.equal(bama.querySelector('.event-date .month').textContent, 'Jan');
  assert.equal(cross.querySelector('.event-when').textContent, 'onsdag 30. januar–fredag 1. februar 2999');
  assert.equal(cross.querySelector('.event-date .day').textContent, '30–1');
  assert.equal(cross.querySelector('.event-date .month').textContent, 'Jan–Feb');
});

test('cms events: an end date before or equal to the start date is ignored', async () => {
  const doc = makeDoc('index');
  stubFetch(doc, { events: [{ title: 'A', date: '2999-01-18', endDate: '2999-01-10' }, { title: 'B', date: '2999-01-19', endDate: '2999-01-19' }] });
  await site.init(doc);
  assert.deepEqual(cards(doc).map((c) => c.querySelector('.event-date .day').textContent), ['18', '19']);
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

test('cms events: pin line with the location, then the description, then the http(s) link, each on its own', async () => {
  const doc = makeDoc('index');
  stubFetch(doc, { events: [{ title: 'A', date: '2999-01-01', location: 'Haukåsløypa', description: 'Åpent for alle.', link: 'https://example.org/p' }] });
  await site.init(doc);
  const info = cards(doc)[0].querySelector('.event-info');
  const loc = info.querySelector('.event-location');
  assert.equal(loc.querySelector('svg.icon').getAttribute('aria-hidden'), 'true');
  assert.equal(loc.textContent, 'Haukåsløypa');
  assert.equal(info.querySelector('p.event-desc').textContent, 'Åpent for alle.');
  assert.deepEqual([...info.children].map((c) => c.className), ['event-title', 'event-when', 'event-location', 'event-desc', 'event-more']);
  const a = info.querySelector('.event-more a');
  assert.equal(a.textContent, 'Mer info →');
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
  for (const respond of [() => Promise.reject(new TypeError('offline')), () => Promise.resolve({ ok: false, status: 500, json: async () => ({}) }), { topbar: { messages: [{ text: 'x' }] }, events: 'nope' }]) {
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
  assert.deepEqual(cards(doc).map((c) => c.querySelector('h3').textContent), ['OK']);
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

// ── Sponsors (issue 021) ──

function strip(doc) {
  return doc.querySelector('#site-footer .sponsor-strip');
}

const SPONSORS = [
  { name: 'Skue Sparebank', url: 'https://www.skuesparebank.no', logo: 'https://cdn.sanity.io/images/p/d/a.png' },
  { name: 'Uten lenke', logo: 'https://cdn.sanity.io/images/p/d/b.png' },
];

test('cms sponsors: logos render in CMS order, linked in a new tab, alt = name', async () => {
  const doc = makeDoc('styret');
  stubFetch(doc, { sponsors: SPONSORS });
  await site.init(doc);
  assert.ok(!strip(doc).hidden);
  assert.match(strip(doc).querySelector('h4').textContent, /Takk til våre sponsorer/);
  const imgs = [...strip(doc).querySelectorAll('img')];
  assert.deepEqual(imgs.map((i) => i.alt), ['Skue Sparebank', 'Uten lenke']);
  assert.equal(imgs[0].getAttribute('src'), SPONSORS[0].logo + '?h=128&auto=format');
  const a = imgs[0].closest('a');
  assert.equal(a.getAttribute('href'), 'https://www.skuesparebank.no');
  assert.equal(a.getAttribute('target'), '_blank');
  assert.equal(a.getAttribute('rel'), 'noopener');
  assert.equal(imgs[1].closest('a'), null);
});

test('cms sponsors: hidden while loading, on failure and with nothing valid', async () => {
  const loading = makeDoc('index');
  stubFetch(loading, () => new Promise(() => {}));
  site.init(loading);
  assert.ok(strip(loading).hidden);
  for (const respond of [() => Promise.reject(new TypeError('offline')), {}, { sponsors: [] }, { sponsors: 'nope' },
    { sponsors: [null, { name: 'Uten logo' }, { name: 'X', logo: 'javascript:alert(1)' }, { logo: 'https://cdn.sanity.io/x.png' }] }]) {
    const doc = makeDoc('index');
    stubFetch(doc, respond);
    await site.init(doc);
    assert.ok(strip(doc).hidden, String(respond));
  }
});

test('cms sponsors: a non-http(s) url renders the logo without a link', async () => {
  const doc = makeDoc('index');
  stubFetch(doc, { sponsors: [{ ...SPONSORS[0], url: 'javascript:alert(1)' }] });
  await site.init(doc);
  assert.equal(strip(doc).querySelector('a'), null);
  assert.ok(strip(doc).querySelector('img'));
});

test('cms sponsors: logos that fit stay a static row with no copy', async () => {
  const doc = makeDoc('index');
  stubFetch(doc, { sponsors: SPONSORS });
  await site.init(doc); // JSDOM has no layout: every width is 0, so it "fits"
  assert.ok(!strip(doc).classList.contains('is-scrolling'));
  assert.equal(strip(doc).querySelectorAll('.sponsor-set').length, 1);
});

test('cms sponsors: overflowing logos scroll, and the copy is hidden from screen readers and Tab', async () => {
  const doc = makeDoc('index');
  const proto = doc.defaultView.HTMLElement.prototype;
  Object.defineProperty(proto, 'offsetWidth', { get() { return this.classList.contains('sponsor-set') ? 800 : 0; } });
  let viewport = 375;
  Object.defineProperty(proto, 'clientWidth', { get() { return this.classList.contains('sponsor-viewport') ? viewport : 0; } });
  stubFetch(doc, { sponsors: SPONSORS });
  await site.init(doc);
  assert.ok(strip(doc).classList.contains('is-scrolling'));
  const sets = [...strip(doc).querySelectorAll('.sponsor-set')];
  assert.equal(sets.length, 2);
  assert.equal(sets[0].getAttribute('aria-hidden'), null);
  assert.equal(sets[1].getAttribute('aria-hidden'), 'true');
  assert.equal(sets[1].querySelector('a').tabIndex, -1);
  assert.equal(strip(doc).querySelector('.sponsor-track').style.getPropertyValue('--sponsor-duration'), '20s');
  // A resize back to "fits" drops the copy and the marquee.
  viewport = 2000;
  doc.defaultView.dispatchEvent(new doc.defaultView.Event('resize'));
  assert.ok(!strip(doc).classList.contains('is-scrolling'));
  assert.equal(strip(doc).querySelectorAll('.sponsor-set').length, 1);
});

test('cms sponsors: the query sorts sponsors by their order field', async () => {
  const doc = makeDoc('index');
  const calls = stubFetch(doc, {});
  await site.init(doc);
  assert.match(decodeURIComponent(calls[0]), /_type == "sponsor"\] \| order\(order asc\)/);
});

// ── Topbar rotation (issue 022) ──

// Capture the rotation timer instead of waiting 5 s; run fades instantly.
function stubTimers(doc) {
  const ticks = [];
  doc.defaultView.setInterval = (fn) => ticks.push(fn);
  doc.defaultView.setTimeout = (fn) => fn();
  return () => ticks.forEach((fn) => fn());
}

const TWO = { topbar: { show: true, messages: [{ text: 'Første' }, { text: 'Andre', link: 'https://example.org/2' }] } };

test('cms topbar: several messages rotate in Studio order and wrap around', async () => {
  const doc = makeDoc('index');
  const tick = stubTimers(doc);
  stubFetch(doc, TWO);
  await site.init(doc);
  assert.match(topbar(doc).textContent, /Første/);
  tick();
  assert.match(topbar(doc).textContent, /Andre/);
  assert.equal(topbar(doc).querySelector('a').getAttribute('href'), 'https://example.org/2');
  assert.ok(topbar(doc).querySelector('svg.icon'), 'icon survives the swap');
  tick();
  assert.match(topbar(doc).textContent, /Første/);
});

test('cms topbar: the pause button, hover and focus each stop the rotation', async () => {
  for (const pauseWith of ['button', 'mouseenter', 'focusin']) {
    const doc = makeDoc('index');
    const tick = stubTimers(doc);
    stubFetch(doc, TWO);
    await site.init(doc);
    const button = doc.querySelector('.topbar-pause');
    assert.ok(!button.hidden);
    if (pauseWith === 'button') button.dispatchEvent(new doc.defaultView.Event('click'));
    else doc.querySelector('.topbar').dispatchEvent(new doc.defaultView.Event(pauseWith));
    if (pauseWith === 'button') assert.equal(button.getAttribute('aria-pressed'), 'true');
    tick();
    assert.match(topbar(doc).textContent, /Første/, pauseWith);
  }
});

test('cms topbar: one message, or the toggle off, means no rotation and no pause button', async () => {
  for (const result of [{ topbar: { messages: [{ text: 'Bare én' }] } }, { topbar: { ...TWO.topbar, show: false } }]) {
    const doc = makeDoc('index');
    let timers = 0;
    doc.defaultView.setInterval = () => { timers++; };
    stubFetch(doc, result);
    await site.init(doc);
    assert.equal(timers, 0);
    assert.ok(doc.querySelector('.topbar-pause').hidden);
  }
});

test('cms topbar: the message is not a live region', async () => {
  const doc = makeDoc('index');
  stubTimers(doc);
  stubFetch(doc, TWO);
  await site.init(doc);
  assert.equal(doc.querySelector('.topbar [aria-live]'), null);
});
