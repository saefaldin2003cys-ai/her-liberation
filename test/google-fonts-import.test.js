'use strict';

/**
 * Task 3.3 — Smoke test: Google Fonts stylesheet present.
 *
 * Asserts that the new global font request loads the redesign trio via a single
 * Google Fonts `@import` (Plus Jakarta Sans + JetBrains Mono + IBM Plex Sans
 * Arabic with `display=swap`), and that the previous typefaces (Outfit and
 * Tajawal) no longer appear anywhere in `public/css/styles.css`.
 *
 * **Validates: Requirements 3.4**
 */

var test = require('node:test');
var assert = require('node:assert');

var harness = require('./helpers/dom-harness');

var FONT_FAMILIES = ['Plus+Jakarta+Sans', 'JetBrains+Mono', 'IBM+Plex+Sans+Arabic'];
var OLD_FONTS = ['Outfit', 'Tajawal'];

test('Google Fonts @import requests the redesign trio with display=swap', function () {
  var css = harness.readStylesCss();

  // Locate the Google Fonts @import statement.
  var importMatch = css.match(/@import\s+url\(\s*['"]?(https:\/\/fonts\.googleapis\.com\/css2[^'")]+)['"]?\s*\)\s*;/);
  assert.ok(importMatch, 'a Google Fonts css2 @import statement is present in styles.css');

  var importUrl = importMatch[1];

  // All three families must be requested in the single Google Fonts request.
  FONT_FAMILIES.forEach(function (family) {
    assert.ok(
      importUrl.indexOf('family=' + family) !== -1,
      'Google Fonts @import requests the "' + family.replace(/\+/g, ' ') + '" family (url: ' + importUrl + ')'
    );
  });

  // The request must opt into swap rendering.
  assert.ok(
    importUrl.indexOf('display=swap') !== -1,
    'Google Fonts @import uses display=swap (url: ' + importUrl + ')'
  );
});

test('old Outfit/Tajawal fonts are no longer present anywhere in styles.css', function () {
  var css = harness.readStylesCss();

  OLD_FONTS.forEach(function (oldFont) {
    var pattern = new RegExp(oldFont, 'i');
    assert.ok(
      !pattern.test(css),
      'styles.css no longer references the old "' + oldFont + '" font'
    );
  });
});
