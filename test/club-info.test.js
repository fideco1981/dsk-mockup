'use strict';

// Club info (ticket 031): the footer, signup links and the landing
// membership block render from the clubInfo singleton, with the hand-written
// values as fallback.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { makeDoc, stubFetch } = require('./helpers');
const site = require('../site');

const CLUB = {
  visitAddress: 'Skiveien 1',
  postAddress: 'Postboks 1, 3000 Drammen',
  orgNumber: '123 456 789',
  instagram: 'https://www.instagram.com/dsk_test',
  facebook: 'https://www.facebook.com/dsk_test',
  tiktok: 'https://www.tiktok.com/@dsk_test',
  spondSignup: 'https://club.spond.com/landing/signup/test',
  membershipText: 'Bli med i klubben!',
  membershipPoints: ['Gratis prøvetime', 'Ingen bindingstid', 'Hyggelige trenere'],
  contactPersons: [{ name: 'Kari Nordmann', role: 'Foreldrekontakt' }],
};

async function footer(cms) {
  const doc = makeDoc('om-oss');
  stubFetch(doc, cms);
  await site.init(doc);
  return doc;
}

const footerContact = (doc) =>
  [...doc.querySelectorAll('#site-footer .footer-col:last-child li')].map((li) => li.textContent);

test('club info: footer addresses follow Club info', async () => {
  const doc = await footer({ clubInfo: CLUB });
  const lines = footerContact(doc);
  assert.equal(lines[0], 'Skiveien 1');
  assert.equal(lines[1], 'Postboks 1, 3000 Drammen');
});

const socials = (doc) =>
  [...doc.querySelectorAll('#site-footer .social-btn')].map((a) => [a.getAttribute('aria-label'), a.getAttribute('href')]);

test('club info: footer social buttons follow Club info, one per network with a URL', async () => {
  const doc = await footer({ clubInfo: { ...CLUB, facebook: null, tiktok: '' } });
  assert.deepEqual(socials(doc), [['Instagram', 'https://www.instagram.com/dsk_test']]);
  const a = doc.querySelector('#site-footer .social-btn');
  assert.equal(a.getAttribute('target'), '_blank');
  assert.equal(a.getAttribute('rel'), 'noopener');
});

test('club info: a non-http(s) social URL is not rendered as a link', async () => {
  const doc = await footer({ clubInfo: { ...CLUB, instagram: 'javascript:alert(1)' } });
  assert.deepEqual(socials(doc).map((s) => s[0]), ['Facebook', 'TikTok']);
  assert.equal(doc.querySelector('#site-footer a[href^="javascript"]'), null);
});

const page = (name) => fs.readFileSync(path.join(__dirname, '..', name + '.html'), 'utf8');

async function render(name, cms) {
  const doc = new JSDOM(page(name)).window.document;
  stubFetch(doc, cms);
  await site.init(doc);
  return doc;
}

const SPOND_FALLBACK = 'https://club.spond.com/landing/signup/drammensk/form/79B423729D544EBABC46631C0E5DB0F3';

/** The signup links a visitor sees on a page, by their text. */
function signupLinks(doc) {
  const byText = (sel, re) => [...doc.querySelectorAll(sel)].filter((a) => re.test(a.textContent));
  return {
    nav: byText('#nav a.btn-nav', /Bli Medlem/),
    mobile: byText('#mobileMenu a', /Bli Medlem/),
    footer: byText('#site-footer a', /^Bli Medlem$/),
    hero: byText('.hero-ctas a', /Bli Medlem/),
    membership: byText('#membership a', /Meld deg inn nå/),
    training: byText('main a, body > section a', /Bli medlem & meld på/),
  };
}

test('club info: nav, hero, membership and footer signup links follow spondSignup', async () => {
  const doc = await render('index', { clubInfo: CLUB });
  const links = signupLinks(doc);
  for (const key of ['nav', 'mobile', 'footer', 'hero', 'membership']) {
    assert.equal(links[key].length, 1, `one ${key} signup link`);
    assert.equal(links[key][0].getAttribute('href'), CLUB.spondSignup, key);
  }
});

test('club info: the Treningsopplegg "Bli medlem & meld på" link follows spondSignup', async () => {
  const doc = await render('treningsopplegg', { clubInfo: CLUB });
  const [a] = signupLinks(doc).training;
  assert.ok(a, 'has the signup link');
  assert.equal(a.getAttribute('href'), CLUB.spondSignup);
});

const membershipText = (doc) => doc.querySelector('#membership h2 + p').textContent.trim();
const points = (doc) => doc.querySelector('#membership .membership-note').textContent
  .split('·').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean);

test('club info: the membership paragraph and points follow Club info, as text', async () => {
  const doc = await render('index', { clubInfo: { ...CLUB, membershipText: '<b>Bli med</b>' } });
  assert.equal(membershipText(doc), '<b>Bli med</b>');
  assert.equal(doc.querySelector('#membership b'), null);
  assert.deepEqual(points(doc), CLUB.membershipPoints);
  const note = doc.querySelector('#membership .membership-note');
  assert.equal(note.querySelectorAll('use[href="#icon-check"]').length, 3, 'a check icon per point');
  assert.ok(!note.hidden);
});

test('club info: with no membership points the note is hidden', async () => {
  const doc = await render('index', { clubInfo: { ...CLUB, membershipPoints: [] } });
  assert.ok(doc.querySelector('#membership .membership-note').hidden);
});

test('club info: on a rejected fetch, footer, CTAs and membership keep the fallback', async () => {
  const doc = await render('index', () => Promise.reject(new TypeError('offline')));
  assert.deepEqual(footerContact(doc).slice(0, 2), ['Blektjernveien 18', 'Postboks 2404, 3003 Drammen']);
  assert.deepEqual(socials(doc), [
    ['Instagram', 'https://www.instagram.com/drammenslalomklubb'],
    ['Facebook', 'https://www.facebook.com/drammenslalomklubb'],
    ['TikTok', 'https://www.tiktok.com/@drammen_slalomklubb'],
  ]);
  for (const [key, list] of Object.entries(signupLinks(doc))) {
    if (key !== 'training') assert.equal(list[0].getAttribute('href'), SPOND_FALLBACK, key);
  }
  assert.match(membershipText(doc), /^Meld deg inn i Drammen Slalåmklubb/);
  assert.deepEqual(points(doc), ['Første time gratis for barn 5-10 år', 'Ingen bindingstid']);
});

test('club info: a non-http(s) spondSignup keeps the fallback link', async () => {
  const doc = await render('index', { clubInfo: { ...CLUB, spondSignup: 'javascript:alert(1)' } });
  for (const [key, [a]] of Object.entries(signupLinks(doc))) {
    if (a) assert.equal(a.getAttribute('href'), SPOND_FALLBACK, key);
  }
});
