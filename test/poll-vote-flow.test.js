'use strict';

/**
 * Task 13.2 — Integration smoke: polls vote flow (no-regression).
 *
 * Requirement 8.4: the redesign SHALL preserve the existing poll/referendum
 * voting functionality within the Poll section (`#poll-section`). The poll
 * section sits OUTSIDE the three redesigned sections, but global tokens/fonts
 * apply to it, so this is a no-regression smoke test of the real runtime.
 *
 * Like the province smoke test, this exercises the REAL runtime: it loads the
 * served `public/index.html` markup into jsdom and evaluates the actual,
 * unmodified `public/js/script.js` inside that window (`runScripts:
 * 'outside-only'`, which exposes `window.eval`). It then fires the page's own
 * `DOMContentLoaded` wiring — which registers the real `.poll-option` click
 * delegation on `#pollOptions`.
 *
 * The site fetches stats/articles on init and POSTs votes to `/poll/vote`, and
 * jsdom implements neither `matchMedia` nor `fetch`, so both are stubbed before
 * the scripts run. No live backend is required: `fetch` resolves to inert
 * payloads, with `/poll/vote` resolving a sensible poll-results payload so the
 * vote handler's promise chain completes and reveals the results.
 *
 * Contract under test (Requirement 8.4): selecting a `.poll-option` inside
 * `#pollForm`/`#pollOptions` and letting the real vote handler run
 *   - hides `#pollForm` (adds `.hidden`), and
 *   - reveals `#pollResults` (removes `.hidden`), and
 *   - populates the result fields (#agreePercent / #disagreePercent / counts).
 *
 * This intentionally drives the SAME `#poll-section` hook IDs/classes the
 * redesign must preserve, so if the markup breaks the
 * select->vote->reveal->populate contract, this test fails loudly (a real
 * regression finding) rather than silently passing.
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

// Sensible poll-results payload the real handler expects: total + per-choice
// counts (keys `agree18` / `disagree` match updatePollResults()).
var POLL_RESULTS_PAYLOAD = { total: 100, agree18: 70, disagree: 30 };

/**
 * Boot the real page markup + real script.js inside a controlled jsdom window
 * with the minimal browser APIs the runtime touches stubbed out, then fire the
 * page's own DOMContentLoaded wiring.
 *
 * @returns {{window: Window, document: Document, close: Function}}
 */
