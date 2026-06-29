'use strict';

/**
 * Task 12.2 — Property 4: Bidirectional logical mirroring.
 *
 * Requirement 6.1/6.2/6.3: for any target section, rendering under `dir="rtl"`
 * mirrors the inline-axis placement of layout, iconography, and navigation
 * relative to `dir="ltr"`, while preserving block-axis (source) order.
 *
 * The served site is no-build vanilla CSS and relies on CSS **logical
 * properties** so a single rule set serves both directions (design §2.1): RTL
 * mirroring is automatic and there are no `[dir="rtl"]`-specific spacing blocks.
 * jsdom cannot compute real bidirectional layout, so this test verifies the
 * INVARIANT THAT GUARANTEES mirroring rather than measuring pixels:
 *
 *   1. The redesign's directional spacing/positioning inside the three target
 *      sections (`.mission-section-premium`, `#map-section`, `#articles-section`)
 *      and the shared card/grid primitives is expressed with LOGICAL properties
 *      (`padding-inline*`, `margin-inline*`, `inset-inline*`, `border-inline*`,
 *      `inline-size`/`block-size`, `text-align: start/end`).
 *   2. Those scoped rules introduce NO physical inline-directional declarations
 *      (`margin-left/right`, `padding-left/right`, `left:`/`right:`,
 *      `border-left/right`, `text-align: left/right`, `float/clear: left/right`)
 *      that would NOT mirror under RTL. (Block-axis physical such as
 *      `margin-top`, `padding-bottom`, `width`, `height` is allowed — it is
 *      non-directional and identical in both reading directions.)
 *   3. Directional icons flip under RTL via the logical transform rule
 *      `[dir="rtl"] .icon-directional { transform: scaleX(-1); }`.
 *   4. Block-axis (source) order is preserved: the scoped rules use no `order:`
 *      reordering hacks and no `direction:` override, and the ONLY `[dir="rtl"]`
 *      rule touching a scoped primitive is the icon flip (no duplicate
 *      direction-specific spacing blocks).
 *
 * The test parses the REAL shipped `public/css/styles.css` (via the shared
 * harness), extracts the rule blocks scoped to the target sections and shared
 * primitives, and uses fast-check to iterate over that selector/declaration set.
 * No mocking — it exercises the actual stylesheet.
 *
 * **Validates: Requirements 6.1, 6.2, 6.3**
 */

var test = require('node:test');
var assert = require('node:assert');
var fc = require('fast-check');
var harness = require('./helpers/dom-harness');

/* ------------------------------------------------------------------ *
 * Minimal CSS parser: extract style rules (selector + declarations),
 * descending into @media / @supports blocks and ignoring @keyframes /
 * @font-face / @import. Good enough for the hand-written project sheet.
 * ------------------------------------------------------------------ */

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function parseBlock(text, rules) {
  var i = 0;
  var n = text.length;
  var buf = '';
  while (i < n) {
    var ch = text[i];
    if (ch === '{') {
      var selector = buf.trim();
      // Brace-match to the closing `}`.
      var depth = 1;
      var j = i + 1;
      while (j < n) {
        if (text[j] === '{') depth++;
        else if (text[j] === '}') {
          depth--;
          if (depth === 0) break;
        }
        j++;
      }
      var inner = text.slice(i + 1, j);
      if (selector.charAt(0) === '@') {
        // Conditional group rules contain nested style rules — recurse.
        if (/^@(media|supports|container)/i.test(selector)) {
          parseBlock(inner, rules);
        }
        // @keyframes / @font-face / @page etc. carry no directional layout — skip.
      } else if (selector) {
        rules.push({ selector: selector, body: inner });
      }
      buf = '';
      i = j + 1;
    } else {
      buf += ch;
      i++;
    }
  }
}

function parseRules(css) {
  var rules = [];
  parseBlock(stripComments(css), rules);
  return rules;
}

/**
 * Split a declaration block body into {prop, value} pairs (lower-cased).
 * Normal rule bodies contain no nested braces, so a simple `;` split is safe.
 */
function parseDeclarations(body) {
  var decls = [];
  var parts = body.split(';');
  for (var i = 0; i < parts.length; i++) {
    var part = parts[i].trim();
    if (!part) continue;
    var idx = part.indexOf(':');
    if (idx === -1) continue;
    var prop = part.slice(0, idx).trim().toLowerCase();
    var value = part.slice(idx + 1).trim().toLowerCase();
    if (prop) decls.push({ prop: prop, value: value });
  }
  return decls;
}

