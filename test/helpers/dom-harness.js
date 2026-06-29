'use strict';

/**
 * Test-only DOM harness.
 *
 * Loads the served `public/index.html` into a jsdom document so tests can query
 * markup (data-i18n keys, hook IDs/classes, structure) without a real browser,
 * and exposes the raw `public/css/styles.css` text for token/contrast parsing.
 *
 * IMPORTANT: This harness is for tests ONLY. It does not modify, build, or
 * bundle anything in `public/`. The served static site stays no-build and has
 * zero runtime dependencies; jsdom and fast-check are devDependencies used here
 * exclusively.
 *
 * By default page scripts are NOT executed (the runtime scripts fetch from the
 * backend and mutate the DOM). Pass `{ runScripts: true }` only for integration
 * smoke tests that intentionally need the ES5 behavior.
 */

var fs = require('fs');
var path = require('path');
var JSDOM = require('jsdom').JSDOM;

var PUBLIC_DIR = path.resolve(__dirname, '..', '..', 'public');
var INDEX_HTML_PATH = path.join(PUBLIC_DIR, 'index.html');
var STYLES_CSS_PATH = path.join(PUBLIC_DIR, 'css', 'styles.css');

/**
 * Read the raw, unmodified contents of public/index.html.
 * @returns {string}
 */
function readIndexHtml() {
  return fs.readFileSync(INDEX_HTML_PATH, 'utf8');
}

/**
 * Read the raw, unmodified contents of public/css/styles.css.
 * @returns {string}
 */
function readStylesCss() {
  return fs.readFileSync(STYLES_CSS_PATH, 'utf8');
}

/**
 * Load public/index.html into a jsdom instance.
 *
 * @param {Object} [options]
 * @param {boolean} [options.runScripts=false] when true, runs the page's
 *   inline/external scripts (use only for integration smoke tests).
 * @param {string}  [options.html] override HTML source (defaults to the real file).
 * @param {string}  [options.url='http://localhost/'] document URL.
 * @returns {{dom: JSDOM, window: Window, document: Document}}
 */
function loadIndexHtml(options) {
  options = options || {};
  var html = options.html !== undefined ? options.html : readIndexHtml();

  var dom = new JSDOM(html, {
    url: options.url || 'http://localhost/',
    runScripts: options.runScripts ? 'dangerously' : undefined,
    resources: undefined,
    pretendToBeVisual: true
  });

  return {
    dom: dom,
    window: dom.window,
    document: dom.window.document
  };
}

/**
 * Collect every `data-i18n` key present in a document, along with the element's
 * tag name and trimmed text content. Useful for the copy/key-preservation
 * property test.
 *
 * @param {Document} document
 * @returns {Array<{key:string, tag:string, text:string}>}
 */
function collectI18nKeys(document) {
  var nodes = document.querySelectorAll('[data-i18n]');
  var records = [];
  for (var i = 0; i < nodes.length; i++) {
    var el = nodes[i];
    records.push({
      key: el.getAttribute('data-i18n'),
      tag: el.tagName.toLowerCase(),
      text: (el.textContent || '').trim()
    });
  }
  return records;
}

module.exports = {
  PUBLIC_DIR: PUBLIC_DIR,
  INDEX_HTML_PATH: INDEX_HTML_PATH,
  STYLES_CSS_PATH: STYLES_CSS_PATH,
  readIndexHtml: readIndexHtml,
  readStylesCss: readStylesCss,
  loadIndexHtml: loadIndexHtml,
  collectI18nKeys: collectI18nKeys
};
