/**
 * ============================================
 * i18n Integration - Simplified Direct Approach
 * Translates dynamic content directly
 * ============================================
 */

// Wait for i18n to be ready
function waitForI18n(callback) {
    if (window.i18n && window.i18n.isInitialized()) {
        callback();
    } else {
        setTimeout(() => waitForI18n(callback), 100);
    }
}

// Helper to get translated text
function t(key, fallback = '') {
    if (window.i18n && window.i18n.isInitialized()) {
        return window.i18n.t(key, fallback);
    }
    return fallback;
}

// Listen for language changes and trigger updates
document.addEventListener('languageChanged', function () {
    console.log('🔄 Language changed - updating all dynamic content');

    // Trigger updates for all dynamic content
    if (typeof window.updateAllDynamicContent === 'function') {
        window.updateAllDynamicContent();
    }

    // Re-apply static translations
    if (window.i18n) {
        window.i18n.applyTranslations();
    }
});

console.log('✅ i18n integration loaded');
