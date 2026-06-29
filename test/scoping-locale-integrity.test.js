'use strict';

/**
 * Task 13.4 — Smoke: scoping and locale integrity (no-regression).
 *
 * **Requirements: 2.4, 2.5, 1.4**
 *
 * Two guarantees are verified here, both read-only against the served files
 * (this test never modifies source):
 *
 * 1. SCOPE DISCIPLINE (design §7.5). The premium redesign restyles only three
 *    target sections — About (`.mission-section-premium`), Campaigns
 *    (`#map-section`) and Programs (`#articles-section`). Its section-specific
 *    card/grid layout rules must therefore be written *scoped*: their selectors
 *    must be qualified by one of those three target selectors so they cannot
 *    restyle any other section. We assert:
 *      - no premium card/grid layout rule (a rule whose body applies the
 *        redesign's premium surface/glow/AAA tokens or a bento `grid-column:
 *        span`) appears as an UNSCOPED global selector, and
 *      - the redesign's premium treatment for each target class IS present under
 *        one of the three scopes, and
 *      - the section-unique premium classes are physically confined to their
 *        target section in the served markup, and
 *      - the pre-existing GLOBAL base rules for shared classes
 *        (`.article-card` / `.articles-grid`) and unrelated section layout
 *        anchors are still present — i.e. other sections keep their existing
 *        layout.
 *    Global PRIMITIVES (`.reveal-on-scroll`, `.icon-directional`,
 *    `:focus-visible`) and global tokens/fonts are intentionally global and are
 *    NOT treated as premium layout rules.
 *
 * 2. LOCALE INTEGRITY (design §4 rule 3: locale JSON is read-only). The catalogs
 *    `public/locales/ar.json` and `public/locales/en.json` must remain valid,
 *    structurally intact, and complete. "Unchanged" cannot be diffed against git
 *    here, so we assert structural integrity instead: both files parse as JSON,
 *    are non-empty, share the same top-level key structure, still contain the
 *    `mission.*` / `map.*` / `articles.*` families the redesign references (all
 *    non-empty), and every `data-i18n` key in `index.html` resolves to a
 *    non-empty string in BOTH locales.
 */

var test = require('node:test');
var assert = require('node:assert');
var fs = require('fs');
var path = require('path');

var harness = require('./helpers/dom-harness');

var LOCALES_DIR = path.join(harness.PUBLIC_DIR, 'locales');

// ---------------------------------------------------------------------------
// CSS rule enumeration
// ---------------------------------------------------------------------------

/**
 * Enumerate every leaf style rule (`selector { body }`) in the stylesheet,
 * INCLUDING rules nested inside `@media`/`@supports` blocks. Plain CSS style
 * rules have no nested braces, so the proven `[^{}]+{[^{}]*}` scan from the
 * test harness captures each leaf block; at-rule preludes (e.g. `@media (...)`)
 * are left as inter-match text and skipped. The leading `;`-slice mirrors the
 * harness token parser so a statement at-rule like `@import url('...');` that
 * precedes the first selector is discarded.
 *
 * @param {string} cssText
 * @returns {Array<{selector:string, body:string}>}
 */
function extractStyleRules(cssText) {
  var withoutComments = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
  var rules = [];
  var blockRe = /([^{}]+)\{([^{}]*)\}/g;
  var match;
  while ((match = blockRe.exec(withoutComments)) !== null) {
    var rawSelector = match[1];
    // A real selector never contains a top-level `;`; strip any preceding
    // statement at-rule text.
    var selector = rawSelector.slice(rawSelector.lastIndexOf(';') + 1).trim();
    if (selector === '' || selector.charAt(0) === '@') continue;
    rules.push({ selector: selector, body: match[2] });
  }
  return rules;
}

/** Split a (possibly comma-separated) selector list into trimmed parts. */
function splitSelectorList(selector) {
  return selector.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
}

// The three (and only) selectors premium section styling may be scoped under.
var TARGET_SCOPES = ['.mission-section-premium', '#map-section', '#articles-section'];

function isScoped(selectorPart) {
  for (var i = 0; i < TARGET_SCOPES.length; i++) {
    if (selectorPart.indexOf(TARGET_SCOPES[i]) !== -1) return true;
  }
  return false;
}

/** True if a selector part targets the given bare class name (e.g. "article-card"). */
function referencesClass(selectorPart, bareClass) {
  // word boundary that respects hyphenated class names: ".article-card" must not
  // match ".article-card-foo".
  var re = new RegExp('\\.' + bareClass.replace(/[-]/g, '\\-') + '(?![\\w-])');
  return re.test(selectorPart);
}

/**
 * Tokens / declarations that mark a rule body as part of the PREMIUM redesign
 * card/grid treatment (design §1.3 surfaces/glow/AAA, §1.2 large card/bento
 * radii) as opposed to the pre-existing base styling (which uses --bg-*,
 * --border-color, --shadow-card, --radius-lg, etc.).
 */
