'use strict';

/**
 * Test-only pure helpers for parsing CSS design tokens and computing WCAG
 * contrast ratios without a browser.
 *
 * IMPORTANT: This module is part of the test harness ONLY. It is never loaded
 * by, served to, or referenced from the runtime app in `public/`. The served
 * static site remains no-build and zero runtime dependency.
 *
 * All functions here are pure: given the same input they return the same output
 * and perform no I/O.
 */

/**
 * Clamp a number into the inclusive [min, max] range.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Parse a CSS color string into normalized {r, g, b, a} where r/g/b are 0..255
 * integers and a is 0..1. Supports #rgb, #rgba, #rrggbb, #rrggbbaa, rgb(), and
 * rgba() (both comma and whitespace/slash syntaxes). Returns null when the input
 * cannot be parsed as one of those forms (e.g. a `var(...)` reference that has
 * not been resolved yet).
 *
 * @param {string} input
 * @returns {{r:number,g:number,b:number,a:number}|null}
 */
function parseColor(input) {
  if (typeof input !== 'string') return null;
  var value = input.trim();
  if (value === '') return null;

  // Hex forms.
  if (value.charAt(0) === '#') {
    var hex = value.slice(1);
    if (/^[0-9a-fA-F]{3}$/.test(hex)) {
      return {
        r: parseInt(hex.charAt(0) + hex.charAt(0), 16),
        g: parseInt(hex.charAt(1) + hex.charAt(1), 16),
        b: parseInt(hex.charAt(2) + hex.charAt(2), 16),
        a: 1
      };
    }
    if (/^[0-9a-fA-F]{4}$/.test(hex)) {
      return {
        r: parseInt(hex.charAt(0) + hex.charAt(0), 16),
        g: parseInt(hex.charAt(1) + hex.charAt(1), 16),
        b: parseInt(hex.charAt(2) + hex.charAt(2), 16),
        a: parseInt(hex.charAt(3) + hex.charAt(3), 16) / 255
      };
    }
    if (/^[0-9a-fA-F]{6}$/.test(hex)) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: 1
      };
    }
    if (/^[0-9a-fA-F]{8}$/.test(hex)) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: parseInt(hex.slice(6, 8), 16) / 255
      };
    }
    return null;
  }

  // rgb()/rgba() forms (comma- or space/slash-separated).
  var rgbMatch = value.match(/^rgba?\(([^)]*)\)$/i);
  if (rgbMatch) {
    var body = rgbMatch[1].replace(/\//g, ' ').replace(/,/g, ' ').trim();
    var parts = body.split(/\s+/);
    if (parts.length < 3) return null;

    var channel = function (raw) {
      if (raw.indexOf('%') !== -1) {
        return Math.round(clamp(parseFloat(raw), 0, 100) * 255 / 100);
      }
      return Math.round(clamp(parseFloat(raw), 0, 255));
    };
    var alpha = function (raw) {
      if (raw === undefined) return 1;
      if (raw.indexOf('%') !== -1) return clamp(parseFloat(raw) / 100, 0, 1);
      return clamp(parseFloat(raw), 0, 1);
    };

    var r = channel(parts[0]);
    var g = channel(parts[1]);
    var b = channel(parts[2]);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r: r, g: g, b: b, a: alpha(parts[3]) };
  }

  return null;
}

/**
 * Composite a (possibly translucent) foreground color over an opaque background,
 * returning the resulting opaque {r, g, b, a:1} color. WCAG contrast is defined
 * for opaque colors, so translucent tokens must be flattened first.
 *
 * @param {{r:number,g:number,b:number,a:number}} fg
 * @param {{r:number,g:number,b:number,a:number}} bg opaque background (a treated as 1)
 * @returns {{r:number,g:number,b:number,a:number}}
 */
function flattenOver(fg, bg) {
  var a = fg.a;
  return {
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
    a: 1
  };
}

/**
 * Relative luminance of an opaque sRGB color per WCAG 2.x.
 * @param {{r:number,g:number,b:number}} color channels 0..255
 * @returns {number} luminance 0..1
 */
