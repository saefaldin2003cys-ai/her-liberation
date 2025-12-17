/**
 * ============================================
 * Production-Ready i18n System
 * Framework-agnostic internationalization engine
 * ES5 Compatible for iOS Safari
 * ============================================
 */

(function() {
    'use strict';

    function I18n() {
        this.translations = {};
        this.currentLang = null;
        this.defaultLang = 'ar';
        this.supportedLanguages = ['ar', 'en'];
        this.initialized = false;
    }

    /**
     * Initialize the i18n system
     */
    I18n.prototype.init = function(defaultLang) {
        var self = this;
        defaultLang = defaultLang || 'ar';
        this.defaultLang = defaultLang;

        // Get saved language from localStorage or use default
        var savedLang = localStorage.getItem('preferred_language');
        var langToLoad = (savedLang && this.supportedLanguages.indexOf(savedLang) !== -1)
            ? savedLang
            : defaultLang;

        return this.loadLanguage(langToLoad).then(function() {
            self.initialized = true;
            // Apply initial translations
            self.applyTranslations();
            console.log('✅ i18n initialized with language: ' + self.currentLang);
        });
    };

    /**
     * Load language file
     */
    I18n.prototype.loadLanguage = function(lang) {
        var self = this;
        
        if (this.supportedLanguages.indexOf(lang) === -1) {
            console.warn('Language "' + lang + '" not supported. Falling back to ' + this.defaultLang);
            lang = this.defaultLang;
        }

        return fetch('/locales/' + lang + '.json')
            .then(function(response) {
                if (!response.ok) throw new Error('Failed to load ' + lang + '.json');
                return response.json();
            })
            .then(function(data) {
                self.translations = data;
                self.currentLang = lang;

                // Update HTML attributes
                self.updateHTMLAttributes();

                // Save preference
                localStorage.setItem('preferred_language', lang);
            })
            .catch(function(error) {
                console.error('Error loading language file:', error);
                if (lang !== self.defaultLang) {
                    console.log('Falling back to ' + self.defaultLang);
                    return self.loadLanguage(self.defaultLang);
                }
            });
    };

    /**
     * Get translation for a key
     */
    I18n.prototype.t = function(key, fallback) {
        fallback = fallback || '';
        if (!this.translations) return fallback;

        var keys = key.split('.');
        var value = this.translations;

        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return fallback || key;
            }
        }

        return typeof value === 'string' ? value : (fallback || key);
    };

    /**
     * Switch to a different language
     */
    I18n.prototype.setLanguage = function(lang) {
        var self = this;
        if (lang === this.currentLang) {
            return Promise.resolve();
        }

        return this.loadLanguage(lang).then(function() {
            self.applyTranslations();

            // Dispatch custom event for language change
            var event;
            try {
                event = new CustomEvent('languageChanged', {
                    detail: {
                        language: lang,
                        direction: self.getDirection()
                    }
                });
            } catch (e) {
                // Fallback for older browsers
                event = document.createEvent('CustomEvent');
                event.initCustomEvent('languageChanged', true, true, {
                    language: lang,
                    direction: self.getDirection()
                });
            }
            document.dispatchEvent(event);

            console.log('🌐 Language changed to: ' + lang);
        });
    };

    /**
     * Get current language
     */
    I18n.prototype.getCurrentLanguage = function() {
        return this.currentLang;
    };

    /**
     * Get text direction for current language
     */
    I18n.prototype.getDirection = function() {
        return this.currentLang === 'ar' ? 'rtl' : 'ltr';
    };

    /**
     * Update HTML lang and dir attributes
     */
    I18n.prototype.updateHTMLAttributes = function() {
        var html = document.documentElement;
        html.setAttribute('lang', this.currentLang);
        html.setAttribute('dir', this.getDirection());

        // Update meta tags
        this.updateMetaTags();
    };

    /**
     * Update SEO meta tags
     */
    I18n.prototype.updateMetaTags = function() {
        // Update title
        var title = this.t('meta.title');
        if (title) document.title = title;

        // Update description
        var description = this.t('meta.description');
        if (description) {
            var metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.name = 'description';
                document.head.appendChild(metaDesc);
            }
            metaDesc.content = description;
        }

        // Update OG tags
        var ogTitle = this.t('meta.og_title');
        if (ogTitle) {
            var ogTitleTag = document.querySelector('meta[property="og:title"]');
            if (!ogTitleTag) {
                ogTitleTag = document.createElement('meta');
                ogTitleTag.setAttribute('property', 'og:title');
                document.head.appendChild(ogTitleTag);
            }
            ogTitleTag.content = ogTitle;
        }

        var ogDesc = this.t('meta.og_description');
        if (ogDesc) {
            var ogDescTag = document.querySelector('meta[property="og:description"]');
            if (!ogDescTag) {
                ogDescTag = document.createElement('meta');
                ogDescTag.setAttribute('property', 'og:description');
                document.head.appendChild(ogDescTag);
            }
            ogDescTag.content = ogDesc;
        }
    };

    /**
     * Apply translations to elements with data-i18n attribute
     */
    I18n.prototype.applyTranslations = function() {
        var self = this;
        var elements = document.querySelectorAll('[data-i18n]');

        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            var key = element.getAttribute('data-i18n');
            var translation = self.t(key);

            if (translation && translation !== key) {
                // Check if element has data-i18n-attr for attribute translation
                var attr = element.getAttribute('data-i18n-attr');
                if (attr) {
                    element.setAttribute(attr, translation);
                } else {
                    element.textContent = translation;
                }
            }
        }
    };

    /**
     * Get all translations for current language
     */
    I18n.prototype.getTranslations = function() {
        return this.translations;
    };

    /**
     * Check if system is initialized
     */
    I18n.prototype.isInitialized = function() {
        return this.initialized;
    };

    // Create global instance
    window.i18n = new I18n();

    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.i18n.init();
        });
    } else {
        window.i18n.init();
    }

})();
