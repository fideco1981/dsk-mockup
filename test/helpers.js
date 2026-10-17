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

/**
 * Stub `fetch` on the document's window so init(doc) never calls the real
 * Sanity. `respond` is either a Sanity `result` object (served as a 200 JSON
 * response), or a function `(url) => Promise<Response-like>` for failures.
 * Returns the list of URLs fetched.
 */
function stubFetch(doc, respond) {
  const calls = [];
  doc.defaultView.fetch = (url) => {
    calls.push(String(url));
    if (typeof respond === 'function') return respond(url);
    return Promise.resolve({ ok: true, json: async () => ({ result: respond }) });
  };
  return calls;
}

module.exports = { makeDoc, stubFetch };
