'use strict';

/**
 * Task 13.3 — Integration smoke: articles rendering (no-regression).
 *
 * Requirement 8.5: the Redesign_System SHALL preserve the existing articles
 * rendering driven by the backend within the Programs_Section
 * (`#articles-section`). The redesign restructured the section markup (adding
 * the decorative `.articles-browse` / `.articles-bento` wrappers) but kept
 * `#articlesGrid` as the JS-populated container and preserved the
 * `.article-card` + `.read-more-btn` contract.
 *
 * This test exercises the REAL runtime: it loads the served `public/index.html`
 * markup into jsdom and evaluates the actual, unmodified `public/js/script.js`
 * inside that window (via `runScripts: 'outside-only'`, which exposes
 * `window.eval`). The site fetches articles from a backend on init, so
 * `window.fetch` is stubbed to return a small set of backend-shaped article
 * objects (the same shape produced by `models/Article.js` and persisted in
 * `local_db.json`: `_id` / `slug` / `title{ar,en}` / `author{ar,en}` /
 * `content{ar,en}` / `image` / `timestamp`). jsdom implements neither
 * `matchMedia` nor `fetch`, so both are stubbed before the scripts run; no live
 * backend is required.
 *
 * Contract under test (Requirement 8.5):
 *   - after the stubbed `/articles` fetch resolves, `#articlesGrid` contains one
 *     rendered `.article-card` per stubbed article, and
 *   - each card carries a `.read-more-btn` that is wired: clicking it runs the
 *     real `openArticle` path (reveals `#articlePage`) without throwing.
 *
 * This drives the SAME `#articlesGrid` / `.article-card` / `.read-more-btn`
 * hooks the redesign must preserve, so if the restructured markup breaks the
 * fetch->render->read-more contract, this test fails loudly (a real regression
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
var BLOG_HTML_PATH = path.join(PUBLIC_DIR, 'blog.html');
var SCRIPT_PATH = path.join(PUBLIC_DIR, 'js', 'script.js');

/**
 * Backend-shaped article fixtures mirroring `models/Article.js` and the records
 * persisted in `local_db.json` (object-valued title/author/content keyed by
 * language, plus `_id`, `slug`, `image`, `timestamp`). These are what the real
 * `/articles` endpoint returns and what `renderArticles()` consumes.
 */
var SAMPLE_ARTICLES = [
  {
    _id: 'smoke-art-1',
    slug: 'legal-age-iraq',
    title: { ar: 'السن القانوني للزواج', en: 'The Legal Age of Marriage' },
    author: { ar: 'حملة تحريرها', en: 'HerLiberation Campaign' },
    authorBio: { ar: 'منصة توعوية.', en: 'An awareness platform.' },
    content: {
      ar: 'فقرة أولى.\n\nفقرة ثانية حول حماية القاصرات.',
      en: 'First paragraph.\n\nSecond paragraph about protecting minors.'
    },
    image: '/assets/images/happy-schoolgirls.png',
    imagePosition: 50,
    images: [],
    timestamp: '2026-06-23T20:07:56.932Z'
  },
  {
    _id: 'smoke-art-2',
    slug: 'education-rights',
    title: { ar: 'الحق في التعليم', en: 'The Right to Education' },
    author: { ar: 'تحريرها', en: 'HerLiberation' },
    content: {
      ar: 'مقال حول أهمية التعليم للفتيات في المحافظات.',
      en: 'An article about the importance of education for girls.'
    },
    image: '',
    images: [],
    timestamp: '2026-05-01T10:00:00.000Z'
  },
  {
    _id: 'smoke-art-3',
    slug: 'community-voices',
    title: { ar: 'أصوات من المجتمع', en: 'Community Voices' },
    author: { ar: 'تحريرها', en: 'HerLiberation' },
    content: {
      ar: 'شهادات وقصص من الواقع المعاش.',
      en: 'Testimonies and stories from lived reality.'
    },
    image: '/assets/images/visual-insight.png',
    imagePosition: 40,
    images: [],
    timestamp: '2026-04-15T08:30:00.000Z'
  }
];

/**
 * Boot the real page markup + real script.js inside a controlled jsdom window
 * with the minimal browser APIs the runtime touches on init stubbed out, then
 * fire the page's own DOMContentLoaded wiring.
 *
 * `window.fetch` resolves the `/articles` list to SAMPLE_ARTICLES and returns
 * inert, shape-appropriate payloads for the other init endpoints (stats, views,
 * article detail, suggested) so the page initializes without a live backend and
 * produces no unhandled rejections.
 *
 * @returns {{window: Window, document: Document, close: Function}}
 */
