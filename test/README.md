# Test harness (test-only)

This directory contains a **lightweight, test-only** DOM harness for the
`premium-section-redesign` work. It exists purely to support automated
property/example tests and **does not alter the served static site in any way**.

## No-build guarantee

- The runtime app in `public/` stays **no-build and zero runtime dependency**:
  plain HTML + CSS + ES5 served statically by Express.
- `jsdom` and `fast-check` are **devDependencies only**. They are never imported
  by, bundled into, or served to the browser.
- The harness **reads** `public/index.html` and `public/css/styles.css` from disk
  without modifying them. Nothing here writes to `public/`.

## Running

```
npm test
```

This runs Node's built-in test runner in single-run mode (no watch).

## What the harness provides

`test/helpers/dom-harness.js`
- `loadIndexHtml(options)` — loads the real `public/index.html` into jsdom.
  Page scripts are **not** executed by default (pass `{ runScripts: true }` only
  for integration smoke tests that need the ES5 behavior).
- `readIndexHtml()` / `readStylesCss()` — raw, unmodified file contents.
- `collectI18nKeys(document)` — every `data-i18n` key with its tag and text,
  for copy/key-preservation checks.

`test/helpers/contrast.js` (pure, no browser)
- `parseCssTokens(cssText)` — parse CSS custom properties grouped by selector.
- `resolveToken(name, scopes)` — resolve `var(...)` token references across
  theme scopes (e.g. light overrides layered over `:root`).
- `parseColor`, `relativeLuminance`, `contrastRatio` — compute WCAG contrast
  ratios from token values without a real browser.