/* ------------------------------------------------------------------ *
 * Scope: the three target sections + the shared card/grid/nav primitives
 * the redesign restyles (design §3.1–§3.3, §2.2, §3.6). A rule is in scope
 * if its (possibly grouped) selector text references any of these tokens.
 * ------------------------------------------------------------------ */

var SCOPE_TOKENS = [
  // Target sections
  '.mission-section-premium', '#map-section', '#articles-section',
  // Shared directional / motion primitives
  '.reveal-on-scroll', '.icon-directional',
  // About (mission) primitives
  '.mission-container', '.mission-visual-grid', '.mission-img-card',
  '.mission-visual-badge', '.mission-text-content', '.mission-header-title',
  '.mission-blocks-grid', '.mission-block-item', '.mission-block-num',
  '.mission-block-text',
  // Campaigns (province) primitives
  '.province-btn', '.province-details', '.province-rate', '.province-name',
  '.province-story', '.province-info', '.province-header', '.impact-progress',
  // Programs (article) primitives
  '.articles-grid', '.article-card', '.article-title', '.article-excerpt',
  '.read-more-btn'
];

function isInScope(selector) {
  for (var i = 0; i < SCOPE_TOKENS.length; i++) {
    if (selector.indexOf(SCOPE_TOKENS[i]) !== -1) return true;
  }
  return false;
}

/* ------------------------------------------------------------------ *
 * Physical inline-directional declarations (would NOT mirror under RTL).
 * Block-axis physical (top/bottom, width, height) is intentionally allowed.
 * ------------------------------------------------------------------ */

var PHYSICAL_DIRECTIONAL_PROPS = {
  'margin-left': 1, 'margin-right': 1,
  'padding-left': 1, 'padding-right': 1,
  'left': 1, 'right': 1,
  'border-left': 1, 'border-right': 1,
  'border-left-width': 1, 'border-left-style': 1, 'border-left-color': 1,
  'border-right-width': 1, 'border-right-style': 1, 'border-right-color': 1
};

function isPhysicalDirectional(decl) {
  if (PHYSICAL_DIRECTIONAL_PROPS[decl.prop]) return true;
  if (decl.prop === 'text-align' && (decl.value === 'left' || decl.value === 'right')) return true;
  if (decl.prop === 'float' && (decl.value === 'left' || decl.value === 'right')) return true;
  if (decl.prop === 'clear' && (decl.value === 'left' || decl.value === 'right')) return true;
  return false;
}

/** Logical INLINE-axis declarations — the ones that auto-mirror under RTL. */
function isLogicalInline(decl) {
  var p = decl.prop;
  if (/^(padding|margin|border)-inline(-start|-end)?$/.test(p)) return true;
  if (/^inset-inline(-start|-end)?$/.test(p)) return true;
  if (p === 'inline-size' || p === 'min-inline-size' || p === 'max-inline-size') return true;
  if (p === 'text-align' && (decl.value === 'start' || decl.value === 'end')) return true;
  return false;
}

/* ------------------------------------------------------------------ *
 * Build the scoped model once.
 * ------------------------------------------------------------------ */

var CSS = harness.readStylesCss();
var ALL_RULES = parseRules(CSS);
var SCOPED_RULES = ALL_RULES.filter(function (r) { return isInScope(r.selector); }).map(function (r) {
  return { selector: r.selector, decls: parseDeclarations(r.body) };
});

// Flatten declarations, tagged with their owning selector for diagnostics.
var SCOPED_DECLS = [];
SCOPED_RULES.forEach(function (r) {
  r.decls.forEach(function (d) {
    SCOPED_DECLS.push({ selector: r.selector, prop: d.prop, value: d.value });
  });
});

var TARGET_SECTIONS = ['.mission-section-premium', '#map-section', '#articles-section'];

/* ------------------------------------------------------------------ *
 * Sanity: the parser/scoping actually found the redesign rules. Guards
 * against a vacuously-passing property if extraction silently breaks.
 * ------------------------------------------------------------------ */

test('harness extracts the scoped target-section rules and declarations', function () {
  assert.ok(SCOPED_RULES.length >= 10, 'expected to extract many scoped rules, got ' + SCOPED_RULES.length);
  assert.ok(SCOPED_DECLS.length >= 30, 'expected to extract many scoped declarations, got ' + SCOPED_DECLS.length);
  TARGET_SECTIONS.forEach(function (sec) {
    var has = SCOPED_RULES.some(function (r) { return r.selector.indexOf(sec) !== -1; });
    assert.ok(has, 'expected scoped rules for target section ' + sec);
  });
});

