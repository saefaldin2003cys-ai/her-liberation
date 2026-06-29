'use strict';

/**
 * Self-check for the test harness (Task 1.1). Verifies the jsdom loader and the
 * pure token/contrast helpers work as intended. These are not feature tests;
 * they only confirm the harness foundation is sound for later tasks.
 */

var test = require('node:test');
var assert = require('node:assert');

var harness = require('./helpers/dom-harness');
var contrast = require('./helpers/contrast');

test('loadIndexHtml loads the real public/index.html into jsdom', function () {
  var ctx = harness.loadIndexHtml();
  assert.ok(ctx.document, 'a document is produced');
  // Default document language/direction set by the markup (Arabic RTL default).
  assert.strictEqual(ctx.document.documentElement.getAttribute('lang'), 'ar');
  assert.strictEqual(ctx.document.documentElement.getAttribute('dir'), 'rtl');
  ctx.window.close();
});

test('loadIndexHtml does not execute page scripts by default', function () {
  var ctx = harness.loadIndexHtml();
  // Scripts that would fetch from the backend must not run in the default harness.
  assert.ok(ctx.document.querySelector('script'), 'script tags are present in markup');
  ctx.window.close();
});

test('collectI18nKeys returns data-i18n records from the page', function () {
  var ctx = harness.loadIndexHtml();
  var keys = harness.collectI18nKeys(ctx.document);
  assert.ok(Array.isArray(keys));
  assert.ok(keys.length > 0, 'the page contains data-i18n keys');
  assert.ok(keys.every(function (k) { return typeof k.key === 'string' && k.key.length > 0; }));
  ctx.window.close();
});

test('readStylesCss returns the raw stylesheet text', function () {
  var css = harness.readStylesCss();
  assert.strictEqual(typeof css, 'string');
  assert.ok(css.indexOf(':root') !== -1, 'stylesheet contains a :root token block');
});

test('parseColor handles hex, short hex, and rgba forms', function () {
  assert.deepStrictEqual(contrast.parseColor('#ffffff'), { r: 255, g: 255, b: 255, a: 1 });
  assert.deepStrictEqual(contrast.parseColor('#000'), { r: 0, g: 0, b: 0, a: 1 });
  var rgba = contrast.parseColor('rgba(236, 72, 153, 0.5)');
  assert.strictEqual(rgba.r, 236);
  assert.strictEqual(rgba.g, 72);
  assert.strictEqual(rgba.b, 153);
  assert.ok(Math.abs(rgba.a - 0.5) < 1e-9);
  assert.strictEqual(contrast.parseColor('var(--nope)'), null);
});

test('contrastRatio matches known WCAG reference values', function () {
  // Black on white is the maximum 21:1 ratio.
  assert.ok(Math.abs(contrast.contrastRatio('#000000', '#ffffff') - 21) < 1e-6);
  // Identical colors give a 1:1 ratio.
  assert.ok(Math.abs(contrast.contrastRatio('#777777', '#777777') - 1) < 1e-6);
  // Ratio is symmetric regardless of which color is foreground.
  var a = contrast.contrastRatio('#ec4899', '#0a071b');
  var b = contrast.contrastRatio('#0a071b', '#ec4899');
  assert.ok(Math.abs(a - b) < 1e-9);
});

test('parseCssTokens and resolveToken parse and resolve var() chains', function () {
  var css = [
    ':root {',
    '  --bg-primary: #0a071b;',
    '  --surface-canvas: var(--bg-primary);',
    '  --glow-mint: #5eead4;',
    '  --stat-color: var(--glow-mint);',
    '}',
    'body:not(.dark-mode) {',
    '  --surface-canvas: #fbf8f3;',
    '}'
  ].join('\n');

  var tokens = contrast.parseCssTokens(css);
  assert.ok(tokens[':root'], 'root block parsed');
  assert.strictEqual(tokens[':root']['--glow-mint'], '#5eead4');

  // Dark (root only): canvas resolves through --bg-primary.
  assert.strictEqual(
    contrast.resolveToken('--surface-canvas', [tokens[':root']]),
    '#0a071b'
  );
  // Stat color resolves through a var() chain.
  assert.strictEqual(
    contrast.resolveToken('--stat-color', [tokens[':root']]),
    '#5eead4'
  );
  // Light: override scope takes precedence over :root.
  assert.strictEqual(
    contrast.resolveToken('--surface-canvas', [tokens['body:not(.dark-mode)'], tokens[':root']]),
    '#fbf8f3'
  );
});
