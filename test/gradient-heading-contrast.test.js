'use strict';

/**
 * Task 2.3 — Property 3: Gradient decorative-heading contrast.
 *
 * For both decorative-heading brand-gradient endpoints, resolved per-theme from
 * the real `public/css/styles.css` tokens (`--heading-gradient-from` and
 * `--heading-gradient-to`), against the section background (the
 * `--surface-canvas` token) in both themes (dark default and light), the WCAG
 * contrast ratio must be at least 4.5:1 (AA).
 *
 * Endpoints and background are resolved from the real stylesheet:
 *   - dark (default): tokens defined in `:root`
 *   - light:          tokens overridden in `body:not(.dark-mode)`
 *
 * Reading the actual rendered endpoints (rather than hardcoded colors) keeps the
 * property validating the real decorative headings. The dark theme keeps the
 * original brand pink->purple (#ec4899 -> #8b5cf6); the light theme darkens the
 * endpoints so the gradient clears AA on the warm cream canvas.
 *
 * **Validates: Requirements 7.4**
 */

var test = require('node:test');
var assert = require('node:assert');
var fc = require('fast-check');

var harness = require('./helpers/dom-harness');
var contrast = require('./helpers/contrast');

// The two decorative-heading gradient endpoint tokens (design §1.1, §1.4).
var ENDPOINT_TOKENS = ['--heading-gradient-from', '--heading-gradient-to'];

// Theme scopes, most-specific first, used to resolve tokens.
var THEMES = ['dark', 'light'];

var AA_MIN_RATIO = 4.5;

/**
 * Find the first parsed token block whose selector key contains the given
 * substring. `parseCssTokens` keys each block by the raw text preceding its
 * `{`, so the dark base block's key includes the leading `@import` line (it is
 * not the bare string ':root'). Matching by substring locates the intended
 * scope regardless of that leading content.
 *
 * @param {Object<string,Object<string,string>>} tokens parsed token blocks
 * @param {string} selectorFragment substring to match against block keys
 * @returns {Object<string,string>|null}
 */
function findScope(tokens, selectorFragment) {
  var keys = Object.keys(tokens);
  for (var i = 0; i < keys.length; i++) {
    if (keys[i].indexOf(selectorFragment) !== -1) {
      return tokens[keys[i]];
    }
  }
  return null;
}

/**
 * Build the ordered scope list (most-specific first) for resolving a token in a
 * given theme. Dark is the default theme defined in the `:root` base block;
 * light layers the `body:not(.dark-mode)` override over that base.
 *
 * @param {Object<string,Object<string,string>>} tokens parsed token blocks
 * @param {string} theme 'dark' | 'light'
 * @returns {Array<Object<string,string>>}
 */
function scopesFor(tokens, theme) {
  var root = findScope(tokens, ':root') || {};
  if (theme === 'light') {
    return [findScope(tokens, 'body:not(.dark-mode)') || {}, root];
  }
  return [root];
}

test('Property 3: gradient endpoints meet AA contrast vs section background in both themes', function () {
  var css = harness.readStylesCss();
  var tokens = contrast.parseCssTokens(css);

  // Sanity: the section-background token resolves in both theme scopes.
  var darkCanvas = contrast.resolveToken('--surface-canvas', scopesFor(tokens, 'dark'));
  var lightCanvas = contrast.resolveToken('--surface-canvas', scopesFor(tokens, 'light'));
  assert.ok(darkCanvas, '--surface-canvas resolves in the dark (:root) theme');
  assert.ok(lightCanvas, '--surface-canvas resolves in the light theme');

  // Sanity: the actual decorative-heading endpoint tokens resolve to real colors
  // (not unresolved var() references) in both themes.
  THEMES.forEach(function (theme) {
    ENDPOINT_TOKENS.forEach(function (tokenName) {
      var color = contrast.resolveToken(tokenName, scopesFor(tokens, theme));
      assert.ok(
        contrast.parseColor(color),
        tokenName + ' resolves to a parseable color in the ' + theme +
          ' theme (got ' + color + ')'
      );
    });
  });

  fc.assert(
    fc.property(
      fc.constantFrom.apply(fc, ENDPOINT_TOKENS),
      fc.constantFrom.apply(fc, THEMES),
      function (endpointToken, theme) {
        var scopes = scopesFor(tokens, theme);
        var endpoint = contrast.resolveToken(endpointToken, scopes);
        var background = contrast.resolveToken('--surface-canvas', scopes);
        var ratio = contrast.contrastRatio(endpoint, background);
        assert.ok(
          ratio >= AA_MIN_RATIO,
          'decorative-heading endpoint ' + endpointToken + ' (' + endpoint +
            ') on ' + theme + ' --surface-canvas (' + background +
            ') had ratio ' + ratio.toFixed(3) + ', expected >= ' + AA_MIN_RATIO
        );
      }
    )
  );
});
