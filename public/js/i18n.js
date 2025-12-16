/**
 * ============================================
 * Production-Ready i18n System
 * Framework-agnostic internationalization engine
 * ============================================
 */

class I18n {
    constructor() {
        this.translations = {};
        this.currentLang = null;
        this.defaultLang = 'ar';
        this.supportedLanguages = ['ar', 'en'];
        this.initialized = false;
    }

    /**
     * Initialize the i18n system
     * @param {string} defaultLang - Default language code
     * @returns {Promise<void>}
     */
    async init(defaultLang = 'ar') {
        this.defaultLang = defaultLang;

        // Get saved language from localStorage or use default
        const savedLang = localStorage.getItem('preferred_language');
        const langToLoad = savedLang && this.supportedLanguages.includes(savedLang)
            ? savedLang
            : defaultLang;

        await this.loadLanguage(langToLoad);
        this.initialized = true;

        // Apply initial translations
        this.applyTranslations();

        console.log(`✅ i18n initialized with language: ${this.currentLang}`);
    }

    /**
     * Load language file
     * @param {string} lang - Language code
     * @returns {Promise<void>}
     */
    async loadLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`Language "${lang}" not supported. Falling back to ${this.defaultLang}`);
            lang = this.defaultLang;
        }

        try {
            const response = await fetch(`/locales/${lang}.json`);
            if (!response.ok) throw new Error(`Failed to load ${lang}.json`);

            this.translations = await response.json();
            this.currentLang = lang;

            // Update HTML attributes
            this.updateHTMLAttributes();

            // Save preference
            localStorage.setItem('preferred_language', lang);

        } catch (error) {
            console.error(`Error loading language file:`, error);
            if (lang !== this.defaultLang) {
                console.log(`Falling back to ${this.defaultLang}`);
                await this.loadLanguage(this.defaultLang);
            }
        }
    }

    /**
     * Get translation for a key
     * @param {string} key - Translation key (supports dot notation: 'section.subsection.key')
     * @param {string} fallback - Fallback text if key not found
     * @returns {string}
     */
    t(key, fallback = '') {
        if (!this.translations) return fallback;

        const keys = key.split('.');
        let value = this.translations;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return fallback || key;
            }
        }

        return typeof value === 'string' ? value : fallback || key;
    }

    /**
     * Switch to a different language
     * @param {string} lang - Language code
     * @returns {Promise<void>}
     */
    async setLanguage(lang) {
        if (lang === this.currentLang) return;

        await this.loadLanguage(lang);
        this.applyTranslations();

        // Dispatch custom event for language change
        const event = new CustomEvent('languageChanged', {
            detail: {
                language: lang,
                direction: this.getDirection()
            }
        });
        document.dispatchEvent(event);

        console.log(`🌐 Language changed to: ${lang}`);
    }

    /**
     * Get current language
     * @returns {string}
     */
    getCurrentLanguage() {
        return this.currentLang;
    }

    /**
     * Get text direction for current language
     * @returns {string} 'rtl' or 'ltr'
     */
    getDirection() {
        return this.currentLang === 'ar' ? 'rtl' : 'ltr';
    }

    /**
     * Update HTML lang and dir attributes
     */
    updateHTMLAttributes() {
        const html = document.documentElement;
        html.setAttribute('lang', this.currentLang);
        html.setAttribute('dir', this.getDirection());

        // Update meta tags
        this.updateMetaTags();
    }

    /**
     * Update SEO meta tags
     */
    updateMetaTags() {
        // Update title
        const title = this.t('meta.title');
        if (title) document.title = title;

        // Update description
        const description = this.t('meta.description');
        if (description) {
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.name = 'description';
                document.head.appendChild(metaDesc);
            }
            metaDesc.content = description;
        }

        // Update OG tags
        const ogTitle = this.t('meta.og_title');
        if (ogTitle) {
            let ogTitleTag = document.querySelector('meta[property="og:title"]');
            if (!ogTitleTag) {
                ogTitleTag = document.createElement('meta');
                ogTitleTag.setAttribute('property', 'og:title');
                document.head.appendChild(ogTitleTag);
            }
            ogTitleTag.content = ogTitle;
        }

        const ogDesc = this.t('meta.og_description');
        if (ogDesc) {
            let ogDescTag = document.querySelector('meta[property="og:description"]');
            if (!ogDescTag) {
                ogDescTag = document.createElement('meta');
                ogDescTag.setAttribute('property', 'og:description');
                document.head.appendChild(ogDescTag);
            }
            ogDescTag.content = ogDesc;
        }
    }

    /**
     * Apply translations to elements with data-i18n attribute
     */
    applyTranslations() {
        const elements = document.querySelectorAll('[data-i18n]');

        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);

            if (translation && translation !== key) {
                // Check if element has data-i18n-attr for attribute translation
                const attr = element.getAttribute('data-i18n-attr');
                if (attr) {
                    element.setAttribute(attr, translation);
                } else {
                    element.textContent = translation;
                }
            }
        });
    }

    /**
     * Get all translations for current language
     * @returns {object}
     */
    getTranslations() {
        return this.translations;
    }

    /**
     * Check if system is initialized
     * @returns {boolean}
     */
    isInitialized() {
        return this.initialized;
    }
}

// Create global instance
window.i18n = new I18n();

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.i18n.init();
    });
} else {
    window.i18n.init();
}
