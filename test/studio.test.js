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
