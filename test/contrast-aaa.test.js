'use strict';

/**
 * Task 2.2 — Property 2: AAA contrast for body and control text.
 *
 * Validates: Requirements 7.1
 *
 * Over the token-pair set (`--text-aaa` / `--text-aaa-muted` against
 * `--surface-raised` / `--surface-canvas`) in both themes (dark default and
 * light), the WCAG contrast ratio is at least 7:1 (WCAG 2.2 Level AAA for
 * normal text).
 *
 * Token resolution scopes (per design §1.3, mirroring styles.css):
 *   - dark  : resolve against [:root]
 *   - light : resolve against [body:not(.dark-mode), :root]
 */

var test = require('node:test');
var assert = require('node:assert');
var fc = require('fast-check');

var harness = require('./helpers/dom-harness');
var contrast = require('./helpers/contrast');

var TEXT_TOKENS = ['--text-aaa', '--text-aaa-muted'];
var BACKGROUND_TOKENS = ['--surface-raised', '--surface-canvas'];
var AAA_THRESHOLD = 7;

// Parse the real served stylesheet once.
var tokens = contrast.parseCssTokens(harness.readStylesCss());

/**
 * Find a token block by selector. The pure parser groups declarations by the
 * raw selector text preceding each `{ ... }`. In the real stylesheet the very
 * first block (`:root`) is preceded by an `@import url(...);` at-rule, which the
 * flat parser folds into that block's selector text. Normalize by stripping any
 * `@import ...;` prefix and matching the selector against the comma-separated
 * selector list so `:root` (and any grouped selectors) resolve cleanly.
 */
function findScope(map, selector) {
  if (map[selector]) return map[selector];
  var keys = Object.keys(map);
  for (var i = 0; i < keys.length; i++) {
    var normalized = keys[i].replace(/@[a-z-]+\s+[^;{}]*;/gi, '').trim();
    var parts = normalized.split(',');
    for (var j = 0; j < parts.length; j++) {
      if (parts[j].trim() === selector) return map[keys[i]];
    }
  }
  return undefined;
}

var rootScope = findScope(tokens, ':root');
var lightScope = findScope(tokens, 'body:not(.dark-mode)');

// Theme -> ordered scope list (most specific first).
var THEME_SCOPES = {
  dark: [rootScope],
  light: [lightScope, rootScope]
};

test('token blocks needed for the AAA contrast property are present', function () {
  assert.ok(rootScope, ':root token block parsed from styles.css');
  assert.ok(lightScope, 'body:not(.dark-mode) token block parsed from styles.css');
});

test('Property 2: AAA contrast (>= 7:1) for body/control text token pairs in both themes', function () {
  fc.assert(
    fc.property(
      fc.constantFrom.apply(fc, TEXT_TOKENS),
      fc.constantFrom.apply(fc, BACKGROUND_TOKENS),
      fc.constantFrom('dark', 'light'),
      function (textToken, bgToken, theme) {
        var scopes = THEME_SCOPES[theme];

        var textValue = contrast.resolveToken(textToken, scopes);
        var bgValue = contrast.resolveToken(bgToken, scopes);

        assert.ok(
          textValue !== null,
          'text token ' + textToken + ' resolves in ' + theme + ' theme'
        );
        assert.ok(
          bgValue !== null,
          'background token ' + bgToken + ' resolves in ' + theme + ' theme'
        );

        var ratio = contrast.contrastRatio(textValue, bgValue);

        assert.ok(
          ratio >= AAA_THRESHOLD,
          theme + ' theme: ' + textToken + ' (' + textValue + ') on ' +
            bgToken + ' (' + bgValue + ') = ' + ratio.toFixed(2) +
            ':1, expected >= ' + AAA_THRESHOLD + ':1'
        );
      }
    ),
    { numRuns: 100 }
  );
});
