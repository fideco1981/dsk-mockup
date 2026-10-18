'use strict';

// Integration test for kontakt.html — the club's contact/find-us page
// (issue 005). Loads the real HTML file, runs site.js against it, and
// asserts: the shared layout marks "Kontakt" active, the page renders the
// address / Postboks / org.nr / opening hours / social links / role-based
// contacts exactly per content-baseline.md, AND that personal phone /
// email details for any board member are masked behind a "kontakt via
// styret"-style affordance (same masking policy as styret.html per PRD).

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const site = require('../site');

const HTML = fs.readFileSync(
  path.join(__dirname, '..', 'kontakt.html'),
  'utf8',
);

function renderKontakt() {
  const doc = new JSDOM(HTML).window.document;
  site.init(doc);
  return doc;
}

// Role-based contacts from content-baseline.md → "Kontakt":
//   Chair/Teknisk Kenneth Larsen; Skiskole Jon Sæther; Sportslig
//   Alexandra Forbord; Rekrutten Line Kristin Hafsal; Teknikeren/DSK Fun
//   Erik Ullhaug Olsen; U12-14 Jon Sæther.
const ROLE_CONTACTS = [
  { roleHint: /styreleder|teknisk|leder/i, name: 'Kenneth Larsen' },
  { roleHint: /skiskole/i, name: 'Jon Sæther' },
  { roleHint: /sportslig/i, name: 'Alexandra Forbord' },
  { roleHint: /rekrutt/i, name: 'Line Kristin Hafsal' },
  { roleHint: /teknikeren|dsk\s*fun/i, name: 'Erik Ullhaug Olsen' },
  { roleHint: /u12/i, name: 'Jon Sæther' },
];

// Personal details that must NOT appear on the page. Parsed at test time
// from the gitignored content-baseline.md so this committed test file
// (public repo) carries no real phone/email. When the baseline is absent
// the leak loop is skipped via t.diagnostic — the masking affordance
// check still runs unconditionally.
const BASELINE = path.join(__dirname, '..', 'content-baseline.md');

function loadLeakedPII() {
  if (!fs.existsSync(BASELINE)) return null;
  const md = fs.readFileSync(BASELINE, 'utf8');
  const leaked = new Set();
  // Scrape the "Styret 2024–2025" table.
  const lines = md.split('\n');
  const start = lines.findIndex((l) => /^##\s+Styret/.test(l));
  if (start !== -1) {
    for (let i = start + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('## ')) break;
      if (!line.startsWith('|')) continue;
      const cols = line.split('|').map((c) => c.trim());
      if (cols.length < 6) continue;
      if (cols[1] === 'Role' || /^-+$/.test(cols[1])) continue;
      if (cols[3]) leaked.add(cols[3]);
      if (cols[4]) leaked.add(cols[4]);
    }
  }
  // Also pick up Erik Ullhaug Olsen's inline (phone, email) under "Kontakt".
  const inline = md.match(/\(([^)]*\d[^)]*@[^)]*)\)/g) || [];
  for (const m of inline) {
    const inner = m.slice(1, -1);
    for (const part of inner.split(',')) {
      const trimmed = part.trim();
      if (trimmed) leaked.add(trimmed);
    }
  }
  return leaked.size ? [...leaked] : null;
}

test('kontakt: Kontakt nav link is marked active after layout injection', () => {
  const doc = renderKontakt();
  const active = doc.querySelectorAll('#nav .nav-links a.active');
  assert.equal(active.length, 1, 'exactly one active nav link');
  assert.equal(active[0].textContent.trim(), 'Kontakt');
  assert.equal(active[0].getAttribute('aria-current'), 'page');
});

