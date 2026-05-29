'use strict';

// Deploy-readiness audit for GitHub Pages (issue 003).
//
// The site is served from a SUBPATH (fideco1981.github.io/dsk-mockup/), so any
// absolute internal link (`/styles.css`, `/index.html`) silently breaks once
// deployed. These tests guard the two things that make the raw files safe to
// serve under that subpath as more pages are added (004-008):
//   - every internal link/asset reference is RELATIVE (user story 15)
//   - a `.nojekyll` marker disables Jekyll so files are served verbatim
//
// They scan the real deployable artifacts (the NAV_MODEL pages on disk plus
// the markup site.js injects), so a regression in any future page is caught
// here rather than on a board member's phone.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const site = require('../site');

const ROOT = path.join(__dirname, '..');

test('deploy: a .nojekyll marker is present so Pages serves files verbatim', () => {
  assert.ok(
    fs.existsSync(path.join(ROOT, '.nojekyll')),
    '.nojekyll must exist at repo root to disable Jekyll processing',
  );
});

// An href/src is "absolute internal" if it starts with a single "/" — that
// resolves to the domain root and skips the /dsk-mockup/ subpath. Protocol
// ("https:"), protocol-relative ("//"), fragment ("#"), mailto:/tel: and
// data: URIs are all fine.
function isAbsoluteInternal(url) {
  return url.startsWith('/') && !url.startsWith('//');
}

test('deploy: every internal NAV_MODEL link is relative (subpath-safe)', () => {
  for (const link of site.NAV_MODEL.links) {
    assert.ok(
      !isAbsoluteInternal(link.href),
      `nav link "${link.label}" must be relative, got "${link.href}"`,
    );
  }
});

// Every href="..."/src="..." value in a chunk of markup.
function attrUrls(markup) {
  const urls = [];
  const re = /(?:href|src)="([^"]*)"/g;
  let m;
  while ((m = re.exec(markup)) !== null) urls.push(m[1]);
  return urls;
}

// The deployable pages that actually exist on disk (others 404 until built).
const pages = site.NAV_MODEL.links
  .map((l) => l.href)
  .filter((href) => fs.existsSync(path.join(ROOT, href)));

for (const page of pages) {
  test(`deploy: ${page} has no absolute internal links`, () => {
    const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
    const bad = attrUrls(html).filter(isAbsoluteInternal);
    assert.deepEqual(bad, [], `${page} has absolute internal links: ${bad.join(', ')}`);
  });
}

test('deploy: injected nav + footer markup uses only relative links', () => {
  const markup = site.navHTML('index') + site.footerHTML();
  const bad = attrUrls(markup).filter(isAbsoluteInternal);
  assert.deepEqual(bad, [], `injected markup has absolute internal links: ${bad.join(', ')}`);
});