function relativeLuminance(color) {
  var transform = function (c) {
    var s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * transform(color.r) + 0.7152 * transform(color.g) + 0.0722 * transform(color.b);
}

/**
 * WCAG contrast ratio between two colors. Each argument may be a color string or
 * an already-parsed {r,g,b,a} object. If the foreground is translucent it is
 * composited over the background before the ratio is computed.
 *
 * @param {string|object} foreground
 * @param {string|object} background
 * @returns {number} contrast ratio in the range [1, 21]
 */
function contrastRatio(foreground, background) {
  var fg = typeof foreground === 'string' ? parseColor(foreground) : foreground;
  var bg = typeof background === 'string' ? parseColor(background) : background;
  if (!fg || !bg) {
    throw new Error('contrastRatio: could not parse one or both colors');
  }

  var bgOpaque = { r: bg.r, g: bg.g, b: bg.b, a: 1 };
  var fgOpaque = fg.a !== undefined && fg.a < 1 ? flattenOver(fg, bgOpaque) : fg;

  var l1 = relativeLuminance(fgOpaque);
  var l2 = relativeLuminance(bgOpaque);
  var lighter = Math.max(l1, l2);
  var darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parse CSS custom-property (token) declarations out of raw CSS text, grouped by
 * the selector block they appear in. Comments are stripped first. The returned
 * shape is a map of `selector -> { '--token': 'value' }`.
 *
 * This is a deliberately small, dependency-free parser tuned for the flat token
 * blocks used in `public/css/styles.css` (`:root { ... }`,
 * `body:not(.dark-mode) { ... }`). It does not attempt to handle nested at-rules.
 *
 * @param {string} cssText
 * @returns {Object<string, Object<string,string>>}
 */
function parseCssTokens(cssText) {
  if (typeof cssText !== 'string') return {};
  var withoutComments = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
  var result = {};
  var blockRe = /([^{}]+)\{([^{}]*)\}/g;
  var match;
  while ((match = blockRe.exec(withoutComments)) !== null) {
    // The captured group before a `{` can also include preceding statement-level
    // at-rules (e.g. `@import url('...');`) since they terminate with `;` rather
    // than a block. A CSS selector never contains a top-level `;`, so the real
    // selector is whatever follows the last `;` in the captured text.
    var rawSelector = match[1];
    var selector = rawSelector.slice(rawSelector.lastIndexOf(';') + 1).trim();
    var bodyText = match[2];
    var declRe = /(--[A-Za-z0-9-]+)\s*:\s*([^;]+);/g;
    var decl;
    var tokens = result[selector] || {};
    var found = false;
    while ((decl = declRe.exec(bodyText)) !== null) {
      tokens[decl[1].trim()] = decl[2].trim();
      found = true;
    }
    if (found) {
      result[selector] = tokens;
    }
  }
  return result;
}

/**
 * Resolve a token's value, following `var(--other, fallback)` references across
 * one or more scope maps (e.g. a theme override map layered over the `:root`
 * base map). Scopes are searched in order, so pass the most specific scope first.
 *
 * @param {string} tokenName e.g. '--surface-canvas'
 * @param {Array<Object<string,string>>} scopes ordered most-specific first
 * @param {number} [depth] internal recursion guard
 * @returns {string|null} resolved value, or null if it cannot be resolved
 */
function resolveToken(tokenName, scopes, depth) {
  depth = depth || 0;
  if (depth > 50) return null;

  var raw = null;
  for (var i = 0; i < scopes.length; i++) {
    if (scopes[i] && Object.prototype.hasOwnProperty.call(scopes[i], tokenName)) {
      raw = scopes[i][tokenName];
      break;
    }
  }
  if (raw === null) return null;

  var varMatch = raw.match(/^var\(\s*(--[A-Za-z0-9-]+)\s*(?:,\s*([\s\S]+))?\)$/);
  if (varMatch) {
    var resolved = resolveToken(varMatch[1], scopes, depth + 1);
    if (resolved !== null) return resolved;
    if (varMatch[2] !== undefined) return varMatch[2].trim();
    return null;
  }
  return raw;
}

module.exports = {
  parseColor: parseColor,
  flattenOver: flattenOver,
  relativeLuminance: relativeLuminance,
  contrastRatio: contrastRatio,
  parseCssTokens: parseCssTokens,
  resolveToken: resolveToken
};
