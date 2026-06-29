/**
 * ============================================
 * Navigation Module
 * Handles active page highlighting, hamburger menu,
 * theme toggle, and language toggle wiring.
 * ES5 Compatible — Vanilla JS only.
 * ============================================
 */

(function() {
    'use strict';

    /**
     * Route-to-page mapping.
     * Keys are pathname values, values are data-page attribute values.
     */
    var ROUTE_MAP = {
        '/': 'home',
        '/about-us': 'about',
        '/blog': 'blog',
        '/donate': 'donate',
        '/contact': 'contact',
        '/programs': 'programs',
        '/campaigns': 'campaigns'
    };

    /**
     * setActivePage — marks the active nav link based on a pathname.
     * Removes 'active' class from all nav links, then adds it to the
     * link whose data-page matches the mapped route.
     *
     * @param {string} pathname - The URL pathname (e.g. '/', '/blog')
     */
    function setActivePage(pathname) {
        var navLinks = document.querySelectorAll('.nav-link');
        if (!navLinks || navLinks.length === 0) return;

        var activePage = ROUTE_MAP[pathname] || null;

        // If pathname doesn't match exactly, try matching the first segment
        // e.g. '/article/some-slug' could match '/blog' context
        if (!activePage && pathname.indexOf('/article') === 0) {
            activePage = 'blog';
        }

        // Nested campaign routes (e.g. '/campaigns/before-18') map to campaigns
        if (!activePage && pathname.indexOf('/campaigns') === 0) {
            activePage = 'campaigns';
        }

        for (var i = 0; i < navLinks.length; i++) {
            var link = navLinks[i];
            var page = link.getAttribute('data-page');
            if (page === activePage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        }
    }

    /**
     * Sets up the hamburger menu toggle for mobile viewports (< 768px).
     * Toggles the nav-links list visibility and updates aria-expanded.
     */
    function setupHamburger() {
        var hamburger = document.querySelector('.nav-hamburger');
        var navLinks = document.querySelector('.nav-links');

        if (!hamburger || !navLinks) return;

        hamburger.addEventListener('click', function() {
            var isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', String(!isExpanded));
            navLinks.classList.toggle('nav-open');
            hamburger.classList.toggle('is-active');
        });

        // Close menu when a nav link is clicked (mobile UX)
        var links = navLinks.querySelectorAll('.nav-link');
        for (var i = 0; i < links.length; i++) {
            links[i].addEventListener('click', function() {
                if (navLinks.classList.contains('nav-open')) {
                    navLinks.classList.remove('nav-open');
                    hamburger.classList.remove('is-active');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }

    /**
     * Applies the stored (or system-preferred) theme to <body> by toggling
     * the 'dark-mode' class. Works on every page regardless of script.js.
     */
    function applyStoredTheme() {
        var saved = localStorage.getItem('theme');
        var prefersDark = window.matchMedia
            && window.matchMedia('(prefers-color-scheme: dark)').matches;
        var isDark = saved === 'dark' || (!saved && prefersDark);
        if (document.body) {
            if (isDark) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        }
        updateThemeIcon(isDark);
    }

    /**
     * Updates all .theme-icon glyphs to reflect the current theme.
     */
    function updateThemeIcon(isDark) {
        var icons = document.querySelectorAll('.theme-icon');
        for (var i = 0; i < icons.length; i++) {
            icons[i].textContent = isDark ? '☀️' : '🌙';
        }
    }

    /**
     * Self-contained theme toggle (used on pages without script.js).
     */
    function navToggleTheme() {
        var isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcon(isDark);
    }

    /**
     * Wires the #themeToggle button. nav.js owns the theme on all pages.
     * Because nav.js loads before script.js, it binds first and marks the
     * button as bound so script.js skips its own duplicate binding.
     */
    function setupThemeToggle() {
        var themeBtn = document.getElementById('themeToggle');
        if (!themeBtn) return;

        // Avoid double-binding
        if (themeBtn.getAttribute('data-nav-bound') === 'true') return;
        themeBtn.setAttribute('data-nav-bound', 'true');

        themeBtn.addEventListener('click', navToggleTheme);
        themeBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            navToggleTheme();
        });
    }

    /**
     * Wires the #languageToggle button to the existing i18n.setLanguage.
     * Toggles between 'ar' and 'en'.
     * Only binds if the element exists.
     */
    function setupLanguageToggle() {
        var langBtn = document.getElementById('languageToggle');
        if (!langBtn) return;

        // Avoid double-binding
        if (langBtn.getAttribute('data-nav-bound') === 'true') return;
        langBtn.setAttribute('data-nav-bound', 'true');

        langBtn.addEventListener('click', function() {
            if (!window.i18n || typeof window.i18n.setLanguage !== 'function') return;

            var currentLang = window.i18n.getCurrentLanguage
                ? window.i18n.getCurrentLanguage()
                : (localStorage.getItem('preferred_language') || 'ar');

            var newLang = (currentLang === 'ar') ? 'en' : 'ar';
            window.i18n.setLanguage(newLang);
        });
    }

    /**
     * initNavigation — main entry point.
     * Initializes active page highlighting, hamburger menu, and toggle buttons.
     */
    function initNavigation() {
        applyStoredTheme();
        setActivePage(window.location.pathname);
        setupHamburger();
        setupThemeToggle();
        setupLanguageToggle();
    }

    // Expose public API on window
    window.initNavigation = initNavigation;
    window.setActivePage = setActivePage;

    // Auto-initialize on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavigation);
    } else {
        initNavigation();
    }

})();
