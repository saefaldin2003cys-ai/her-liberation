'use strict';

/**
 * Task 13.1 — Integration smoke: province interaction (no-regression).
 *
 * Requirement 8.3: the redesign SHALL preserve the existing interactive
 * provinces map functionality within the Campaigns section (`#map-section`).
 *
 * This test exercises the REAL runtime: it loads the served `public/index.html`
 * markup into jsdom and evaluates the actual, unmodified `public/js/script.js`
 * inside that window (via `runScripts: 'outside-only'`, which exposes
 * `window.eval`). It then fires the page's own `DOMContentLoaded` wiring — which
 * registers the real `.province-btn` click delegation on `#provincesGrid` — and
 * uses the real `initMap()` to render the province buttons from the hardcoded
 * `provincesData` array.
 *
 * The site fetches stats/articles/polls from a backend on init, and jsdom
 * implements neither `matchMedia` nor `fetch`, so both are stubbed before the
 * scripts run. No live backend is required: `fetch` resolves to inert payloads.
 *
 * Contract under test (Requirement 8.3): clicking the first `.province-btn`
 *   - removes `.hidden` from `#provinceDetails` (reveal), and
 *   - populates `#provinceName`, `#provinceRate`, `#provinceType`,
 *     `#provinceStory` with non-empty text.
 *
 * This intentionally drives the SAME `#map-section` hook IDs/classes the
 * redesign must preserve, so if the restructured markup breaks the
 * click->reveal->populate contract, this test fails loudly (a real regression
 * finding) rather than silently passing.
 *
 * NOTE: this test does not modify any source; it only reads the served files.
 */

var test = require('node:test');
var assert = require('node:assert');
var fs = require('node:fs');
var path = require('node:path');
var JSDOM = require('jsdom').JSDOM;

var PUBLIC_DIR = path.resolve(__dirname, '..', 'public');
var CAMPAIGN_HTML_PATH = path.join(PUBLIC_DIR, 'before-18.html');
var SCRIPT_PATH = path.join(PUBLIC_DIR, 'js', 'script.js');

/**
 * Boot the real page markup + real script.js inside a controlled jsdom window
 * with the minimal browser APIs the runtime touches on init stubbed out, then
 * fire the page's own DOMContentLoaded wiring.
 *
 * @returns {{window: Window, document: Document, close: Function}}
 */
