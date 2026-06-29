'use strict';

/**
 * Task 3.2 — Example test: computed font-family per direction.
 *
 * This complements `font-family-direction.test.js` by modeling the *effective*
 * font-family a paragraph of body text resolves to for each document
 * direction/language, rather than only checking tokens in isolation:
 *
 *   - The served document defaults to <html lang="ar" dir="rtl"> (confirmed via
 *     the jsdom harness), so Arabic body text resolves through the base `body`
 *     rule to the IBM Plex Sans Arabic stack.
 *   - When the i18n engine switches to English it sets lang=en / dir=ltr, which
 *     activates the `[dir="ltr"] body, html[lang="en"] body` rule and resolves
 *     to the Plus Jakarta Sans stack.
 *   - Numeric / statistic accents resolve to the JetBrains Mono stack regardless
 *     of direction.
 *
 * jsdom does not compute cascaded font-family from a <style> block, so the
 * "computation" is done here by selecting the applicable CSS rule for a given
 * (lang, dir) and resolving its `var(--font-*)` token against the parsed
 * :root scope using the shared test helpers.
 *
 * Validates: Requirements 3.1, 3.2, 3.3
 */

var test = require('node:test');
var assert = require('node:assert');

var harness = require('./helpers/dom-harness');
var contrast = require('./helpers/contrast');

var ROOT_SELECTOR = ':root';

// Parse the :root token scope once for token resolution.
function tokenScopes() {
  var tokens = contrast.parseCssTokens(harness.readStylesCss());
  assert.ok(tokens[ROOT_SELECTOR], 'styles.css contains a :root token block');
  return [tokens[ROOT_SELECTOR]];
}

// CSS text with comments stripped, so commented-out examples never match.
function readCssWithoutComments() {
  return harness.readStylesCss().replace(/\/\*[\s\S]*?\*\//g, '');
}

// Return the declaration body of the first rule whose normalized selector list
// satisfies the predicate, or null when no such rule exists.
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

// Pull the `var(--token)` referenced by a `font-family` declaration in a body.
function fontFamilyTokenIn(ruleBody) {
  if (!ruleBody) return null;
  var m = ruleBody.match(/font-family\s*:\s*var\(\s*(--font-[A-Za-z0-9-]+)\s*\)/);
  return m ? m[1] : null;
}

// Model the effective body font-family token for a (lang, dir) pair: the
// English/LTR swap rule wins when active, otherwise the Arabic default applies.
function effectiveBodyFontToken(css, lang, dir) {
  if (dir === 'ltr' || lang === 'en') {
    var ltrBody = findRuleBody(css, function (selector) {
      return /\[dir="ltr"\]\s+body/.test(selector) || /html\[lang="en"\]\s+body/.test(selector);
    });
    var ltrToken = fontFamilyTokenIn(ltrBody);
    if (ltrToken) return ltrToken;
  }
  var baseBody = findRuleBody(css, function (selector) {
    return selector === 'body';
  });
  return fontFamilyTokenIn(baseBody);
}

test('served document defaults to <html lang="ar" dir="rtl">', function () {
  var env = harness.loadIndexHtml();
  var html = env.document.documentElement;
  assert.strictEqual(html.getAttribute('lang'), 'ar', 'default lang should be ar');
  assert.strictEqual(html.getAttribute('dir'), 'rtl', 'default dir should be rtl');
});

test('Arabic (lang=ar / rtl) resolves body text to the IBM Plex Sans Arabic stack', function () {
  var css = readCssWithoutComments();
  var token = effectiveBodyFontToken(css, 'ar', 'rtl');
  assert.strictEqual(token, '--font-arabic', 'Arabic/RTL body should use var(--font-arabic)');

  var resolved = contrast.resolveToken(token, tokenScopes());
  assert.ok(resolved, '--font-arabic should resolve');
  assert.ok(
    resolved.indexOf('IBM Plex Sans Arabic') !== -1,
    'Arabic body stack should contain IBM Plex Sans Arabic (got ' + resolved + ')'
  );
});

test('English (lang=en / ltr) resolves body text to the Plus Jakarta Sans stack', function () {
  var css = readCssWithoutComments();
  var token = effectiveBodyFontToken(css, 'en', 'ltr');
  assert.strictEqual(token, '--font-latin', 'English/LTR body should use var(--font-latin)');

  var resolved = contrast.resolveToken(token, tokenScopes());
  assert.ok(resolved, '--font-latin should resolve');
  assert.ok(
    resolved.indexOf('Plus Jakarta Sans') !== -1,
    'English body stack should contain Plus Jakarta Sans (got ' + resolved + ')'
  );
});

test('numeric / statistic accents resolve to the JetBrains Mono stack in any direction', function () {
  var css = readCssWithoutComments();
  var requiredSelectors = ['.stat-figure', '.metric-number-wrapper', '.stats-percentage', '.province-rate'];

  var accentBody = findRuleBody(css, function (selector) {
    return requiredSelectors.every(function (sel) {
      return selector.indexOf(sel) !== -1;
    });
  });
  var token = fontFamilyTokenIn(accentBody);
  assert.strictEqual(token, '--font-mono', 'numeric-accent selectors should use var(--font-mono)');

  var resolved = contrast.resolveToken(token, tokenScopes());
  assert.ok(resolved, '--font-mono should resolve');
  assert.ok(
    resolved.indexOf('JetBrains Mono') !== -1,
    'numeric-accent stack should contain JetBrains Mono (got ' + resolved + ')'
  );
});