function bootRealApp() {
  var html = fs.readFileSync(BLOG_HTML_PATH, 'utf8');
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

  // Stub the network. The articles list endpoint returns the backend-shaped
  // fixtures; everything else resolves to inert payloads so the various
  // .then() handlers are happy.
  win.fetch = function (url) {
    var u = String(url);
    var body;
    if (/\/articles\/detail\//.test(u)) {
      // Detail endpoint is only hit when an id is NOT already in the list; our
      // read-more click targets in-list articles, so this is a safe fallback.
      body = { error: 'not found' };
    } else if (/\/articles/.test(u)) {
      // Covers both the initial list load and loadSuggestedArticles().
      body = SAMPLE_ARTICLES;
    } else if (/\/stats/.test(u)) {
      body = { views: 0, likes: 0 };
    } else {
      body = {};
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
  // which calls loadArticles() and wires the #articlesGrid read-more delegation.
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
 * Let the page's deferred init settle. DOMContentLoaded kicks off the async
 * `/articles` fetch (whose .then() runs renderArticles) plus a couple of short
 * (~100ms) deferred timers unrelated to articles. We poll for the rendered
 * cards so the async fetch chain resolves before asserting, then give the
 * remaining deferred timers time to fire while the window is still open.
 *
 * @param {Document} document
 * @returns {Promise<void>}
 */
function waitForArticles(document) {
  return new Promise(function (resolve) {
    var attempts = 0;
    (function poll() {
      var grid = document.getElementById('articlesGrid');
      var rendered = grid && grid.querySelectorAll('.article-card').length > 0;
      if (rendered || attempts >= 50) {
        resolve();
        return;
      }
      attempts++;
      setTimeout(poll, 10);
    })();
  });
}

/**
 * Slightly longer than the page's ~100ms deferred timers so they fire while the
 * jsdom window/document are still valid, avoiding teardown-time errors.
 * @returns {Promise<void>}
 */
function flushPendingAsync() {
  return new Promise(function (resolve) { setTimeout(resolve, 160); });
}

test('#articlesGrid renders one .article-card per backend article after the fetch resolves', async function () {
  var app = bootRealApp();
  var document = app.document;
  try {
    var grid = document.getElementById('articlesGrid');
    assert.ok(grid, '#articlesGrid hook must exist in the redesigned markup');

    await waitForArticles(document);

    var cards = grid.querySelectorAll('.article-card');
    assert.strictEqual(
      cards.length,
      SAMPLE_ARTICLES.length,
      '#articlesGrid should render exactly one .article-card per backend-fetched article'
    );

    // Each card exposes a read-more button carrying the backend article id, so
    // the rendered markup is driven by the fetched data (not static content).
    for (var i = 0; i < cards.length; i++) {
      var btn = cards[i].querySelector('.read-more-btn');
      assert.ok(
        btn,
        'each rendered .article-card should contain a .read-more-btn'
      );
      assert.ok(
        (btn.getAttribute('data-article-id') || '').length > 0,
        'each .read-more-btn should be wired with a data-article-id from the backend data'
      );
    }
  } finally {
    await flushPendingAsync();
    app.close();
  }
});

test('clicking a .read-more-btn runs the real openArticle path and reveals #articlePage', async function () {
  var app = bootRealApp();
  var document = app.document;
  try {
    await waitForArticles(document);

    var grid = document.getElementById('articlesGrid');
    var firstBtn = grid.querySelector('.article-card .read-more-btn');
    assert.ok(firstBtn, 'expected a .read-more-btn on the first rendered card');

    var articlePage = document.getElementById('articlePage');
    assert.ok(articlePage, '#articlePage reader hook must exist in the markup');
    assert.ok(
      articlePage.classList.contains('hidden'),
      '#articlePage should be hidden before any article is opened'
    );

    // Real user click; the page's delegated #articlesGrid listener resolves the
    // data-article-id and calls openArticle. This must not throw.
    assert.doesNotThrow(function () {
      firstBtn.click();
    }, 'clicking .read-more-btn should not throw');

    // openArticle finds the in-list article and reveals the reader panel.
    assert.ok(
      !articlePage.classList.contains('hidden'),
      'clicking .read-more-btn should open the article (reveal #articlePage)'
    );

    // The reader rendered real content for the selected article.
    var viewContent = document.getElementById('articleViewContent');
    assert.ok(viewContent, '#articleViewContent hook must exist');
    assert.ok(
      (viewContent.textContent || '').trim().length > 0,
      'opening an article should populate #articleViewContent with non-empty content'
    );
  } finally {
    await flushPendingAsync();
    app.close();
  }
});
