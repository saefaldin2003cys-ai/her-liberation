'use strict';

/**
 * Task 4.2 — Example test: focus-visible and reduced-motion declarations.
 *
 * Asserts that public/css/styles.css ships the accessibility affordances added
 * in task 4.1:
 *   1. A `:focus-visible` rule that paints a visible focus ring (an `outline`
 *      declaration), so keyboard users always see where focus is — independent
 *      of any `outline: none` reset elsewhere in the sheet.
 *   2. A `@media (prefers-reduced-motion: reduce)` block, so the design honors
 *      the OS-level "reduce motion" preference.
 *   3. Inside that reduced-motion block, `.reveal-on-scroll` is forced visible
 *      (`opacity: 1 !important` and `transform: none !important`) so entrance
 *      animations never leave content hidden for reduced-motion users.
 *
 * This is an example/assertion test (not property-based): it reads the raw
 * stylesheet text via the shared harness and checks for the specific
 * declarations. No mocking; it exercises the real shipped CSS.
 *
 * **Validates: Requirements 7.2, 7.3**
 */

var test = require('node:test');
var assert = require('node:assert');
var harness = require('./helpers/dom-harness');

/**
 * Extract the body of the first `@media (prefers-reduced-motion: reduce)` block
 * by brace-matching from the `@media` token. Returns the inner text of the
 * block (between the outermost `{ ... }`), or null if no such block exists.
 *
 * @param {string} css full stylesheet text
 * @returns {string|null}
 */
function extractReducedMotionBlock(css) {
  var re = /@media[^{]*prefers-reduced-motion\s*:\s*reduce[^{]*\{/i;
  var match = re.exec(css);
  if (!match) return null;

  var openIdx = match.index + match[0].length - 1; // index of the opening `{`
  var depth = 0;
  for (var i = openIdx; i < css.length; i++) {
    var ch = css[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return css.slice(openIdx + 1, i);
      }
    }
  }
  return null; // unbalanced braces
}

test('styles.css defines a visible :focus-visible ring with an outline', function () {
  var css = harness.readStylesCss();

  // A :focus-visible selector exists.
  assert.ok(
    /:focus-visible/.test(css),
    'expected a :focus-visible rule in styles.css'
  );

  // The :focus-visible rule carries an `outline` declaration (visible ring).
  // Capture the rule body that follows a selector ending in `:focus-visible`.
  var ruleRe = /:focus-visible\s*\{([^}]*)\}/i;
  var ruleMatch = ruleRe.exec(css);
  assert.ok(ruleMatch, 'expected a :focus-visible rule block in styles.css');

  var ruleBody = ruleMatch[1];
  assert.ok(
    /(^|[\s;])outline\s*:/.test(ruleBody) && !/outline\s*:\s*none/i.test(ruleBody),
    'expected the :focus-visible rule to set a visible outline (focus ring)'
  );
});

test('styles.css defines a prefers-reduced-motion: reduce block', function () {
  var css = harness.readStylesCss();
  assert.ok(
    /@media[^{]*prefers-reduced-motion\s*:\s*reduce/i.test(css),
    'expected an @media (prefers-reduced-motion: reduce) block in styles.css'
  );
});

test('reduced-motion block forces .reveal-on-scroll fully visible', function () {
  var css = harness.readStylesCss();
  var block = extractReducedMotionBlock(css);
  assert.ok(block, 'expected to extract the prefers-reduced-motion: reduce block');

  // Within the reduced-motion block, find the `.reveal-on-scroll` rule body.
  var revealRe = /\.reveal-on-scroll\b[^{]*\{([^}]*)\}/i;
  var revealMatch = revealRe.exec(block);
  assert.ok(
    revealMatch,
    'expected a .reveal-on-scroll rule inside the reduced-motion block'
  );

  var revealBody = revealMatch[1];
  assert.ok(
    /opacity\s*:\s*1\s*!important/i.test(revealBody),
    'expected .reveal-on-scroll to set opacity: 1 !important under reduced motion'
  );
  assert.ok(
    /transform\s*:\s*none\s*!important/i.test(revealBody),
    'expected .reveal-on-scroll to set transform: none !important under reduced motion'
  );
});
