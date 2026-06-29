'use strict';

/**
 * Task 5.2 — Property 7: Motion and reduced-motion behavior.
 *
 * The reveal enhancer (design §7, appended to public/js/script.js) is a small
 * ES5 IIFE that:
 *   - reads `.reveal-on-scroll` targets and writes `.is-revealed`;
 *   - when `prefers-reduced-motion: reduce` is set OR `IntersectionObserver` is
 *     unavailable, immediately reveals ALL targets (no observation);
 *   - otherwise observes each target and reveals it on intersection, then
 *     unobserves it.
 *
 * This test exercises the REAL code: it extracts the reveal IIFE source verbatim
 * from `public/js/script.js` and evaluates it inside a controlled jsdom window
 * (via `runScripts: 'outside-only'`, which exposes `window.eval` for executing
 * the source in the window's global scope). jsdom implements neither
 * `matchMedia` nor `IntersectionObserver`, so each scenario injects a fake
 * `matchMedia` and either a controllable `IntersectionObserver` or none at all,
 * fully driving the three documented branches.
 *
 * Over a varying set of N `.reveal-on-scroll` targets (N in 0..12) the property
 * asserts:
 *   (a) motion allowed + observer present: targets start hidden (no
 *       `.is-revealed`) and are all observed, then become revealed once
 *       intersection is simulated;
 *   (b) prefers-reduced-motion=reduce: ALL targets revealed immediately, with
 *       no observer ever created;
 *   (c) IntersectionObserver unavailable: ALL targets revealed immediately.
 *
 * **Validates: Requirements 4.4, 7.3**
 */

var test = require('node:test');
var assert = require('node:assert');
var fs = require('node:fs');
var path = require('node:path');
var fc = require('fast-check');
var JSDOM = require('jsdom').JSDOM;

var SCRIPT_PATH = path.resolve(__dirname, '..', 'public', 'js', 'script.js');

/**
 * Extract the reveal-entrance IIFE source verbatim from public/js/script.js.
 * The block is anchored on its section comment and captured from its opening
 * `(function () {` through the final `})();` invocation. Throwing here (rather
 * than silently falling back) keeps the test honest: if the IIFE is moved or
 * removed, this test fails loudly instead of testing a stale copy.
 *
 * @returns {string} the IIFE source, ready to be evaluated in a window scope.
 */
function extractRevealIife() {
  var src = fs.readFileSync(SCRIPT_PATH, 'utf8');
  var markerIdx = src.indexOf('Reveal Entrance Enhancer');
  assert.notStrictEqual(markerIdx, -1, 'reveal enhancer section not found in script.js');

  var startIdx = src.indexOf('(function () {', markerIdx);
  assert.notStrictEqual(startIdx, -1, 'reveal IIFE opening not found in script.js');

  var closer = '})();';
  var endIdx = src.indexOf(closer, startIdx);
  assert.notStrictEqual(endIdx, -1, 'reveal IIFE closing not found in script.js');

  return src.slice(startIdx, endIdx + closer.length);
}

var REVEAL_IIFE_SOURCE = extractRevealIife();

/**
 * Build a controllable fake IntersectionObserver constructor. Instances record
 * the elements they observe and expose `triggerAll()` to simulate every
 * observed element becoming intersecting. A shared registry tracks all created
 * instances so the test can fire intersection after the enhancer runs.
 *
 * @returns {{ctor: Function, instances: Array}}
 */
function makeControllableObserver() {
  var instances = [];

  function FakeIntersectionObserver(callback) {
    this.callback = callback;
    this.observed = [];
    instances.push(this);
  }
  FakeIntersectionObserver.prototype.observe = function (el) {
    this.observed.push(el);
  };
  FakeIntersectionObserver.prototype.unobserve = function (el) {
    var idx = this.observed.indexOf(el);
    if (idx !== -1) this.observed.splice(idx, 1);
  };
  FakeIntersectionObserver.prototype.disconnect = function () {
    this.observed = [];
  };
  // Simulate every currently-observed element scrolling into view.
  FakeIntersectionObserver.prototype.triggerAll = function () {
    var entries = this.observed.slice().map(function (el) {
      return { isIntersecting: true, target: el };
    });
    this.callback(entries, this);
  };

  return { ctor: FakeIntersectionObserver, instances: instances };
}