function bootRealApp() {
  var html = fs.readFileSync(CAMPAIGN_HTML_PATH, 'utf8');
  var scriptSource = fs.readFileSync(SCRIPT_PATH, 'utf8');

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

  // Stub the network so the app initializes and the vote handler completes
  // without a live backend. `/poll/vote` resolves the poll-results payload;
  // other endpoints resolve inert, shape-appropriate payloads.
  win.fetch = function (url) {
    var u = String(url);
    var body = {};
    if (/\/poll\/vote/.test(u)) {
      body = POLL_RESULTS_PAYLOAD;
    } else if (/\/poll/.test(u)) {
      body = POLL_RESULTS_PAYLOAD;
    } else if (/\/articles/.test(u)) {
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

  // Execute the REAL, unmodified script.js in the window's global scope.
  win.eval(scriptSource);

  // The real DOMContentLoaded already fired during construction (before our
  // eval registered its listener), so dispatch it now to run the page's init,
  // which wires the `#pollOptions` click delegation.
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
 * Let the page's deferred init plus the vote handler's async promise chain
 * settle. The vote flow resolves a stubbed fetch, then runs `.then()` handlers
 * (microtasks) and a ~100ms `setTimeout` bar animation. We wait slightly longer
 * than that so all of it fires while the jsdom window/document are still valid,
 * then the window can be torn down with no dangling work.
 *
 * @returns {Promise<void>}
 */
function flushPendingAsync() {
  return new Promise(function (resolve) { setTimeout(resolve, 160); });
}

test('the poll hooks (#pollForm / #pollOptions / .poll-option / #pollResults) exist in the markup', async function () {
  var app = bootRealApp();
  var document = app.document;
  try {
    assert.ok(document.getElementById('pollForm'), '#pollForm hook must exist');
    assert.ok(document.getElementById('pollOptions'), '#pollOptions hook must exist');
    assert.ok(document.getElementById('pollResults'), '#pollResults hook must exist');

    var options = document.querySelectorAll('#pollOptions .poll-option');
    assert.ok(options.length > 0, 'at least one .poll-option must exist inside #pollOptions');
    // Each option must carry a data-vote choice the handler reads.
    options.forEach(function (opt) {
      assert.ok(
        (opt.getAttribute('data-vote') || '').trim().length > 0,
        '.poll-option must carry a non-empty data-vote choice'
      );
    });
  } finally {
    await flushPendingAsync();
    app.close();
  }
});

test('selecting a .poll-option and voting reveals #pollResults and populates it (real handler path)', async function () {
  var app = bootRealApp();
  var document = app.document;
  try {
    var pollForm = document.getElementById('pollForm');
    var pollResults = document.getElementById('pollResults');
    var pollOptions = document.getElementById('pollOptions');
    assert.ok(pollForm && pollResults && pollOptions, 'poll hooks must exist before voting');

    // Results start hidden; the form is visible. The vote is what flips them.
    assert.ok(
      pollResults.classList.contains('hidden'),
      '#pollResults should be hidden before any vote'
    );
    assert.ok(
      !pollForm.classList.contains('hidden'),
      '#pollForm should be visible before any vote'
    );

    // localStorage may carry state from a prior run in the shared jsdom env;
    // ensure we start from the not-voted state for a clean flow.
    app.window.localStorage.removeItem('poll_voted');

    var option = pollOptions.querySelector('.poll-option');
    assert.ok(option, 'expected at least one .poll-option to click');

    // Simulate a real user click. The page's delegated listener on
    // #pollOptions handles it and calls the real submitPollVote().
    option.click();

    // The reveal happens in the fetch().then() chain; let it settle.
    await flushPendingAsync();

    // Reveal contract: form hidden, results shown.
    assert.ok(
      pollForm.classList.contains('hidden'),
      'voting should hide #pollForm (add .hidden)'
    );
    assert.ok(
      !pollResults.classList.contains('hidden'),
      'voting should reveal #pollResults (remove .hidden)'
    );

    // Populate contract: percentages reflect the resolved payload
    // (agree18 70 / total 100 = 70%, disagree 30 / 100 = 30%).
    var agreePercent = document.getElementById('agreePercent');
    var disagreePercent = document.getElementById('disagreePercent');
    assert.ok(agreePercent && disagreePercent, 'result percent hooks must exist');
    assert.strictEqual(
      (agreePercent.textContent || '').trim(), '70%',
      '#agreePercent should reflect the voted results payload'
    );
    assert.strictEqual(
      (disagreePercent.textContent || '').trim(), '30%',
      '#disagreePercent should reflect the voted results payload'
    );

    // Vote count totals populated too.
    var agreeCount = document.getElementById('agreeCount');
    var disagreeCount = document.getElementById('disagreeCount');
    assert.ok(agreeCount && disagreeCount, 'result count hooks must exist');
    assert.strictEqual((agreeCount.textContent || '').trim(), '70', '#agreeCount populated');
    assert.strictEqual((disagreeCount.textContent || '').trim(), '30', '#disagreeCount populated');
  } finally {
    await flushPendingAsync();
    app.close();
  }
});

test('invoking the real submitPollVote handler directly drives the same reveal flow', async function () {
  var app = bootRealApp();
  var document = app.document;
  try {
    var pollForm = document.getElementById('pollForm');
    var pollResults = document.getElementById('pollResults');

    assert.strictEqual(
      typeof app.window.submitPollVote, 'function',
      'submitPollVote should be exposed on the window scope'
    );

    app.window.localStorage.removeItem('poll_voted');

    var choice = document.querySelector('#pollOptions .poll-option').getAttribute('data-vote');
    app.window.submitPollVote(choice);

    await flushPendingAsync();

    assert.ok(
      pollForm.classList.contains('hidden'),
      'submitPollVote should hide #pollForm'
    );
    assert.ok(
      !pollResults.classList.contains('hidden'),
      'submitPollVote should reveal #pollResults'
    );
  } finally {
    await flushPendingAsync();
    app.close();
  }
});