test('kontakt: address, Postboks, org.nr, and opening hours are shown', () => {
  const doc = renderKontakt();
  const text = doc.body.textContent;
  assert.ok(text.includes('Blektjernveien 18'), 'visiting address');
  assert.ok(text.includes('Postboks 2404'), 'postboks');
  assert.ok(/3003\s*DRAMMEN/i.test(text), 'postal code + drammen');
  assert.ok(text.includes('883 456 912'), 'org.nr');
  // Opening hours: Man–Tor 18:00–20:00; Fre stengt; helg 11:00–15:00.
  assert.ok(/18[:.]00\s*[–-]\s*20[:.]00/.test(text), 'weekday hours');
  assert.ok(/11[:.]00\s*[–-]\s*15[:.]00/.test(text), 'weekend hours');
  assert.ok(/fre[a-z]*\s*stengt|stengt\s*fre/i.test(text), 'friday closed');
});

test('kontakt: each role-based contact is listed with role + name', () => {
  const doc = renderKontakt();
  const text = doc.body.textContent;
  for (const { roleHint, name } of ROLE_CONTACTS) {
    assert.ok(text.includes(name), `lists contact name "${name}"`);
    assert.match(text, roleHint, `lists a matching role for "${name}"`);
  }
});

test('kontakt: Facebook and Instagram links are present', () => {
  const doc = renderKontakt();
  // After layout injection both footer + page may carry social links;
  // we just need at least one Instagram and one Facebook URL.
  const anchors = [...doc.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));
  assert.ok(
    anchors.some((h) => /instagram\.com\/drammenslalomklubb/i.test(h)),
    'links Instagram @drammenslalomklubb',
  );
  assert.ok(
    anchors.some((h) => /facebook\.com\/.*drammen|drammensk/i.test(h)),
    'links Facebook',
  );
});

test('kontakt: a TikTok social card links the club and shows the brand icon', () => {
  const doc = renderKontakt();
  const card = [...doc.querySelectorAll('.kontakt-social-card')].find(
    (a) => a.querySelector('.kontakt-social-label')?.textContent.trim() === 'TikTok',
  );
  assert.ok(card, 'has a TikTok card');
  assert.equal(card.getAttribute('href'), 'https://www.tiktok.com/@drammen_slalomklubb');
  assert.equal(card.querySelector('use').getAttribute('href'), '#icon-tiktok');
});

test('kontakt: personal phone numbers and emails are masked', (t) => {
  const doc = renderKontakt();
  const html = doc.documentElement.innerHTML;
  const leaked = loadLeakedPII();
  if (leaked) {
    for (const secret of leaked) {
      assert.ok(
        !html.includes(secret),
        `does not leak "${secret}"`,
      );
    }
  } else {
    t.diagnostic('content-baseline.md absent — PII leak check skipped (run locally with the baseline present)');
  }
  // Masking affordance must be present regardless: "kontakt via klubben"
  // or "kontakt via styret" — both are acceptable wordings.
  assert.match(
    doc.body.textContent.toLowerCase(),
    /kontakt via (styret|klubben)/,
    'offers a masked "kontakt via styret/klubben" affordance',
  );
});

test('kontakt: page has no absolute internal links (subpath-safe)', () => {
  // Belt-and-braces check on top of test/deploy.test.js, which already
  // auto-scans every NAV_MODEL page on disk.
  const bad = [];
  const re = /(?:href|src)="([^"]*)"/g;
  let m;
  while ((m = re.exec(HTML)) !== null) {
    const url = m[1];
    if (url.startsWith('/') && !url.startsWith('//')) bad.push(url);
  }
  assert.deepEqual(bad, [], `kontakt.html has absolute internal links: ${bad.join(', ')}`);
});

// Club info (ticket 032): Kontakt renders the facts, contact persons and
// social cards from the clubInfo singleton; the HTML is the fallback.
const { stubFetch } = require('./helpers');