var PREMIUM_BODY_SIGNALS = [
  '--surface-canvas', '--surface-raised', '--surface-inset', '--surface-hairline',
  '--glow-pink', '--glow-violet', '--glow-mint', '--glow-amber', '--glow-ambient',
  '--text-aaa', '--text-aaa-muted',
  '--radius-card', '--radius-bento'
];

function bodyIsPremium(body) {
  for (var i = 0; i < PREMIUM_BODY_SIGNALS.length; i++) {
    if (body.indexOf(PREMIUM_BODY_SIGNALS[i]) !== -1) return true;
  }
  // Bento emphasis (a featured tile spanning grid tracks) is a premium layout.
  if (/grid-column\s*:\s*span/i.test(body)) return true;
  return false;
}

// Premium SECTION-SPECIFIC layout classes grouped by their required scope.
var PREMIUM_CLASS_GROUPS = [
  {
    section: 'About (.mission-section-premium)',
    scope: '.mission-section-premium',
    domAncestor: '.mission-section-premium',
    confinedInDom: true,
    classes: ['mission-container', 'mission-visual-grid', 'mission-img-card', 'mission-block-item']
  },
  {
    section: 'Campaigns (#map-section)',
    scope: '#map-section',
    domAncestor: '#map-section',
    confinedInDom: true,
    classes: ['province-details', 'impact-progress']
  },
  {
    section: 'Programs (#articles-section)',
    scope: '#articles-section',
    domAncestor: '#articles-section',
    // .article-card is JS-populated (not in static markup) and intentionally
    // SHARED with suggested-articles, so DOM confinement does not apply; its
    // protection is the "no unscoped premium rule" invariant below.
    confinedInDom: false,
    classes: ['articles-grid', 'article-card']
  }
];

var ALL_PREMIUM_CLASSES = PREMIUM_CLASS_GROUPS.reduce(function (acc, g) {
  return acc.concat(g.classes);
}, []);

var CSS = harness.readStylesCss();
var STYLE_RULES = extractStyleRules(CSS);

// ---------------------------------------------------------------------------
// 1. Scope discipline
// ---------------------------------------------------------------------------

test('scoping: no premium card/grid layout rule leaks as an unscoped global selector', function () {
  var leaks = [];

  STYLE_RULES.forEach(function (rule) {
    if (!bodyIsPremium(rule.body)) return; // only premium card/grid treatments
    splitSelectorList(rule.selector).forEach(function (part) {
      var matched = ALL_PREMIUM_CLASSES.filter(function (cls) {
        return referencesClass(part, cls);
      });
      if (matched.length === 0) return;        // not a premium layout class rule
      if (isScoped(part)) return;              // correctly scoped — fine
      leaks.push({ selector: part, classes: matched });
    });
  });

  assert.strictEqual(
    leaks.length, 0,
    'premium card/grid layout rules must be scoped to .mission-section-premium / ' +
    '#map-section / #articles-section, but these unscoped global selectors apply ' +
    'premium styling (would restyle other sections):\n' +
    leaks.map(function (l) {
      return '  "' + l.selector + '"  (premium classes: ' + l.classes.join(', ') + ')';
    }).join('\n')
  );
});

test('scoping: each premium layout class has its redesign treatment under a target scope', function () {
  PREMIUM_CLASS_GROUPS.forEach(function (group) {
    group.classes.forEach(function (cls) {
      var hasScoped = STYLE_RULES.some(function (rule) {
        return splitSelectorList(rule.selector).some(function (part) {
          return referencesClass(part, cls) && part.indexOf(group.scope) !== -1;
        });
      });
      assert.ok(
        hasScoped,
        'expected at least one rule for ".' + cls + '" scoped under "' + group.scope +
        '" (section ' + group.section + ')'
      );
    });
  });
});

test('scoping: section-unique premium classes are physically confined to their target section', function () {
  var ctx = harness.loadIndexHtml();
  try {
    PREMIUM_CLASS_GROUPS.forEach(function (group) {
      if (!group.confinedInDom) return;
      group.classes.forEach(function (cls) {
        var nodes = ctx.document.querySelectorAll('.' + cls);
        for (var i = 0; i < nodes.length; i++) {
          var inSection = nodes[i].closest(group.domAncestor);
          assert.ok(
            inSection,
            'element with class ".' + cls + '" must live inside "' + group.domAncestor +
            '" so its (possibly unscoped) layout rules cannot restyle other sections'
          );
        }
      });
    });
  } finally {
    ctx.window.close();
  }
});

