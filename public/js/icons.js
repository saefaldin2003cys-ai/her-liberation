/**
 * ============================================
 * Icon System
 * Replaces the emoji that were previously used as UI icons.
 *
 * Emoji are rendered by the operating system's font: they differ between
 * Android, iOS and Windows, cannot be recoloured, and do not align to a
 * baseline. These are 24x24 stroke icons that inherit `currentColor`.
 *
 * The sprite is written into the document synchronously, at the point where
 * this script tag sits, so `<use href="#i-name">` elsewhere in the body
 * always resolves. Load it as the first script in <body>.
 *
 * Markup:  <svg class="icon" aria-hidden="true"><use href="#i-book"></use></svg>
 * In JS:   window.ICONS.book  ->  a standalone inline <svg> string
 * ES5 compatible - vanilla JS only.
 * ============================================
 */
(function () {
    'use strict';

    /* Path data only; every icon shares the same 24x24 grid and stroke setup. */
    var P = {
        moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>',
        sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
        megaphone: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z"/><path d="M16 8.5a4.5 4.5 0 0 1 0 7"/><path d="M19 5.5a8.5 8.5 0 0 1 0 13"/>',
        users: '<path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="3.2"/><path d="M22 20v-2a4 4 0 0 0-3-3.9"/><path d="M16 4.1a4 4 0 0 1 0 7.8"/>',
        chart: '<path d="M2 20h20"/><path d="M5 20V11M11 20V4M17 20v-6"/>',
        lock: '<path d="M7 10.5V7.5a5 5 0 0 1 10 0v3"/><rect x="4" y="10.5" width="16" height="10" rx="1.5"/>',
        pen: '<path d="M12.5 20H21"/><path d="M16.4 3.6a2.1 2.1 0 0 1 3 3L7.5 18.5 3 20l1.5-4.5Z"/>',
        folder: '<path d="M4 20a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4.6l2 3H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2Z"/>',
        arrowUp: '<path d="M12 19.5V4.5"/><path d="M5.5 11 12 4.5l6.5 6.5"/>',
        arrowDown: '<path d="M12 4.5v15"/><path d="M18.5 13 12 19.5 5.5 13"/>',
        book: '<path d="M4 19.2A2.8 2.8 0 0 1 6.8 16.4H20"/><path d="M6.8 2.5H20v19H6.8A2.8 2.8 0 0 1 4 18.7V5.3a2.8 2.8 0 0 1 2.8-2.8Z"/>',
        save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M8 3v5h7"/>',
        pin: '<path d="M20 10.2c0 5.7-8 11.8-8 11.8s-8-6.1-8-11.8a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.8"/>',
        alert: '<path d="M10.3 4 2 18.2A2 2 0 0 0 3.7 21h16.6a2 2 0 0 0 1.7-2.8L13.7 4a2 2 0 0 0-3.4 0Z"/><path d="M12 9.5v4.2"/><path d="M12 17.3h.01"/>',
        check: '<path d="M20 6.5 9.2 17.3 4 12.1"/>',
        cross: '<path d="M18 6 6 18M6 6l12 12"/>',
        link: '<path d="M10.5 13.5a4.6 4.6 0 0 0 6.9.5l2.8-2.8a4.6 4.6 0 0 0-6.5-6.5L12.1 6.3"/><path d="M13.5 10.5a4.6 4.6 0 0 0-6.9-.5l-2.8 2.8a4.6 4.6 0 0 0 6.5 6.5l1.6-1.6"/>',
        institution: '<path d="M3 21h18"/><path d="M2.5 9.5 12 4l9.5 5.5Z"/><path d="M5.5 21v-9M9.5 21v-9M14.5 21v-9M18.5 21v-9"/>',
        graduation: '<path d="M22 8.8 12 4.5 2 8.8l10 4.3 10-4.3Z"/><path d="M6.5 11v4.3c0 1.5 2.5 2.7 5.5 2.7s5.5-1.2 5.5-2.7V11"/>',
        news: '<path d="M4 4.5h13.2a1 1 0 0 1 1 1v13a2 2 0 0 0 2 2H5a2 2 0 0 1-2-2v-13a1 1 0 0 1 1-1Z"/><path d="M7 8.5h7M7 12.5h7M7 16.5h4.5"/>',
        laptop: '<rect x="4" y="5" width="16" height="11" rx="1.4"/><path d="M2 19.5h20"/>',
        scales: '<path d="M12 3.5v17"/><path d="M8 20.5h8"/><path d="M4.5 7.2h15"/><path d="M6.2 7.5 3 14a3.2 3.2 0 0 0 6.4 0Z"/><path d="M17.8 7.5 14.6 14a3.2 3.2 0 0 0 6.4 0Z"/>',
        heart: '<path d="M20.6 5.8a4.9 4.9 0 0 0-7 0L12 7.4l-1.6-1.6a4.9 4.9 0 1 0-7 7l8.6 8.6 8.6-8.6a4.9 4.9 0 0 0 0-7Z"/>',
        document: '<path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8Z"/><path d="M14 2.5V8h5.5"/><path d="M8.5 13h7M8.5 17h7"/>',
        lightbulb: '<path d="M9.5 18.5h5M10.5 21.5h3"/><path d="M12 2.5a6 6 0 0 0-3.6 10.8c.6.5 1 1.3 1.1 2.1h5c.1-.8.5-1.6 1.1-2.1A6 6 0 0 0 12 2.5Z"/>',
        image: '<rect x="3" y="4.5" width="18" height="15" rx="1.6"/><circle cx="8.5" cy="10" r="1.8"/><path d="M21 15.5 16 11l-9 8.5"/>',
        trash: '<path d="M3.5 6.5h17"/><path d="M9 6.5V4.2h6v2.3"/><path d="M18.5 6.5 17.4 20a1.5 1.5 0 0 1-1.5 1.4H8.1A1.5 1.5 0 0 1 6.6 20L5.5 6.5"/><path d="M10 11v6M14 11v6"/>',
        upload: '<path d="M12 16.5v-13"/><path d="M7 8.5 12 3.5l5 5"/><path d="M3.5 20.5h17"/>',
        copy: '<rect x="8.5" y="8.5" width="12" height="12" rx="1.6"/><path d="M15.5 5.5v-1a1 1 0 0 0-1-1h-10a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1"/>',
        info: '<circle cx="12" cy="12" r="9"/><path d="M12 16.5v-5"/><path d="M12 8h.01"/>',
        ring: '<circle cx="12" cy="14.5" r="5.8"/><path d="M9.6 3.5h4.8l1.6 3.3-4 2.4-4-2.4Z"/>',
        ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
        chain: '<path d="M9.5 14.5 5.8 18.2a3.5 3.5 0 0 1-5-5l3.7-3.7"/><path d="M14.5 9.5l3.7-3.7a3.5 3.5 0 0 1 5 5l-3.7 3.7"/><path d="M9 15l6-6"/>',
        pregnant: '<circle cx="12" cy="4.2" r="2.2"/><path d="M12 7c-2 0-3 1.4-3 3.2V13c0 2.6 1.4 4 3.4 4 1.9 0 3.1-1.3 3.1-3.2 0-2-1.4-3-3.1-3.2"/><path d="M10.2 17v4.5M13.6 17.6v3.9"/>',
        strength: '<path d="M4 13.5V10a2 2 0 0 1 4 0v1.5"/><path d="M8 11.5V9a2 2 0 0 1 4 0v2.5"/><path d="M12 11.5V9.5a2 2 0 0 1 4 0v4.4c0 3.5-2.2 6.1-5.5 6.1S5 17.4 5 14"/>',
        school: '<path d="M3 21h18"/><path d="M5 21V8.5L12 4l7 4.5V21"/><path d="M10 21v-5h4v5"/><path d="M12 8.5v2"/>',
        coins: '<ellipse cx="12" cy="6.5" rx="7" ry="3"/><path d="M5 6.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/><path d="M5 11.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>',
        passport: '<rect x="5" y="2.5" width="14" height="19" rx="2"/><circle cx="12" cy="9.5" r="3"/><path d="M9 16.5h6"/>',
        heartbreak: '<path d="M20.6 5.8a4.9 4.9 0 0 0-7 0L12 7.4l-1.6-1.6a4.9 4.9 0 1 0-7 7l8.6 8.6 8.6-8.6a4.9 4.9 0 0 0 0-7Z"/><path d="M12 7.4l-2.2 3.8 3.8 2-2.1 3.9"/>',
        target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
        scroll: '<path d="M6 3.5h11a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M5 6a2 2 0 0 1 4 0v1H5Z"/><path d="M9.5 9.5h6M9.5 13h6M9.5 16.5h3.5"/>',
        wrench: '<path d="M14.8 6.2a4.5 4.5 0 0 0 5.9 5.9l-8.4 8.4a2.6 2.6 0 0 1-3.7-3.7Z"/><path d="M14.8 6.2 17.6 3.4"/>',
        globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18Z"/>',
        exit: '<path d="M9.5 21H5.5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 16.5 20.5 12 16 7.5"/><path d="M20.5 12h-11"/>',
        eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z"/><circle cx="12" cy="12" r="2.8"/>',
        dot: '<circle cx="12" cy="12" r="5"/>'
    };

    var OPEN = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">';

    /* Standalone inline <svg> strings, for markup built in JavaScript. */
    var ICONS = {};
    for (var k in P) {
        if (Object.prototype.hasOwnProperty.call(P, k)) {
            ICONS[k] = OPEN + P[k] + '</svg>';
        }
    }
    window.ICONS = ICONS;

    /* A <symbol> sprite so static markup can reference icons by id. */
    var sprite = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">';
    for (var j in P) {
        if (Object.prototype.hasOwnProperty.call(P, j)) {
            sprite += '<symbol id="i-' + j + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
                'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + P[j] + '</symbol>';
        }
    }
    sprite += '</svg>';

    var here = document.currentScript;
    if (here && here.parentNode) {
        here.insertAdjacentHTML('afterend', sprite);
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            document.body.insertAdjacentHTML('afterbegin', sprite);
        });
    }
})();
