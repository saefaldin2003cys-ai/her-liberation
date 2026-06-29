'use strict';

/**
 * Task 12.3 — Property 5: Language direction invariant.
 *
 * For any selected language L in {ar, en}, after the real i18n engine applies L,
 * the <html> element's `lang` attribute equals L and its `dir` attribute equals
 * the corresponding direction (rtl for ar, ltr for en), and the language-switch
 * controls remain present and functional.
 *
 * Approach: exercise the REAL engine. We load the served public/index.html into
 * jsdom (so the real toggle markup — #languageToggle / #langIcon /
 * #headerLangToggle — is present), stub window.fetch to serve the real
 * public/locales/{ar,en}.json, then evaluate the real public/js/i18n.js inside
 * that window. We then drive window.i18n.setLanguage(...) — the same API the
 * toggle controls invoke — over fast-check-generated language sequences and over
 * the real toggle action (newLang = current === 'ar' ? 'en' : 'ar'), asserting
 * the invariant holds after every application.
 *
 * No source files are modified; this is a test-only harness.
 *
 * Validates: Requirements 6.4, 8.1
 */

var test = require('node:test');
var assert = require('node:assert');
var fs = require('fs');
var path = require('path');
var fc = require('fast-check');

var harness = require('./helpers/dom-harness');

var PUBLIC_DIR = path.resolve(__dirname, '..', 'public');

var LOCALES = {
  ar: JSON.parse(fs.readFileSync(path.join(PUBLIC_DIR, 'locales', 'ar.json'), 'utf8')),
  en: JSON.parse(fs.readFileSync(path.join(PUBLIC_DIR, 'locales', 'en.json'), 'utf8'))
};

var I18N_SOURCE = fs.readFileSync(path.join(PUBLIC_DIR, 'js', 'i18n.js'), 'utf8');

var SUPPORTED = ['ar', 'en'];

function expectedDir(lang) {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

// Build a jsdom window that runs the REAL i18n engine against the REAL markup,
// with fetch stubbed to serve the REAL locale JSON files.
function makeEngineContext() {
  // runScripts enabled so an injected <script> runs in the real window scope.
  // External page scripts (src="/js/*.js") are NOT fetched (no resource loader),
  // so only our injected real engine and the page's harmless inline router run.
  var ctx = harness.loadIndexHtml({ runScripts: true });
  var window = ctx.window;
  var document = ctx.document;

  // Stub fetch BEFORE the engine initializes so it loads the real locale JSON.
  window.fetch = function (url) {
    var match = /\/locales\/(ar|en)\.json$/.exec(String(url));
    if (match) {
      var data = LOCALES[match[1]];
      return Promise.resolve({
        ok: true,
        json: function () { return Promise.resolve(data); }
      });
    }
    return Promise.resolve({
      ok: false,
      json: function () { return Promise.resolve({}); }
    });
  };

  // Execute the real engine inside the window via an injected script element.
  // The IIFE auto-initializes (readyState is 'complete' for constructed jsdom).
  var script = document.createElement('script');
  script.textContent = I18N_SOURCE;
  document.body.appendChild(script);

  return ctx;
}

// Wait until the engine has finished its initial async load.
function waitForInit(window) {
  return new Promise(function (resolve, reject) {
    var attempts = 0;
    (function poll() {
      if (window.i18n && window.i18n.isInitialized && window.i18n.isInitialized()) {
        return resolve();
      }
      if (attempts++ > 200) {
        return reject(new Error('i18n engine did not initialize'));
      }
      setTimeout(poll, 5);
    })();
  });
}

function assertInvariant(document, lang) {
  var html = document.documentElement;
  assert.strictEqual(
    html.getAttribute('lang'),
    lang,
    'html lang should equal applied language ' + lang
  );
  assert.strictEqual(
    html.getAttribute('dir'),
    expectedDir(lang),
    'html dir should be ' + expectedDir(lang) + ' for ' + lang
  );
}

function assertControlsPresent(document) {
  // The language-switch controls must remain in the DOM and keep their hooks.
  assert.ok(document.getElementById('languageToggle'), '#languageToggle present');
}

test('Property 5: <html> lang/dir match the applied language over any sequence', async function () {
  await fc.assert(
    fc.asyncProperty(
      fc.array(fc.constantFrom('ar', 'en'), { minLength: 1, maxLength: 8 }),
      async function (sequence) {
        var ctx = makeEngineContext();
        var window = ctx.window;
        var document = ctx.document;
        try {
          await waitForInit(window);

          // Default after init is Arabic / RTL.
          var initial = window.i18n.getCurrentLanguage();
          assert.ok(SUPPORTED.indexOf(initial) !== -1, 'initial language supported');
          assertInvariant(document, initial);
          assertControlsPresent(document);

          for (var i = 0; i < sequence.length; i++) {
            var lang = sequence[i];
            await window.i18n.setLanguage(lang);

            assert.strictEqual(
              window.i18n.getCurrentLanguage(), lang,
              'engine current language tracks the applied language'
            );
            assert.strictEqual(
              window.i18n.getDirection(), expectedDir(lang),
              'engine getDirection() matches the applied language'
            );
            assertInvariant(document, lang);
            // Controls remain present after every switch.
            assertControlsPresent(document);
          }
        } finally {
          window.close();
        }
      }
    ),
    { numRuns: 100 }
  );
});

test('Property 5: the language-switch control action keeps the invariant over repeated toggles', async function () {
  await fc.assert(
    fc.asyncProperty(
      fc.integer({ min: 1, max: 8 }),
      async function (toggleCount) {
        var ctx = makeEngineContext();
        var window = ctx.window;
        var document = ctx.document;
        try {
          await waitForInit(window);

          for (var i = 0; i < toggleCount; i++) {
            // Replicate the real toggle control's behavior (script.js
            // handleLanguageToggle): switch to the OTHER language via the
            // engine API the controls invoke.
            var current = window.i18n.getCurrentLanguage();
            var next = current === 'ar' ? 'en' : 'ar';

            await window.i18n.setLanguage(next);

            assert.strictEqual(
              window.i18n.getCurrentLanguage(), next,
              'toggle switches to the other language'
            );
            assertInvariant(document, next);
            assertControlsPresent(document);
          }
        } finally {
          window.close();
        }
      }
    ),
    { numRuns: 100 }
  );
});
