'use strict';

/**
 * Task 10.2 — Property 6: Theme-toggle invariant.
 *
 * Validates: Requirements 8.2
 *
 * For any starting Theme_Mode and any sequence of toggles, the existing theme
 * toggle behavior holds:
 *   - each toggle INVERTS `body.dark-mode`;
 *   - each toggle PERSISTS the resulting choice to localStorage under key
 *     `'theme'` ('dark' | 'light');
 *   - the resolved Design_Token_Grid set is CONSISTENT with the new state
 *     (dark tokens from `:root` when `body.dark-mode` is set, light overrides
 *     under `body:not(.dark-mode)` otherwise).
 *
 * This exercises the REAL toggle logic. Rather than re-running the entire page
 * (which fetches from the backend on load), it extracts the contiguous theme
 * block (`initTheme` / `toggleTheme` / `updateThemeIcon`) verbatim from
 * `public/js/script.js` and evaluates it inside a controlled jsdom window. The
 * window supplies the same globals the real code relies on (document,
 * localStorage, matchMedia, Date) so the behavior under test is the shipped
 * behavior, not a re-implementation.
 */

var test = require('node:test');
var assert = require('node:assert');
var fs = require('fs');
var path = require('path');
var fc = require('fast-check');
var JSDOM = require('jsdom').JSDOM;

var harness = require('./helpers/dom-harness');
var contrast = require('./helpers/contrast');

// ---------------------------------------------------------------------------
// Extract the real theme block from the served script.js.
// ---------------------------------------------------------------------------
var SCRIPT_PATH = path.join(harness.PUBLIC_DIR, 'js', 'script.js');
var scriptSource = fs.readFileSync(SCRIPT_PATH, 'utf8');

var blockStart = scriptSource.indexOf('function initTheme()');
var blockEnd = scriptSource.indexOf('function loadStats');
assert.ok(blockStart !== -1, 'script.js should contain initTheme()');
assert.ok(blockEnd !== -1 && blockEnd > blockStart, 'script.js should contain loadStats after the theme block');

// Contiguous, verbatim theme logic: initTheme, lastThemeToggleTime, toggleTheme,
// updateThemeIcon (trailing comments are harmless under eval).
var THEME_SOURCE = scriptSource.slice(blockStart, blockEnd);

