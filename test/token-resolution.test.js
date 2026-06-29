'use strict';

/**
 * Task 2.4 — Example tests: token resolution in both themes.
 *
 * Parses public/css/styles.css and asserts that each premium surface/text/stat
 * design token resolves to its expected value in BOTH themes:
 *   - Dark (default): tokens declared in `:root`.
 *   - Light: tokens overridden under `body:not(.dark-mode)`, layered over `:root`.
 *
 * Scope ordering follows resolveToken's contract (most-specific first): dark uses
 * [root]; light uses [lightOverride, root] so that the light overrides win while
 * still falling back to :root for any token they do not redefine.
 *
 * Validates: Requirements 2.1, 2.5
 */

var test = require('node:test');
var assert = require('node:assert');

var harness = require('./helpers/dom-harness');
var contrast = require('./helpers/contrast');

var ROOT_SELECTOR = ':root';
var LIGHT_SELECTOR = 'body:not(.dark-mode)';

function buildScopes() {
  var css = harness.readStylesCss();
  var tokens = contrast.parseCssTokens(css);

  assert.ok(tokens[ROOT_SELECTOR], 'styles.css contains a :root token block');
  assert.ok(
    tokens[LIGHT_SELECTOR],
    'styles.css contains a body:not(.dark-mode) light-override block'
  );

  return {
    root: tokens[ROOT_SELECTOR],
    light: tokens[LIGHT_SELECTOR],
    // Most-specific first per resolveToken contract.
    darkScopes: [tokens[ROOT_SELECTOR]],
    lightScopes: [tokens[LIGHT_SELECTOR], tokens[ROOT_SELECTOR]]
  };
}

// Expected resolved values per the design's adaptive color grid.
var DARK_EXPECTED = {
  '--surface-canvas': '#0a071b',
  '--surface-raised': '#15112e',
  '--surface-inset': '#1d1840',
  '--text-aaa': '#f5f3ff',
  '--text-aaa-muted': '#d7d2e8',
  '--stat-color': '#5eead4' // var(--glow-mint) in dark.
};

var LIGHT_EXPECTED = {
  '--surface-canvas': '#fbf8f3',
  '--surface-raised': '#ffffff',
  '--surface-inset': '#f3ede4',
  '--text-aaa': '#1a1530',
  '--text-aaa-muted': '#3f3a52',
  '--stat-color': '#0f766e' // var(--glow-mint) overridden in light.
};

test('dark tokens resolve from :root to their expected values', function () {
  var scopes = buildScopes();
  Object.keys(DARK_EXPECTED).forEach(function (token) {
    var resolved = contrast.resolveToken(token, scopes.darkScopes);
    assert.strictEqual(
      resolved,
      DARK_EXPECTED[token],
      'dark ' + token + ' should resolve to ' + DARK_EXPECTED[token] + ' (got ' + resolved + ')'
    );
  });
});

test('light tokens resolve under body:not(.dark-mode) to their expected values', function () {
  var scopes = buildScopes();
  Object.keys(LIGHT_EXPECTED).forEach(function (token) {
    var resolved = contrast.resolveToken(token, scopes.lightScopes);
    assert.strictEqual(
      resolved,
      LIGHT_EXPECTED[token],
      'light ' + token + ' should resolve to ' + LIGHT_EXPECTED[token] + ' (got ' + resolved + ')'
    );
  });
});

test('--stat-color resolves through the var(--glow-mint) chain in each theme', function () {
  var scopes = buildScopes();
  // Dark: glow-mint comes from :root.
  assert.strictEqual(scopes.root['--stat-color'], 'var(--glow-mint)');
  assert.strictEqual(contrast.resolveToken('--stat-color', scopes.darkScopes), '#5eead4');
  // Light: the override block redefines --glow-mint, so the same chain yields the light value.
  assert.strictEqual(contrast.resolveToken('--stat-color', scopes.lightScopes), '#0f766e');
});

test('light surface/text tokens differ from their dark counterparts', function () {
  var scopes = buildScopes();
  Object.keys(DARK_EXPECTED).forEach(function (token) {
    var dark = contrast.resolveToken(token, scopes.darkScopes);
    var light = contrast.resolveToken(token, scopes.lightScopes);
    assert.notStrictEqual(
      light,
      dark,
      token + ' should adapt between themes (dark ' + dark + ' vs light ' + light + ')'
    );
  });
});
