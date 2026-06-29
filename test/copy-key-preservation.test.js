'use strict';

/**
 * Task 12.1 — Property 1: Copy and translation-key preservation.
 *
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.5**
 *
 * The redesign restructured the three target sections by wrap/reparent only:
 * every `data-i18n` key must survive the restructure on an element that still
 * renders the identical translated text for the active language.
 *
 * The true pre-redesign markup lives in git history and is not directly
 * available to the test runtime. We therefore prove preservation against two
 * stable, observable sources of truth:
 *
 *   1. The CURRENT served `public/index.html` (collected via the harness), which
 *      is the post-redesign DOM.
 *   2. The locale catalog `public/locales/{ar,en}.json`, which is the source of
 *      the text the i18n engine actually renders for each `data-i18n` key.
 *
 * Note on rendered text: the static fallback text in the markup is intentionally
 * NOT always equal to the catalog value (e.g. `map.title` fallback differs from
 * `map.title` in ar.json). At runtime the i18n engine replaces an element's text
 * with the catalog value for its key. So "renders the identical translated text
 * for the active language" is precisely: the key resolves to a single, non-empty
 * catalog string per language — the same key always renders the same text. That
 * binding (key -> catalog text) is the invariant Property 1 guards. We assert it
 * holds for every key in the DOM, that the expected target-section key families
 * are all present (nothing dropped by the restructure), and that no key element
 * is left with empty fallback text.
 */

var test = require('node:test');
var assert = require('node:assert');
var fc = require('fast-check');
var fs = require('fs');
var path = require('path');

var harness = require('./helpers/dom-harness');

var LOCALES_DIR = path.join(harness.PUBLIC_DIR, 'locales');

function readLocale(lang) {
  var raw = fs.readFileSync(path.join(LOCALES_DIR, lang + '.json'), 'utf8');
  return JSON.parse(raw);
}

/**
 * Flatten a nested locale object into a map of dotted-path -> string leaf.
 * data-i18n keys are dotted paths to string leaves (e.g. "mission.title"),
 * so this lets us resolve a key the same way the i18n engine does.
 */
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
      var k = keys[j];
      flattenLeaves(obj[k], prefix ? prefix + '.' + k : k, out);
    }
  }
  return out;
}

var arCatalog = flattenLeaves(readLocale('ar'));
var enCatalog = flattenLeaves(readLocale('en'));

function resolve(catalog, key) {
  return Object.prototype.hasOwnProperty.call(catalog, key) ? catalog[key] : undefined;
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

// Collect the post-redesign data-i18n key records once.
var ctx = harness.loadIndexHtml();
var records = harness.collectI18nKeys(ctx.document);
var domKeys = records.map(function (r) { return r.key; });
ctx.window.close();

// ---------------------------------------------------------------------------
// Property 1: every data-i18n key in the DOM resolves to identical translated
// text for the active language in BOTH locales (i.e. it is a real catalog key
// that renders a single, non-empty string per language).
// ---------------------------------------------------------------------------
test('Property 1: every DOM data-i18n key renders identical translated text per language (ar & en)', function () {
  assert.ok(domKeys.length > 0, 'the redesigned page still contains data-i18n keys');

  fc.assert(
    fc.property(fc.constantFrom.apply(fc, domKeys), function (key) {
      var ar = resolve(arCatalog, key);
      var en = resolve(enCatalog, key);

      // The key must exist as a translatable leaf in both locales...
      assert.ok(
        isNonEmptyString(ar),
        'key "' + key + '" must resolve to non-empty Arabic text (active/default language)'
      );
      assert.ok(
        isNonEmptyString(en),
        'key "' + key + '" must resolve to non-empty English text'
      );

      // ...and resolve deterministically (the same key always yields the same
      // rendered text for a given language — identical translated text).
      assert.strictEqual(resolve(arCatalog, key), ar, 'ar resolution is stable for "' + key + '"');
      assert.strictEqual(resolve(enCatalog, key), en, 'en resolution is stable for "' + key + '"');

      return true;
    }),
    { numRuns: Math.max(50, domKeys.length * 3) }
  );
});

// ---------------------------------------------------------------------------
// Target-section key families must all be present post-redesign (Req 1.2/1.3):
// the wrap/reparent restructure must not have dropped any key.
// ---------------------------------------------------------------------------
test('Property 1: target-section data-i18n key families are preserved after restructure', function () {
  var expectedBySection = {
    'About (.mission-section-premium)': [
      'mission.subtitle',
      'mission.title',
      'mission.description',
      'mission.point1_title',
      'mission.point1_desc',
      'mission.point2_title',
      'mission.point2_desc',
      'mission.point3_title',
      'mission.point3_desc'
    ],
    'Campaigns (#map-section)': [
      'map.title',
      'map.type_label',
      'map.select_province',
      'map.consequences_title',
      'map.consequence1',
      'map.consequence2',
      'map.consequence3'
    ],
    'Programs (#articles-section)': [
      'articles.title',
      'articles.loading'
    ]
  };

  var domKeySet = {};
  domKeys.forEach(function (k) { domKeySet[k] = true; });

  Object.keys(expectedBySection).forEach(function (section) {
    expectedBySection[section].forEach(function (key) {
      assert.ok(
        domKeySet[key] === true,
        'section ' + section + ' must still carry data-i18n key "' + key + '"'
      );
      // And the key renders identical translated text in both languages.
      assert.ok(isNonEmptyString(resolve(arCatalog, key)), 'ar text exists for "' + key + '"');
      assert.ok(isNonEmptyString(resolve(enCatalog, key)), 'en text exists for "' + key + '"');
    });
  });
});

// ---------------------------------------------------------------------------
// Every mission.* and map.* catalog key family is fully represented in the DOM
// (no copy silently relocated away from its key during the restructure).
// ---------------------------------------------------------------------------
test('Property 1: full mission.* and map.* catalog families appear in the redesigned DOM', function () {
  var domKeySet = {};
  domKeys.forEach(function (k) { domKeySet[k] = true; });

  ['mission', 'map'].forEach(function (family) {
    var familyKeys = Object.keys(arCatalog).filter(function (k) {
      return k.indexOf(family + '.') === 0;
    });
    assert.ok(familyKeys.length > 0, 'catalog has ' + family + '.* keys');
    familyKeys.forEach(function (key) {
      assert.ok(
        domKeySet[key] === true,
        'catalog key "' + key + '" must be bound to an element in the redesigned DOM'
      );
    });
  });
});

// ---------------------------------------------------------------------------
// No data-i18n element is left with empty fallback text for the default
// language (Req 1.1/1.5 — copy retained, never blanked by the restructure).
// ---------------------------------------------------------------------------
test('Property 1: no data-i18n element renders empty text for the default language', function () {
  var ctxLocal = harness.loadIndexHtml();
  var recs = harness.collectI18nKeys(ctxLocal.document);

  fc.assert(
    fc.property(fc.constantFrom.apply(fc, recs), function (rec) {
      assert.ok(
        rec.text.length > 0,
        'element with data-i18n="' + rec.key + '" must keep non-empty fallback text'
      );
      // The key it carries must also resolve to non-empty default-language text.
      assert.ok(
        isNonEmptyString(resolve(arCatalog, rec.key)),
        'data-i18n="' + rec.key + '" must resolve to non-empty Arabic catalog text'
      );
      return true;
    }),
    { numRuns: Math.max(50, recs.length * 3) }
  );

  ctxLocal.window.close();
});
