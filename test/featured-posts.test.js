'use strict';

// Featured posts (ticket 033): the landing page's "Følg oss" section shows
// hand-picked posts from Sanity as square image tiles, under the Instagram
// handle and a button per network from Club info. No fallback tiles.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { stubFetch } = require('./helpers');
const site = require('../site');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

async function landing(cms) {
  const doc = new JSDOM(html).window.document;
  stubFetch(doc, cms);
  await site.init(doc);
  return doc;
}

const section = (doc) => doc.querySelector('section.instagram');
const grid = (doc) => section(doc).querySelector('[data-featured-posts]');

const post = (n, order) => ({
  image: `https://cdn.sanity.io/images/p/d/${n}.jpg`,
  alt: `Innlegg ${n}`,
  link: `https://www.instagram.com/p/${n}/`,
  order,
});

test('featured posts: render sorted by order (unranked last), capped at six, each a new-tab link around an image with the alt text', async () => {
  const posts = [post(8, null), post(3, 30), post(1, 10), post(7, 70), post(2, 20), post(6, 60), post(5, 50), post(4, 40)];
  const doc = await landing({ featuredPosts: posts });
  assert.ok(!grid(doc).hidden);
  const imgs = [...grid(doc).querySelectorAll('img')];
  assert.deepEqual(imgs.map((i) => i.alt), [1, 2, 3, 4, 5, 6].map((n) => `Innlegg ${n}`));
  assert.match(imgs[0].getAttribute('src'), /^https:\/\/cdn\.sanity\.io\/images\/p\/d\/1\.jpg\?.*auto=format/);
  const a = imgs[0].closest('a');
  assert.equal(a.getAttribute('href'), 'https://www.instagram.com/p/1/');
  assert.equal(a.getAttribute('target'), '_blank');
  assert.equal(a.getAttribute('rel'), 'noopener');
});

const buttons = (doc) => [...section(doc).querySelectorAll('.social-btn')].map((a) => a.getAttribute('aria-label'));

test('featured posts: with zero posts, nothing valid or a rejected fetch, the grid is hidden and the buttons stay', async () => {
  const cases = [
    { featuredPosts: [] },
    { featuredPosts: [null, { alt: 'Uten bilde' }, { ...post(1), image: 'javascript:alert(1)' }, { ...post(2), alt: '' }] },
    () => Promise.reject(new TypeError('offline')),
  ];
  for (const cms of cases) {
    const doc = await landing(cms);
    assert.ok(grid(doc).hidden);
    assert.equal(grid(doc).querySelector('img'), null);
    assert.deepEqual(buttons(doc), ['Instagram', 'Facebook', 'TikTok']);
    assert.match(section(doc).querySelector('h2').textContent, /Følg oss/);
  }
});

test('featured posts: without JS the grid is hidden and no emoji placeholder tiles remain', () => {
  const doc = new JSDOM(html).window.document;
  assert.ok(grid(doc).hidden);
  assert.equal(grid(doc).children.length, 0);
  assert.doesNotMatch(section(doc).textContent, /\p{Extended_Pictographic}/u);
});

test('featured posts: tiles are not in the fade-in hidden state', async () => {
  const doc = await landing({ featuredPosts: [post(1, 1)] });
  for (let n = grid(doc).querySelector('img'); n; n = n.parentElement) {
    assert.ok(!n.classList.contains('fade-in') || n.classList.contains('visible'), n.className);
  }
});

test('featured posts: a non-http(s) link renders the image without a link', async () => {
  const doc = await landing({ featuredPosts: [{ ...post(1, 1), link: 'javascript:alert(1)' }] });
  const img = grid(doc).querySelector('img');
  assert.equal(img.alt, 'Innlegg 1');
  assert.equal(img.closest('a'), null);
  assert.equal(section(doc).querySelector('a[href^="javascript"]'), null);
});

test('følg oss: handle derived from the Instagram URL, one button per network with a URL', async () => {
  const doc = await landing({
    clubInfo: { instagram: 'https://www.instagram.com/dsk_test/', facebook: '', tiktok: 'https://www.tiktok.com/@dsk_tiktok' },
  });
  assert.equal(section(doc).querySelector('[data-instagram-handle]').textContent, '@dsk_test');
  assert.deepEqual(buttons(doc), ['Instagram', 'TikTok']);
  assert.equal(section(doc).querySelector('[aria-label="TikTok"]').getAttribute('href'), 'https://www.tiktok.com/@dsk_tiktok');
});

test('følg oss: fallback handle and TikTok button without the CMS', async () => {
  const doc = await landing(() => Promise.reject(new TypeError('offline')));
  assert.equal(section(doc).querySelector('[data-instagram-handle]').textContent, '@drammenslalomklubb');
  const tiktok = section(doc).querySelector('.social-btn[aria-label="TikTok"]');
  assert.match(tiktok.getAttribute('href'), /^https:\/\/www\.tiktok\.com\/@/);
  assert.ok(tiktok.querySelector('use[href="#icon-tiktok"]'));
});

test('featured posts: no breakpoint hides editor-picked tiles', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
  assert.doesNotMatch(css, /\.insta-tile:nth-child\([^)]*\)\s*\{[^}]*display:\s*none/);
});

// Crop and hotspot from Studio (screenshots cropped to the photo): the tile is
// the largest square inside the crop, centred on the hotspot as far as it fits.
test('featured posts: the tile follows the Studio crop and hotspot', async () => {
  const size = { width: 1000, height: 500 };
  const crop = { top: 0, bottom: 0, left: 0.1, right: 0 };
  const src = async (extra) => {
    const doc = await landing({ featuredPosts: [{ ...post(1, 1), size, ...extra }] });
    return new URL(grid(doc).querySelector('img').src).searchParams;
  };
  assert.equal((await src({ crop })).get('rect'), '300,0,500,500', 'centre of the crop');
  assert.equal((await src({ crop, hotspot: { x: 0.9, y: 0.5 } })).get('rect'), '500,0,500,500', 'hotspot, clamped to the crop');
  assert.equal((await src({ hotspot: { x: 0.2, y: 0.5 } })).get('rect'), '0,0,500,500');
  const plain = await src({});
  assert.equal(plain.get('rect'), null, 'no crop or hotspot: plain centre crop');
  assert.equal(plain.get('fit'), 'crop');
  assert.equal((await src({ size: undefined, crop })).get('rect'), null, 'no dimensions: plain centre crop');
});