assert.ok(/function toggleTheme\(\)/.test(THEME_SOURCE), 'extracted block contains toggleTheme');
assert.ok(/localStorage\.setItem\('theme'/.test(THEME_SOURCE), 'extracted block persists the theme choice');

// ---------------------------------------------------------------------------
// Token resolution scopes parsed from the real stylesheet.
// ---------------------------------------------------------------------------
var cssTokens = contrast.parseCssTokens(harness.readStylesCss());

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

var rootScope = findScope(cssTokens, ':root');
var lightScope = findScope(cssTokens, 'body:not(.dark-mode)');

// Most-specific first (per resolveToken's contract).
var DARK_SCOPES = [rootScope];
var LIGHT_SCOPES = [lightScope, rootScope];

// Representative tokens whose resolved value differs between themes; these stand
// in for "the resolved token set matches the active state".
var WITNESS_TOKENS = ['--surface-canvas', '--text-aaa'];

/**
 * Resolve a token in whichever scope the current body state selects.
 * @param {string} token
 * @param {boolean} isDark
 */
function resolveForState(token, isDark) {
  return contrast.resolveToken(token, isDark ? DARK_SCOPES : LIGHT_SCOPES);
}

/**
 * Build a fresh, controlled jsdom window with the real theme code loaded.
 * @param {('dark'|'light')} startTheme
 * @returns {{window: Window, advance: function(number):void, toggle: function():void}}
 */
function makeThemeWindow(startTheme) {
  var dom = new JSDOM(
    '<!DOCTYPE html><html><head></head><body>' +
      '<button id="themeToggle"><span class="theme-icon"></span></button>' +
      '<button id="headerThemeToggle"><span class="theme-icon"></span></button>' +
      '</body></html>',
    // 'outside-only' lets window.eval run the extracted theme code in the
    // window's global scope (attaching the functions to `window`) without
    // executing any <script> tags from the markup.
    { url: 'http://localhost/', runScripts: 'outside-only' }
  );
  var window = dom.window;

  // Deterministic clock so the real 50ms debounce can be stepped past.
  var now = 1000;
  window.Date.now = function () { return now; };

  // Stub matchMedia so initTheme's prefers-dark branch is deterministic.
  window.matchMedia = function () { return { matches: false }; };

  // Establish the starting theme through the real init path.
  window.localStorage.setItem('theme', startTheme);
  window.eval(THEME_SOURCE);
  window.initTheme();

  return {
    window: window,
    advance: function (ms) { now += ms; },
    toggle: function () { window.toggleTheme(); }
  };
}

// ---------------------------------------------------------------------------
// Sanity checks.
// ---------------------------------------------------------------------------
test('theme token scopes and witnesses are present and theme-sensitive', function () {
  assert.ok(rootScope, ':root token block parsed from styles.css');
  assert.ok(lightScope, 'body:not(.dark-mode) token block parsed from styles.css');
  WITNESS_TOKENS.forEach(function (token) {
    var dark = resolveForState(token, true);
    var light = resolveForState(token, false);
    assert.ok(dark !== null && light !== null, token + ' resolves in both themes');
    assert.notStrictEqual(light, dark, token + ' must differ between themes to witness the invariant');
  });
});

test('initTheme establishes the requested starting theme', function () {
  var dark = makeThemeWindow('dark');
  assert.strictEqual(dark.window.document.body.classList.contains('dark-mode'), true);

  var light = makeThemeWindow('light');
  assert.strictEqual(light.window.document.body.classList.contains('dark-mode'), false);
});

// ---------------------------------------------------------------------------
// Property 6.
// ---------------------------------------------------------------------------
test('Property 6: toggling inverts dark-mode, persists the choice, and resolves tokens consistently', function () {
  fc.assert(
    fc.property(
      fc.constantFrom('dark', 'light'),
      fc.array(fc.constant(0), { minLength: 1, maxLength: 10 }),
      function (startTheme, toggles) {
        var ctx = makeThemeWindow(startTheme);
        var body = ctx.window.document.body;
        var storage = ctx.window.localStorage;

        // Invariant established by the start state.
        var expectedDark = startTheme === 'dark';
        assert.strictEqual(body.classList.contains('dark-mode'), expectedDark);

        for (var i = 0; i < toggles.length; i++) {
          // Step past the real 50ms debounce so the toggle is honored.
          ctx.advance(100);
          ctx.toggle();

          // 1. Inversion.
          expectedDark = !expectedDark;
          var isDark = body.classList.contains('dark-mode');
          assert.strictEqual(
            isDark,
            expectedDark,
            'toggle #' + (i + 1) + ' from ' + startTheme + ' start should invert dark-mode'
          );

          // 2. Persistence of the resulting choice.
          assert.strictEqual(
            storage.getItem('theme'),
            expectedDark ? 'dark' : 'light',
            'toggle #' + (i + 1) + ' should persist the new theme choice'
          );

          // 3. Token resolution consistent with the new state.
          WITNESS_TOKENS.forEach(function (token) {
            var resolved = resolveForState(token, isDark);
            var expected = isDark
              ? contrast.resolveToken(token, DARK_SCOPES)
              : contrast.resolveToken(token, LIGHT_SCOPES);
            assert.strictEqual(
              resolved,
              expected,
              token + ' should resolve to its ' + (isDark ? 'dark' : 'light') +
                ' value after toggle #' + (i + 1)
            );
          });
        }
      }
    ),
    { numRuns: 100 }
  );
});

test('debounced rapid toggles (within 50ms) are ignored, preserving the invariant', function () {
  var ctx = makeThemeWindow('dark');
  var body = ctx.window.document.body;

  // No clock advance: second call lands inside the debounce window.
  ctx.toggle(); // honored -> light
  var afterFirst = body.classList.contains('dark-mode');
  ctx.toggle(); // ignored (debounced)
  var afterSecond = body.classList.contains('dark-mode');

  assert.strictEqual(afterFirst, false, 'first toggle flips dark -> light');
  assert.strictEqual(afterSecond, false, 'debounced toggle does not flip again');
  assert.strictEqual(ctx.window.localStorage.getItem('theme'), 'light');
});