function bootRealApp() {
  var html = fs.readFileSync(CAMPAIGN_HTML_PATH, 'utf8');
  var scriptSource = fs.readFileSync(SCRIPT_PATH, 'utf8');

  // `outside-only` gives us a live window with `window.eval` but does NOT auto
  // run the page's external <script src> tags — so we control exactly what runs
  // and in what environment.
  var dom = new JSDOM(html, {
    url: 'http://localhost/',
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  var win = dom.window;

  // jsdom does not implement matchMedia; initTheme() calls it synchronously.
  win.matchMedia = function (query) {
    return {
      media: query,
      matches: false,
      addListener: function () {},
      removeListener: function () {},
      addEventListener: function () {},
      removeEventListener: function () {}
    };
  };

  // Stub the network so the app initializes without a live backend. Resolve to
  // inert, shape-appropriate payloads so the various .then() handlers are happy
  // and produce no unhandled rejections.
  win.fetch = function (url) {
    var u = String(url);
    var body = {};
    if (/\/articles/.test(u)) {
      body = [];
    } else if (/\/stats/.test(u)) {
      body = { views: 0, likes: 0 };
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: function () { return Promise.resolve(body); }
    });
  };

  // Execute the REAL, unmodified script.js in the window's global scope. Top
  // level only declares vars/functions and registers a DOMContentLoaded
  // listener; nothing here touches the network synchronously.
  win.eval(scriptSource);

  // The real DOMContentLoaded already fired during construction (before our
  // eval registered its listener), so dispatch it now to run the page's init,
  // which wires the `#provincesGrid` click delegation.
  win.document.dispatchEvent(new win.Event('DOMContentLoaded', {
    bubbles: false,
    cancelable: false
  }));

  return {
    window: win,
    document: win.document,
    close: function () { win.close(); }
  };
}

/**
 * Let the page's deferred init settle. DOMContentLoaded kicks off backend
 * fetches (stats/articles/views) plus a couple of short (~100ms) deferred
 * timers unrelated to the map (scroll-reveal/counters and the language-toggle
 * initial state). Their callbacks run after our synchronous assertions; we let
 * them complete while the window is still open so they operate on a live
 * `document`, then the window can be torn down with no dangling work. None of
 * this affects the province assertions, which are fully synchronous.
 *
 * @returns {Promise<void>}
 */
function flushPendingAsync() {
  // Slightly longer than the page's ~100ms deferred timers so they fire while
  // the jsdom window/document are still valid.
  return new Promise(function (resolve) { setTimeout(resolve, 160); });
}

test('clicking a .province-btn reveals #provinceDetails and populates its fields', async function () {
  var app = bootRealApp();
  var document = app.document;
  try {
    var grid = document.getElementById('provincesGrid');
    assert.ok(grid, '#provincesGrid hook must exist in the redesigned markup');

    var details = document.getElementById('provinceDetails');
    assert.ok(details, '#provinceDetails hook must exist in the redesigned markup');

    // Render the province buttons via the real code path (initMap reads the
    // hardcoded provincesData array — no network involved).
    assert.strictEqual(
      typeof app.window.initMap, 'function',
      'initMap should be exposed on the window scope'
    );
    app.window.initMap();

    var buttons = grid.querySelectorAll('.province-btn');
    assert.ok(buttons.length > 0, 'initMap should render at least one .province-btn');

    // Details start hidden so the click is what reveals them.
    assert.ok(
      details.classList.contains('hidden'),
      '#provinceDetails should be hidden before any province is selected'
    );

    // Simulate a real user click on the first province button. The page's own
    // delegated listener on #provincesGrid handles it and calls selectProvince.
    buttons[0].click();

    // Reveal: .hidden removed.
    assert.ok(
      !details.classList.contains('hidden'),
      'clicking a .province-btn should reveal #provinceDetails (remove .hidden)'
    );

    // Populate: all four detail fields are non-empty.
    var fieldIds = ['provinceName', 'provinceRate', 'provinceType', 'provinceStory'];
    fieldIds.forEach(function (id) {
      var el = document.getElementById(id);
      assert.ok(el, '#' + id + ' hook must exist in the redesigned markup');
      var text = (el.textContent || '').trim();
      assert.ok(
        text.length > 0,
        '#' + id + ' should be populated with non-empty text after clicking a province'
      );
    });
  } finally {
    await flushPendingAsync();
    app.close();
  }
});

test('selecting different provinces updates the detail fields (real selectProvince path)', async function () {
  var app = bootRealApp();
  var document = app.document;
  try {
    app.window.initMap();
    var grid = document.getElementById('provincesGrid');
    var buttons = grid.querySelectorAll('.province-btn');
    assert.ok(buttons.length >= 2, 'expected at least two provinces to compare selections');

    var nameEl = document.getElementById('provinceName');

    buttons[0].click();
    var firstName = (nameEl.textContent || '').trim();
    assert.ok(firstName.length > 0, 'first selection should populate #provinceName');

    buttons[1].click();
    var secondName = (nameEl.textContent || '').trim();
    assert.ok(secondName.length > 0, 'second selection should populate #provinceName');

    // Distinct provinces render distinct names — confirms the click maps to the
    // correct data row, not a stale/static value.
    assert.notStrictEqual(
      firstName, secondName,
      'selecting a different province should update #provinceName'
    );

    // Details remain revealed across selections.
    var details = document.getElementById('provinceDetails');
    assert.ok(
      !details.classList.contains('hidden'),
      '#provinceDetails should stay revealed after switching provinces'
    );
  } finally {
    await flushPendingAsync();
    app.close();
  }
});
