'use strict';

const { JSDOM } = require('jsdom');

/**
 * Build a minimal page document with the mount points site.js expects,
 * plus the body[data-page] marker. Returns the jsdom `document`.
 * @param {string} page - value for body[data-page]
 */
function makeDoc(page) {
  const dom = new JSDOM(
    `<!DOCTYPE html><html lang="no"><body data-page="${page}">
       <noscript><nav><a href="index.html">Hjem</a></nav></noscript>
       <div id="site-nav"></div>
       <main></main>
       <div id="site-footer"></div>
     </body></html>`,
    // A real origin is required for window.localStorage to be available
    // (opaque origins throw "localStorage is not available"). The path
    // doesn't matter — currentPage() prefers body[data-page] anyway.
    { url: 'https://example.com/dsk-mockup/' },
  );
  return dom.window.document;
}

module.exports = { makeDoc };