/* Property 4 (mirroring invariant) — no physical inline-directional declarations
 * appear anywhere in the scoped target-section / primitive rules. fast-check
 * iterates the full declaration set; failure reports the offending decl. */
test('Property 4: no scoped target-section declaration uses physical inline-directional CSS', function () {
  fc.assert(
    fc.property(fc.constantFrom.apply(fc, SCOPED_DECLS), function (decl) {
      assert.ok(
        !isPhysicalDirectional(decl),
        'physical inline-directional declaration "' + decl.prop + ': ' + decl.value +
        '" found in scoped rule "' + decl.selector + '" — would not mirror under RTL; use a logical property instead'
      );
    }),
    { numRuns: Math.max(200, SCOPED_DECLS.length * 4) }
  );
});

/* Property 4 (per-section) — for each target section the scoped rules are clean
 * of physical inline-directional props AND demonstrably use at least one logical
 * inline-axis property (positive evidence that mirroring is wired logically). */
test('Property 4: each target section mirrors via logical inline-axis properties only', function () {
  fc.assert(
    fc.property(fc.constantFrom.apply(fc, TARGET_SECTIONS), function (section) {
      var sectionRules = SCOPED_RULES.filter(function (r) {
        return r.selector.indexOf(section) !== -1;
      });
      assert.ok(sectionRules.length > 0, 'expected scoped rules for ' + section);

      var sawLogicalInline = false;
      sectionRules.forEach(function (r) {
        r.decls.forEach(function (d) {
          assert.ok(
            !isPhysicalDirectional(d),
            'physical inline-directional "' + d.prop + ': ' + d.value +
            '" in "' + r.selector + '" (' + section + ')'
          );
          if (isLogicalInline(d)) sawLogicalInline = true;
        });
      });

      assert.ok(
        sawLogicalInline,
        'expected at least one logical inline-axis declaration in ' + section +
        ' scoped rules to guarantee RTL/LTR mirroring'
      );
    }),
    { numRuns: 60 }
  );
});

/* Iconography mirroring — directional glyphs flip under RTL with a logical
 * transform; the base rule transitions the flip. (Requirement 6.2) */
test('Property 4: directional icons flip under RTL via [dir="rtl"] .icon-directional scaleX(-1)', function () {
  var normalized = CSS.replace(/\s+/g, ' ');
  assert.ok(
    /\[dir="rtl"\]\s*\.icon-directional\s*\{[^}]*transform\s*:\s*scalex\(-1\)/i.test(normalized),
    'expected [dir="rtl"] .icon-directional { transform: scaleX(-1) } flip rule'
  );
  assert.ok(
    /(^|[^\]])\.icon-directional\s*\{[^}]*transition\s*:/i.test(normalized),
    'expected base .icon-directional rule to declare a transition for the flip'
  );
});

/* Block-axis (source) order preservation — scoped rules use no `order:`
 * reordering and no `direction:` override; the only [dir="rtl"] rule touching a
 * scoped primitive is the icon flip (no direction-specific spacing duplicates). */
test('Property 4: block-axis source order preserved (no order/direction hacks, no rtl spacing blocks)', function () {
  fc.assert(
    fc.property(fc.constantFrom.apply(fc, SCOPED_RULES), function (rule) {
      rule.decls.forEach(function (d) {
        assert.notStrictEqual(
          d.prop, 'order',
          'unexpected `order` reordering in scoped rule "' + rule.selector + '" — block-axis source order must be preserved'
        );
        assert.notStrictEqual(
          d.prop, 'direction',
          'unexpected `direction` override in scoped rule "' + rule.selector + '" — direction is owned by the i18n engine'
        );
      });

      // Any scoped rule that is direction-specific (`[dir="rtl"]`) must be the
      // icon flip only — never a duplicated spacing/layout block.
      if (/\[dir="rtl"\]/i.test(rule.selector)) {
        assert.ok(
          rule.selector.indexOf('.icon-directional') !== -1,
          'unexpected direction-specific scoped rule "' + rule.selector +
          '" — mirroring must rely on logical properties, not [dir="rtl"] overrides'
        );
        rule.decls.forEach(function (d) {
          assert.ok(
            d.prop === 'transform',
            'the [dir="rtl"] .icon-directional rule should only flip via transform, found "' + d.prop + '"'
          );
        });
      }
    }),
    { numRuns: Math.max(100, SCOPED_RULES.length * 4) }
  );
});