/**
 * Create a fresh jsdom window holding N `.reveal-on-scroll` target sections,
 * then run the REAL reveal IIFE source inside it. matchMedia and
 * IntersectionObserver are configured by the caller so each scenario is fully
 * controlled (jsdom provides neither by default).
 *
 * @param {number} n number of reveal targets to create
 * @param {Object} opts
 * @param {boolean} opts.reducedMotion value returned by matchMedia(...).matches
 * @param {Function|null} opts.observerCtor IntersectionObserver constructor, or
 *   null/undefined to simulate an environment without one.
 * @returns {{window: Window, targets: NodeList, closeWin: Function}}
 */
function makeScenario(n, opts) {
  var sections = '';
  for (var i = 0; i < n; i++) {
    sections += '<section class="reveal-on-scroll" data-idx="' + i + '"></section>';
  }
  var dom = new JSDOM(
    '<!DOCTYPE html><html><body>' + sections + '</body></html>',
    { url: 'http://localhost/', runScripts: 'outside-only' }
  );
  var win = dom.window;

  // Inject a controllable matchMedia (jsdom does not implement it).
  win.matchMedia = function (query) {
    return {
      media: query,
      matches: /prefers-reduced-motion:\s*reduce/.test(query) ? !!opts.reducedMotion : false,
      addListener: function () {},
      removeListener: function () {},
      addEventListener: function () {},
      removeEventListener: function () {}
    };
  };

  // Control IntersectionObserver presence: define it, or ensure it is truly
  // absent. jsdom does not implement IntersectionObserver, so deleting any
  // assigned value leaves `'IntersectionObserver' in win` === false, faithfully
  // simulating an environment without the API (the §7 `in` check then fails).
  if (opts.observerCtor) {
    win.IntersectionObserver = opts.observerCtor;
  } else {
    try { delete win.IntersectionObserver; } catch (e) { /* ignore */ }
  }

  // Execute the real reveal IIFE in the window's global scope. The IIFE
  // references bare `document`, `window`, and `IntersectionObserver`, all of
  // which resolve to this window's globals.
  win.eval(REVEAL_IIFE_SOURCE);

  return {
    window: win,
    targets: win.document.querySelectorAll('.reveal-on-scroll'),
    closeWin: function () { win.close(); }
  };
}

function countRevealed(targets) {
  var count = 0;
  for (var i = 0; i < targets.length; i++) {
    if (targets[i].classList.contains('is-revealed')) count++;
  }
  return count;
}

test('Property 7a: motion allowed + observer present hides until intersection then reveals', function () {
  fc.assert(
    fc.property(fc.integer({ min: 0, max: 12 }), function (n) {
      var obs = makeControllableObserver();
      var scenario = makeScenario(n, { reducedMotion: false, observerCtor: obs.ctor });
      try {
        // Hidden until intersecting: nothing revealed yet, all N observed.
        assert.strictEqual(
          countRevealed(scenario.targets), 0,
          'no target should be revealed before intersection (n=' + n + ')'
        );
        var totalObserved = obs.instances.reduce(function (sum, io) {
          return sum + io.observed.length;
        }, 0);
        assert.strictEqual(
          totalObserved, n,
          'every target should be observed when motion is allowed (n=' + n + ')'
        );

        // Simulate every observed element entering the viewport.
        obs.instances.forEach(function (io) { io.triggerAll(); });

        // Revealed when motion is allowed and intersection occurs.
        assert.strictEqual(
          countRevealed(scenario.targets), n,
          'all targets should be revealed after intersection (n=' + n + ')'
        );
      } finally {
        scenario.closeWin();
      }
    })
  );
});

test('Property 7b: prefers-reduced-motion reveals all targets immediately', function () {
  fc.assert(
    fc.property(fc.integer({ min: 0, max: 12 }), function (n) {
      var obs = makeControllableObserver();
      var scenario = makeScenario(n, { reducedMotion: true, observerCtor: obs.ctor });
      try {
        // Fully visible immediately; observer never used.
        assert.strictEqual(
          countRevealed(scenario.targets), n,
          'all targets revealed immediately under reduced motion (n=' + n + ')'
        );
        assert.strictEqual(
          obs.instances.length, 0,
          'no observer should be created under reduced motion (n=' + n + ')'
        );
      } finally {
        scenario.closeWin();
      }
    })
  );
});

test('Property 7c: missing IntersectionObserver reveals all targets immediately', function () {
  fc.assert(
    fc.property(fc.integer({ min: 0, max: 12 }), function (n) {
      var scenario = makeScenario(n, { reducedMotion: false, observerCtor: null });
      try {
        // Fully visible immediately when no observer is available.
        assert.strictEqual(
          countRevealed(scenario.targets), n,
          'all targets revealed immediately without IntersectionObserver (n=' + n + ')'
        );
      } finally {
        scenario.closeWin();
      }
    })
  );
});
