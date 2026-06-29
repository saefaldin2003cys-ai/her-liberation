'use strict';

/**
 * Task 3.2 — Example test: computed font-family per direction.
 *
 * jsdom does not fully compute cascaded font-family from a <style> block, so
 * these tests work at the token / CSS-rule level against the raw
 * public/css/styles.css:
 *
 *   - Arabic (lang=ar / RTL, the document default) resolves to the
 *     IBM Plex Sans Arabic stack via --font-arabic on the base `body` rule.
 *   - English (lang=en / LTR) resolves to the Plus Jakarta Sans stack via
 *     --font-latin on the `[dir="ltr"] body, html[lang="en"] body` rule.
 *   - Numeric / statistic accents resolve to JetBrains Mono via --font-mono.
 *
 * Validates: Requirements 3.1, 3.2, 3.3
 */

var test = require('node:test');
var assert = require('node:assert');

var harness = require('./helpers/dom-harness');
var contrast = require('./helpers/contrast');

var ROOT_SELECTOR = ':root';

function tokenScopes() {
  var css = harness.readStylesCss();
  var tokens = contrast.parseCssTokens(css);
  assert.ok(tokens[ROOT_SELECTOR], 'styles.css contains a :root token block');
  return [tokens[ROOT_SELECTOR]];
}

// Strip CSS comments so rule matching is not fooled by commented-out examples.
function readCssWithoutComments() {
  return harness.readStylesCss().replace(/\/\*[\s\S]*?\*\//g, '');
}

// Find the declaration body for the first rule whose selector list matches the
// provided predicate. Returns the `{ ... }` body text, or null when not found.
function findRuleBody(css, selectorPredicate) {
  var blockRe = /([^{}]+)\{([^{}]*)\}/g;
  var match;
  while ((match = blockRe.exec(css)) !== null) {
    var rawSelector = match[1];
    var selector = rawSelector.slice(rawSelector.lastIndexOf(';') + 1).trim();
    if (selectorPredicate(selector)) {
      return match[2];
    }
  }
  return null;
}

test('--font-arabic resolves to a stack containing IBM Plex Sans Arabic', function () {
  var resolved = contrast.resolveToken('--font-arabic', tokenScopes());
  assert.ok(resolved, '--font-arabic should be defined');
  assert.ok(
    resolved.indexOf('IBM Plex Sans Arabic') !== -1,
    '--font-arabic should contain IBM Plex Sans Arabic (got ' + resolved + ')'
  );
});

test('--font-latin resolves to a stack containing Plus Jakarta Sans', function () {
  var resolved = contrast.resolveToken('--font-latin', tokenScopes());
  assert.ok(resolved, '--font-latin should be defined');
  assert.ok(
    resolved.indexOf('Plus Jakarta Sans') !== -1,
    '--font-latin should contain Plus Jakarta Sans (got ' + resolved + ')'
  );
});

test('--font-mono resolves to a stack containing JetBrains Mono', function () {
  var resolved = contrast.resolveToken('--font-mono', tokenScopes());
  assert.ok(resolved, '--font-mono should be defined');
  assert.ok(
    resolved.indexOf('JetBrains Mono') !== -1,
    '--font-mono should contain JetBrains Mono (got ' + resolved + ')'
  );
});

test('Arabic default: the base body rule uses var(--font-arabic)', function () {
  var css = readCssWithoutComments();
  // The base `body` rule: selector is exactly `body` (not [dir="ltr"] body etc).
  var body = findRuleBody(css, function (selector) {
    return selector === 'body';
  });
  assert.ok(body, 'a base `body` rule should exist');
  assert.ok(
    /font-family\s*:\s*var\(\s*--font-arabic\s*\)/.test(body),
    'base body rule should set font-family: var(--font-arabic)'
  );
});

test('English/LTR: the [dir="ltr"]/html[lang="en"] rule uses var(--font-latin)', function () {
  var css = readCssWithoutComments();
  var body = findRuleBody(css, function (selector) {
    return /\[dir="ltr"\]\s+body/.test(selector) && /html\[lang="en"\]\s+body/.test(selector);
  });
  assert.ok(body, 'a `[dir="ltr"] body, html[lang="en"] body` rule should exist');
  assert.ok(
    /font-family\s*:\s*var\(\s*--font-latin\s*\)/.test(body),
    'LTR/English rule should set font-family: var(--font-latin)'
  );
});

test('Numeric accent selectors use var(--font-mono)', function () {
  var css = readCssWithoutComments();
  var requiredSelectors = [
    '.stat-figure',
    '.metric-number-wrapper',
    '.stats-percentage',
    '.province-rate'
  ];
  var body = findRuleBody(css, function (selector) {
    return requiredSelectors.every(function (sel) {
      return selector.indexOf(sel) !== -1;
    });
  });
  assert.ok(
    body,
    'a rule grouping the numeric-accent selectors (' + requiredSelectors.join(', ') + ') should exist'
  );
  assert.ok(
    /font-family\s*:\s*var\(\s*--font-mono\s*\)/.test(body),
    'numeric-accent rule should set font-family: var(--font-mono)'
  );
});
