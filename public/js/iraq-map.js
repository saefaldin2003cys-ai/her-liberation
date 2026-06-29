/**
 * Renders an interactive Iraq governorates map from real boundary data
 * (window.IRAQ_GOV) into #iraqMapMount, and wires the story provinces to
 * the existing window.selectProvince() renderer in script.js.
 * ES5-compatible, vanilla JS.
 */
(function () {
    'use strict';

    var SVG_NS = 'http://www.w3.org/2000/svg';

    // English (geoBoundaries) -> Arabic display names
    var AR_NAMES = {
        'Al-Anbar': 'الأنبار',
        'Karbala': 'كربلاء',
        'An-Najaf': 'النجف',
        'Babil': 'بابل',
        'Baghdad': 'بغداد',
        'Al-Qadisiyah': 'القادسية',
        'Al-Muthanna': 'المثنى',
        'Dhi Qar': 'ذي قار',
        'Al-Basrah': 'البصرة',
        'Maysan': 'ميسان',
        'Wasit': 'واسط',
        'Ninawa': 'نينوى',
        'Dohuk': 'دهوك',
        'Salah al-Din': 'صلاح الدين',
        'Diyala': 'ديالى',
        'Kirkuk': 'كركوك',
        'Erbil': 'أربيل',
        'Al-Sulaimaniyah': 'السليمانية'
    };

    var EN_NAMES = {
        'Al-Anbar': 'Al-Anbar',
        'Karbala': 'Karbala',
        'An-Najaf': 'Najaf',
        'Babil': 'Babil',
        'Baghdad': 'Baghdad',
        'Al-Qadisiyah': 'Qadisiyah',
        'Al-Muthanna': 'Muthanna',
        'Dhi Qar': 'Dhi Qar',
        'Al-Basrah': 'Basra',
        'Maysan': 'Maysan',
        'Wasit': 'Wasit',
        'Ninawa': 'Ninawa',
        'Dohuk': 'Duhok',
        'Salah al-Din': 'Salah al-Din',
        'Diyala': 'Diyala',
        'Kirkuk': 'Kirkuk',
        'Erbil': 'Erbil',
        'Al-Sulaimaniyah': 'Sulaymaniyah'
    };

    function getLocalizedName(geoName) {
        // Read from i18n if available, otherwise fall back to localStorage
        var lang = (window.i18n && window.i18n.getCurrentLanguage && window.i18n.getCurrentLanguage())
            || localStorage.getItem('preferred_language')
            || 'ar';
        if (lang === 'en') return EN_NAMES[geoName] || geoName;
        return AR_NAMES[geoName] || geoName;
    }

    // Province (geoBoundaries name) -> provincesData id (in script.js)
    var STORY_IDS = {
        'Maysan': 1,
        'Al-Basrah': 2,
        'Karbala': 3,
        'Dohuk': 4,
        'Kirkuk': 5,
        'Al-Anbar': 6,
        'An-Najaf': 7,
        'Babil': 8,
        'Baghdad': 9,
        'Al-Qadisiyah': 10,
        'Al-Muthanna': 11,
        'Dhi Qar': 12,
        'Wasit': 13,
        'Ninawa': 14,
        'Salah al-Din': 15,
        'Diyala': 16,
        'Erbil': 17,
        'Al-Sulaimaniyah': 18
    };

    // Geometric centroid of a polygon path. Uses the largest sub-ring and the
    // signed-area centroid formula so labels sit INSIDE the province body
    // (not pulled toward dense/complex borders like a vertex average would).
    function centroidFromPath(d) {
        var subpaths = d.split('M');
        var best = null;     // { cx, cy, area }
        var fallback = null; // average of all points, used if area ~ 0

        for (var s = 0; s < subpaths.length; s++) {
            var frag = subpaths[s];
            if (!frag) continue;
            var nums = frag.match(/-?\d+(\.\d+)?/g);
            if (!nums || nums.length < 6) continue;

            var pts = [];
            for (var i = 0; i + 1 < nums.length; i += 2) {
                pts.push([parseFloat(nums[i]), parseFloat(nums[i + 1])]);
            }
            if (pts.length < 3) continue;

            // Shoelace area + centroid
            var area = 0, cx = 0, cy = 0;
            for (var j = 0; j < pts.length; j++) {
                var p0 = pts[j];
                var p1 = pts[(j + 1) % pts.length];
                var cross = p0[0] * p1[1] - p1[0] * p0[1];
                area += cross;
                cx += (p0[0] + p1[0]) * cross;
                cy += (p0[1] + p1[1]) * cross;
            }
            area = area / 2;

            // simple average fallback (first/largest ring)
            if (!fallback) {
                var ax = 0, ay = 0;
                for (var k = 0; k < pts.length; k++) { ax += pts[k][0]; ay += pts[k][1]; }
                fallback = { x: ax / pts.length, y: ay / pts.length };
            }

            if (Math.abs(area) < 1e-6) continue;
            var ring = { cx: cx / (6 * area), cy: cy / (6 * area), area: Math.abs(area) };
            if (!best || ring.area > best.area) best = ring;
        }

        if (best) return { x: best.cx, y: best.cy };
        return fallback;
    }

    function el(name, attrs) {
        var e = document.createElementNS(SVG_NS, name);
        for (var k in attrs) {
            if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]);
        }
        return e;
    }

    function render() {
        var mount = document.getElementById('iraqMapMount');
        if (!mount || !window.IRAQ_GOV) return;

        var data = window.IRAQ_GOV;
        var regions = data.regions || [];

        var svg = el('svg', {
            'class': 'iraq-map',
            viewBox: '0 0 ' + data.width + ' ' + data.height,
            role: 'group',
            'aria-label': 'خريطة محافظات العراق التفاعلية'
        });

        var labels = []; // render labels after paths so they sit on top
        var regionPaths = [];
        var underlays = [];
        var activeRegion = null;

        function selectRegion(path, id) {
            if (activeRegion) activeRegion.classList.remove('is-active');
            path.classList.add('is-active');
            activeRegion = path;
            if (typeof window.selectProvince === 'function') {
                window.selectProvince(id);
            }
        }

        regions.forEach(function (region) {
            var ar = getLocalizedName(region.name);
            var storyId = STORY_IDS[region.name];
            var isStory = typeof storyId !== 'undefined';

            // Underlay: same shape with a fat same-colour stroke. Stacked behind
            // the real regions, it bridges thin gaps between simplified borders
            // (removes the sliver/notch at province tri-points).
            underlays.push(el('path', { d: region.d, 'class': 'iraq-underlay' }));

            var path = el('path', {
                d: region.d,
                'class': 'iraq-region' + (isStory ? ' is-clickable' : '')
            });
            // Native tooltip with the province name
            var title = el('title', {});
            title.textContent = ar;
            path.appendChild(title);

            if (isStory) {
                path.setAttribute('data-province-id', storyId);
                path.setAttribute('tabindex', '0');
                path.setAttribute('role', 'button');
                path.setAttribute('aria-label', ar);
                (function (p, id) {
                    p.addEventListener('click', function () { selectRegion(p, id); });
                    p.addEventListener('keydown', function (e) {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            selectRegion(p, id);
                        }
                    });
                })(path, storyId);
            }

            regionPaths.push(path);

            var c = centroidFromPath(region.d);
            if (c) {
                var label = el('text', {
                    x: c.x,
                    y: c.y,
                    'class': 'iraq-label' + (isStory ? ' is-story' : ' is-muted')
                });
                label.textContent = ar;
                labels.push(label);
            }
        });

        underlays.forEach(function (u) { svg.appendChild(u); });
        regionPaths.forEach(function (p) { svg.appendChild(p); });
        labels.forEach(function (l) { svg.appendChild(l); });

        mount.innerHTML = '';
        mount.appendChild(svg);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', render);
    } else {
        render();
    }

    // Re-render map labels when language changes
    document.addEventListener('languageChanged', function () {
        // Small delay ensures i18n.currentLang is updated before we read it
        setTimeout(render, 50);
    });
})();