const CLUB = {
  visitAddress: 'Skiveien 1',
  postAddress: 'Postboks 1, 3000 Drammen',
  orgNumber: '123 456 789',
  instagram: 'https://www.instagram.com/dsk_test',
  facebook: 'https://www.facebook.com/dsk_test',
  tiktok: 'https://www.tiktok.com/@dsk_test',
  spondSignup: 'https://club.spond.com/landing/signup/test',
  contactPersons: [
    { name: 'Kari Nordmann', role: 'Foreldrekontakt · U8' },
    { name: 'Ola', role: 'Skiskole' },
  ],
};

async function renderWith(respond) {
  const doc = new JSDOM(HTML).window.document;
  stubFetch(doc, respond);
  await site.init(doc);
  return doc;
}

const contactCards = (doc) =>
  [...doc.querySelectorAll('.kontakt-grid .board-card')].map((c) => [
    c.querySelector('.board-avatar').textContent,
    c.querySelector('.board-name').textContent,
    c.querySelector('.board-role').textContent,
    c.querySelector('.board-contact').textContent.trim(),
  ]);

test('kontakt: contact persons render in order from Club info', async () => {
  const doc = await renderWith({ clubInfo: CLUB });
  assert.deepEqual(contactCards(doc), [
    ['KN', 'Kari Nordmann', 'Foreldrekontakt · U8', 'kontakt via klubben'],
    ['O', 'Ola', 'Skiskole', 'kontakt via klubben'],
  ]);
});

const facts = (doc) =>
  [...doc.querySelectorAll('.kontakt-facts .fact-value')].slice(0, 3).map((n) => n.textContent);

test('kontakt: addresses and org number follow Club info', async () => {
  const doc = await renderWith({ clubInfo: CLUB });
  assert.deepEqual(facts(doc), ['Skiveien 1', 'Postboks 1, 3000 Drammen', '123 456 789']);
});

const socialCards = (doc) =>
  [...doc.querySelectorAll('.kontakt-social-card')].map((a) => [
    a.querySelector('.kontakt-social-label').textContent,
    a.getAttribute('href'),
  ]);

test('kontakt: social cards render only for networks with a URL; Spond follows spondSignup', async () => {
  const doc = await renderWith({ clubInfo: { ...CLUB, facebook: '', instagram: 'javascript:alert(1)' } });
  assert.deepEqual(socialCards(doc), [
    ['TikTok', 'https://www.tiktok.com/@dsk_test'],
    ['Spond', 'https://club.spond.com/landing/signup/test'],
  ]);
  for (const a of doc.querySelectorAll('.kontakt-social-card')) {
    assert.equal(a.getAttribute('target'), '_blank');
    assert.equal(a.getAttribute('rel'), 'noopener');
  }
});

test('kontakt: on a rejected fetch the fallback cards and values remain', async () => {
  const fallback = renderKontakt();
  const doc = await renderWith(() => Promise.reject(new Error('offline')));
  assert.deepEqual(facts(doc), facts(fallback));
  assert.equal(contactCards(doc).length, 6);
  assert.deepEqual(contactCards(doc), contactCards(fallback));
  assert.deepEqual(socialCards(doc), socialCards(fallback));
  assert.equal(socialCards(doc).length, 4);
});

test('kontakt: a contact role containing markup renders as text', async () => {
  const role = '<img src=x onerror="alert(1)">';
  const doc = await renderWith({ clubInfo: { ...CLUB, contactPersons: [{ name: 'Kari Nordmann', role }] } });
  assert.equal(doc.querySelector('.kontakt-grid .board-role').textContent, role);
  assert.equal(doc.querySelector('.kontakt-grid img'), null);
});

test('kontakt: PII-leak guard holds on the page rendered from Club info', async (t) => {
  const doc = await renderWith({ clubInfo: CLUB });
  const leaked = loadLeakedPII();
  if (!leaked) return t.diagnostic('content-baseline.md absent — PII leak check skipped');
  const html = doc.documentElement.innerHTML;
  for (const secret of leaked) assert.ok(!html.includes(secret), `does not leak "${secret}"`);
  assert.match(doc.body.textContent, /kontakt via klubben/);
});