test('scoping: other sections keep existing layout (global base + unrelated layout anchors intact)', function () {
  // The pre-existing GLOBAL base rules for the shared classes must remain so
  // consumers outside #articles-section (e.g. suggested-articles) keep styling.
  ['article-card', 'articles-grid'].forEach(function (cls) {
    var hasUnscopedBase = STYLE_RULES.some(function (rule) {
      return splitSelectorList(rule.selector).some(function (part) {
        return referencesClass(part, cls) && !isScoped(part);
      });
    });
    assert.ok(
      hasUnscopedBase,
      'the global base rule for ".' + cls + '" must remain (so non-target sections ' +
      'such as suggested-articles keep their existing layout)'
    );
  });

  // Unrelated section layout anchors must still exist (redesign did not strip or
  // re-scope existing global layout for the rest of the page).
  ['metrics-grid', 'rights-dashboard-grid', 'premium-hero', 'suggested-articles-section'].forEach(function (cls) {
    var present = STYLE_RULES.some(function (rule) {
      return splitSelectorList(rule.selector).some(function (part) {
        return referencesClass(part, cls);
      });
    });
    assert.ok(present, 'existing layout class ".' + cls + '" must still be styled');
  });
});

// ---------------------------------------------------------------------------
// 2. Locale integrity
// ---------------------------------------------------------------------------

function readLocaleRaw(lang) {
  return fs.readFileSync(path.join(LOCALES_DIR, lang + '.json'), 'utf8');
}

/** Flatten a nested locale object into a map of dotted-path -> string leaf. */
function flattenLeaves(obj, prefix, out) {
  out = out || {};
  prefix = prefix || '';
  if (obj === null || obj === undefined) return out;
  if (typeof obj === 'string') {
    out[prefix] = obj;
    return out;
  }
  if (Array.isArray(obj)) {
    for (var i = 0; i < obj.length; i++) {
      flattenLeaves(obj[i], prefix ? prefix + '.' + i : String(i), out);
    }
    return out;
  }
  if (typeof obj === 'object') {
    var keys = Object.keys(obj);
    for (var j = 0; j < keys.length; j++) {
      flattenLeaves(obj[keys[j]], prefix ? prefix + '.' + keys[j] : keys[j], out);
    }
  }
  return out;
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

test('locale integrity: ar.json and en.json are valid, non-empty JSON', function () {
  ['ar', 'en'].forEach(function (lang) {
    var raw = readLocaleRaw(lang);
    var parsed;
    assert.doesNotThrow(function () { parsed = JSON.parse(raw); }, lang + '.json must be valid JSON');
    assert.ok(parsed && typeof parsed === 'object' && !Array.isArray(parsed), lang + '.json must be an object');
    assert.ok(Object.keys(parsed).length > 0, lang + '.json must be non-empty');
  });
});

test('locale integrity: ar.json and en.json share the same top-level key structure', function () {
  var ar = JSON.parse(readLocaleRaw('ar'));
  var en = JSON.parse(readLocaleRaw('en'));
  var arKeys = Object.keys(ar).sort();
  var enKeys = Object.keys(en).sort();
  assert.deepStrictEqual(
    arKeys, enKeys,
    'ar.json and en.json must expose the same top-level i18n key families'
  );
});

test('locale integrity: mission.*, map.* and articles.* families are present and non-empty in both locales', function () {
  var arFlat = flattenLeaves(JSON.parse(readLocaleRaw('ar')));
  var enFlat = flattenLeaves(JSON.parse(readLocaleRaw('en')));

  ['mission', 'map', 'articles'].forEach(function (family) {
    [['ar', arFlat], ['en', enFlat]].forEach(function (pair) {
      var lang = pair[0];
      var flat = pair[1];
      var familyKeys = Object.keys(flat).filter(function (k) {
        return k.indexOf(family + '.') === 0;
      });
      assert.ok(
        familyKeys.length > 0,
        lang + '.json must still contain the "' + family + '.*" family referenced by the redesign'
      );
      familyKeys.forEach(function (key) {
        assert.ok(
          isNonEmptyString(flat[key]),
          lang + '.json key "' + key + '" must resolve to a non-empty string'
        );
      });
    });
  });
});

test('locale integrity: every data-i18n key in index.html resolves to non-empty text in BOTH locales', function () {
  var arFlat = flattenLeaves(JSON.parse(readLocaleRaw('ar')));
  var enFlat = flattenLeaves(JSON.parse(readLocaleRaw('en')));

  var ctx = harness.loadIndexHtml();
  var records;
  try {
    records = harness.collectI18nKeys(ctx.document);
  } finally {
    ctx.window.close();
  }

  assert.ok(records.length > 0, 'index.html must contain data-i18n keys');

  var unresolved = [];
  records.forEach(function (rec) {
    var ar = arFlat[rec.key];
    var en = enFlat[rec.key];
    if (!isNonEmptyString(ar) || !isNonEmptyString(en)) {
      unresolved.push({
        key: rec.key,
        ar: isNonEmptyString(ar),
        en: isNonEmptyString(en)
      });
    }
  });

  assert.strictEqual(
    unresolved.length, 0,
    'every data-i18n key must resolve to non-empty text in both ar and en; unresolved:\n' +
    unresolved.map(function (u) {
      return '  "' + u.key + '" (ar: ' + u.ar + ', en: ' + u.en + ')';
    }).join('\n')
  );
});
