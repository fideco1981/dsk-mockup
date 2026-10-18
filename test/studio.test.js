'use strict';

// The Studio's left menu is a hand-written structure, so a new schema type
// doesn't show up there by itself. Fails until the type is added to it.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('studio: every schema type is in the left menu (sanity.config.js structure)', async () => {
  const { schemaTypes } = await import('../studio/schemaTypes/index.js');
  const config = fs.readFileSync(path.join(__dirname, '..', 'studio', 'sanity.config.js'), 'utf8');
  for (const { name } of schemaTypes) {
    assert.ok(
      config.includes(`'${name}'`) || config.includes(`${name}.name`),
      `"${name}" is missing from the Studio structure in sanity.config.js`,
    );
  }
});

// "Hent bilde fra TikTok" (featured posts): the cover image via TikTok's oEmbed.
test('studio: tiktokThumbnail fetches the cover image of a TikTok link via oEmbed', async () => {
  const { tiktokThumbnail } = await import('../studio/tiktok.js');
  const link = 'https://www.tiktok.com/@dsk/video/123?is_from_webapp=1';
  const calls = [];
  const blob = new Blob(['jpg'], { type: 'image/jpeg' });
  const fetch = async (url) => {
    calls.push(String(url));
    if (calls.length === 1) return { ok: true, json: async () => ({ thumbnail_url: 'https://cdn.example/cover.jpg' }) };
    return { ok: true, blob: async () => blob };
  };
  assert.equal(await tiktokThumbnail(link, fetch), blob);
  assert.equal(calls[0], 'https://www.tiktok.com/oembed?url=' + encodeURIComponent(link));
  assert.equal(calls[1], 'https://cdn.example/cover.jpg');
});

test('studio: tiktokThumbnail explains in Norwegian what went wrong', async () => {
  const { tiktokThumbnail } = await import('../studio/tiktok.js');
  const never = async () => { throw new Error('should not fetch'); };
  await assert.rejects(tiktokThumbnail('https://www.instagram.com/p/x/', never), /TikTok-lenke/);
  await assert.rejects(tiktokThumbnail('', never), /TikTok-lenke/);
  const noThumb = async () => ({ ok: true, json: async () => ({ type: 'rich' }) });
  await assert.rejects(tiktokThumbnail('https://www.tiktok.com/@dsk', noThumb), /fant ikke/i);
  const down = async () => ({ ok: false, status: 400 });
  await assert.rejects(tiktokThumbnail('https://www.tiktok.com/@dsk/video/1', down), /fant ikke/i);
});
