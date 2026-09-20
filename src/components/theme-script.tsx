"use client";

import { useServerInsertedHTML } from "next/navigation";

/* Applied before first paint and kept synchronized across client-side navigations. */
const themeScript = `
(function(){
  function getTheme() {
    try {
      var saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch(e) {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function applyTheme() {
    try {
      var t = getTheme();
      if (document.documentElement.getAttribute('data-theme') !== t) {
        document.documentElement.setAttribute('data-theme', t);
      }
    } catch(e) {}
  }
  applyTheme();
  document.documentElement.classList.add('js');
  try {
    if (!window.__themeObserver) {
      window.__themeObserver = new MutationObserver(function(mutations) {
        for (var i = 0; i < mutations.length; i++) {
          if (mutations[i].attributeName === 'data-theme') {
            var current = document.documentElement.getAttribute('data-theme');
            var expected = getTheme();
            if (current !== expected) {
              document.documentElement.setAttribute('data-theme', expected);
            }
            break;
          }
        }
      });
      window.__themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      });
    }
  } catch(e) {}
})();
`;

export function ThemeScript() {
  useServerInsertedHTML(() => {
    return (
      <script
        id="theme-script"
        dangerouslySetInnerHTML={{ __html: themeScript }}
      />
    );
  });

  return null;
}
