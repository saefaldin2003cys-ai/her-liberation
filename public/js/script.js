/* ============================================
   تحريرها - JavaScript Application
   Production Ready API Integration
   iOS & Android Compatible
   ============================================ */

// ============================================
// Safari/iOS Polyfills
// ============================================
// requestIdleCallback polyfill for Safari
if (typeof window.requestIdleCallback !== 'function') {
    window.requestIdleCallback = function(callback) {
        return setTimeout(function() {
            callback({
                didTimeout: false,
                timeRemaining: function() { return 50; }
            });
        }, 1);
    };
}

// ============================================
// API Configuration
// ============================================
var API_URL = '/api';

// ============================================
// Rights Data
// ============================================
var rightsData = {
    9: {
        legalCapacity: {
            status: 'forbidden',
            title: 'الأهلية القانونية',
            icon: '⚖️',
            statusLabel: '🔴 قاصر بالكامل',
            description: 'لا تستطيع التوقيع على أي عقد رسمي. جميع تصرفاتها بموافقة ولي الأمر.',
            details: 'القاصر تحت 15 سنة لا يمكنها توقيع أي عقد رسمي. جميع التصرفات القانونية تتطلب موافقة ولي الأمر أو الوصي.',
            law: 'قانون رعاية القاصرين العراقي رقم 78'
        },
        economicRights: {
            status: 'forbidden',
            title: 'الحقوق الاقتصادية',
            icon: '💰',
            statusLabel: '🔴 لا تملك نفسها',
            description: 'لا حساب بنكي خاص. لا حق في التصرف بالمال إلا من خلال الوصي.',
            details: 'لا يمكن للفتاة في هذا العمر فتح حساب بنكي أو التصرف بأموالها بشكل مستقل.',
            law: 'القانون المدني العراقي '
        },
        civilRights: {
            status: 'forbidden',
            title: 'الحقوق المدنية',
            icon: '🛂',
            statusLabel: '🔴 مقيدة الحركة',
            description: 'لا جواز سفر بدون موافقة الأبوين معاً. لا سفر إلا بمحرم.',
            details: 'لا يمكن إصدار جواز سفر للقاصر إلا بموافقة كلا الوالدين. السفر يتطلب مرافقة محرم.',
            law: 'قانون الجوازات العراقي'
        },
        marriage: {
            status: 'danger',
            title: 'الزواج (المفارقة الكبرى)',
            icon: '💔',
            statusLabel: '⚠️ منطقة الخطر الرمادية',
            description: 'الواقع: زواج ديني  - عقد أمام رجل دين (غير مسجل رسمياً)',
            details: 'تعيش في "ظل قانوني" بلا حقوق, تسجيل لاحق عند الحمل أو الولادة, "طفلة بالابتدائية تصير \'زوجة\' بعرف المجتمع!"',
            law: 'ثغرة في قانون الأحوال الشخصية'
        }
    },
    15: {
        legalCapacity: {
            status: 'conditional',
            title: 'الأهلية القانونية',
            icon: '⚖️',
            statusLabel: '⚠️ قاصر بإشراف',
            description: 'لا تملك القاصر صلاحية توقيع العقود الرسمية أو القانونية، بل ينوب عنها "الولي" في ذلك.',
            details: 'لا تملك القاصر صلاحية توقيع العقود الرسمية أو القانونية، بل ينوب عنها "الولي" في ذلك، وتخضع التصرفات المهمة لرقابة وإشراف (مديرية رعاية القاصرين) لضمان حماية حقوقها.',
            law: 'المادة (97) من القانون المدني العراقي رقم 40 لسنة 1951. قانون رعاية القاصرين رقم 78 لسنة 1980.'
        },
        economicRights: {
            status: 'conditional',
            title: 'الحقوق الاقتصادية',
            icon: '💰',
            statusLabel: '⚠️ ملكية مقيدة',
            description: 'حساب توفير بإشراف ولي الأمر. لا تستطيع سحب الأموال بحرية.',
            details: 'يمكن فتح حساب توفير بإشراف ولي الأمر، لكن لا يمكن السحب أو التصرف بالأموال بحرية.',
            law: 'القانون المدني العراقي'
        },
        civilRights: {
            status: 'forbidden',
            title: 'الحقوق المدنية',
            icon: '🛂',
            statusLabel: '🔴 مقيدة الحركة',
            description: 'لا جواز سفر بدون موافقة الأبوين معاً. لا سفر إلا بمحرم.',
            details: 'لا يمكن إصدار جواز سفر للقاصر إلا بموافقة كلا الوالدين. السفر يتطلب مرافقة محرم.',
            law: 'قانون الجوازات العراقي'
        },
        marriage: {
            status: 'conditional',
            title: 'الزواج (المفارقة الكبرى)',
            icon: '💔',
            statusLabel: '⚠️ زواج بإذن قضائي (المادة 8)',
            description: '"يجوز للقاضي أن يأذن بزواج من أكمل الخامسة عشرة إذا وجد ضرورة..."',
            details: 'المشكلة: موافقة الولي قد تكون إجباراً، والمصلحة تفسر بفضفاضية.',
            law: 'المادة 8 من قانون الأحوال الشخصية'
        }
    },
    18: {
        legalCapacity: {
            status: 'allowed',
            title: 'الأهلية القانونية',
            icon: '⚖️',
            statusLabel: '🟢 مواطنة كاملة',
            description: 'حرية التصرف القانوني الكامل.',
            details: 'عند بلوغ 18 سنة، تصبح الفتاة بالغة قانونيًا وتملك الأهلية الكاملة للتصرف.',
            law: 'القانون المدني العراقي'
        },
        economicRights: {
            status: 'allowed',
            title: 'الحقوق الاقتصادية',
            icon: '💰',
            statusLabel: '🟢 حرة مالياً',
            description: 'تملك، تبيع، وتشتري بحرية كاملة.',
            details: 'حرية التملك والتصرف المالي الكامل دون قيود.',
            law: 'القانون المدني العراقي'
        },
        civilRights: {
            status: 'allowed',
            title: 'الحقوق المدنية',
            icon: '�',
            statusLabel: '🟢 حرة التنقل',
            description: 'حرية السفر واستصدار الوثائق.',
            details: 'حرية السفر واستخراج جواز السفر والوثائق بشكل مستقل.',
            law: 'الدستور العراقي'
        },
        marriage: {
            status: 'allowed',
            title: 'الزواج',
            icon: '💍',
            statusLabel: '🟢 حرة في القرار',
            description: 'تستطيع الزواج دون إذن أحد. قرارها الشخصي هو القانون.',
            details: 'حرية الزواج بموافقتها الشخصية دون الحاجة لإذن أي طرف آخر.',
            law: 'قانون الأحوال الشخصية'
        }
    }
};

var impactData = {
    9: [
        { type: 'danger', icon: '🚫', text: 'انقطاع التعليم المبكر' },
        { type: 'danger', icon: '💔', text: 'فقدان الطفولة' },
        { type: 'danger', icon: '⛓️', text: 'عدم القدرة على اتخاذ القرارات' }
    ],
    15: [
        { type: 'warning', icon: '⚠️', text: 'خطر الزواج المبكر' },
        { type: 'warning', icon: '📚', text: 'انقطاع التعليم' },
        { type: 'danger', icon: '🤰', text: 'الحمل المبكر' }
    ],
    18: [
        { type: 'info', icon: '✅', text: 'استقلالية قانونية كاملة' },
        { type: 'info', icon: '🎓', text: 'حرية اتخاذ القرارات' },
        { type: 'info', icon: '💪', text: 'حقوق اقتصادية كاملة' }
    ]
};

// ============================================
// Provinces Data (Map)
// ============================================
var provincesData = [
    { id: 1, name: 'ميسان', rate: '35%', type: 'أعلى نسبة', story: 'وردة (13 سنة) تزوجت بعد وفاة والدتها، وأجبرت على الحمل المبكر رغم صغر سنها، ما سبب لها مضاعفات صحية' },
    { id: 2, name: 'البصرة', rate: '31.5%', type: 'عشائري', story: '   سارة (12 سنة) أُجبرت على الزواج بسبب ضغوط العائلة والحالة الاقتصادية، واضطرت لترك المدرسة قبل بداية المراهقة' },
    { id: 3, name: 'كربلاء', rate: '31.2%', type: 'اجتماعي', story: 'هالة (14 سنة) زُوّجت لتخفيف أعباء العائلة المالية، وأُبعدت عن أصدقاء المدرسة وحياتها الطبيعية' },
    { id: 4, name: 'دهوك', rate: '18.3%', type: 'قانوني/اجتماعي', story: ' نور (16 سنة) حصلت على إذن قضائي للزواج، لكنها نادمة بسبب فقدان حرية اختيارها والضغوط الاجتماعية المحيطة' },
    { id: 5, name: 'كركوك', rate: '15.9%', type: 'تقاليد', story: 'سمر (15 سنة) زوّجها والدها لرجل أكبر منها بعقد غير مسجّل، وانتهى الزواج سريعًا لتدخل في صراع قانوني لإثبات حقوقها وحقوق طفلها.' }
];

var statusLabels = {
    forbidden: 'ممنوع',
    conditional: 'مشروط',
    allowed: 'مسموح'
};

// ============================================
// State
// ============================================
var currentAge = 9;
var hasLiked = localStorage.getItem('hasLiked') === 'true';
var viewCount = 0;
var likeCount = 0;
var activeProvinceId = null;

// ============================================
// DOM Helpers - Safari/iOS Compatible
// ============================================
function $(selector) {
    return document.querySelector(selector);
}
function $$(selector) {
    return document.querySelectorAll(selector);
}

// ============================================
// Theme
// ============================================
function initTheme() {
    var savedTheme = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
        updateThemeIcon(true);
    }
}

function toggleTheme() {
    var isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
    var icon = document.querySelector('.theme-icon');
    if (icon) icon.textContent = isDark ? '☀️' : '🌙';
}

// ============================================
// Stats Functions (API)
// ============================================
function loadStats() {
    console.log('📊 Loading stats from API...');
    fetch(API_URL + '/stats')
        .then(function(res) { 
            if (!res.ok) throw new Error('API Error');
            return res.json(); 
        })
        .then(function(data) {
            console.log('✅ Stats loaded:', data);
            viewCount = data.views || 0;
            likeCount = data.likes || 0;
            updateStatsDisplay();
        })
        .catch(function(err) {
            console.warn('⚠️ Stats API failed, using fallback:', err);
            // Show fallback values
            viewCount = 247;
            likeCount = 58;
            updateStatsDisplay();
        });
}

function incrementViews() {
    fetch(API_URL + '/stats/view', { method: 'POST' })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            viewCount = data.views;
            likeCount = data.likes;
            updateStatsDisplay();
        })
        .catch(function() { 
            console.warn('⚠️ Could not increment views');
        });
}

function toggleLike() {
    if (hasLiked) return;
    hasLiked = true;
    localStorage.setItem('hasLiked', 'true');

    fetch(API_URL + '/stats/like', { method: 'POST' })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            likeCount = data.likes;
            updateStatsDisplay();
        })
        .catch(function() {
            likeCount++;
            updateStatsDisplay();
        });

    var likeBtn = document.querySelector('#likeBtn');
    if (likeBtn) {
        likeBtn.classList.add('liked');
        likeBtn.querySelector('.heart-icon').textContent = '❤️';
    }
}

function updateStatsDisplay() {
    var viewEl = document.getElementById('viewCount');
    var likeEl = document.getElementById('likeCount');
    var headerLikeEl = document.getElementById('headerLikeCount');

    if (viewEl) viewEl.textContent = formatNumber(viewCount);
    if (likeEl) likeEl.textContent = formatNumber(likeCount);
    if (headerLikeEl) headerLikeEl.textContent = formatNumber(likeCount);
}

function formatNumber(num) {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
}

// ============================================
// Comments Functions (API)
// ============================================
function loadComments() {
    console.log('💬 Loading comments...');
    var list = document.getElementById('commentsList');
    if (!list) {
        console.log('⚠️ Comments list not found, retrying...');
        setTimeout(loadComments, 500);
        return;
    }

    fetch(API_URL + '/comments')
        .then(function(res) { 
            if (!res.ok) throw new Error('API Error');
            return res.json(); 
        })
        .then(function(comments) {
            console.log('✅ Comments loaded:', comments.length);
            renderComments(comments);
        })
        .catch(function(err) {
            console.warn('⚠️ Comments API failed:', err);
            renderComments([]);
        });
}

function submitComment(e) {
    e.preventDefault();
    var nameInput = document.getElementById('commentName');
    var textInput = document.getElementById('commentText');
    var name = nameInput.value.trim() || 'زائر';
    var text = textInput.value.trim();
    if (!text) return;

    fetch(API_URL + '/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, text: text })
    })
        .then(function(res) { return res.json(); })
        .then(function() { loadComments(); })
        .catch(function(err) { console.error(err); });

    nameInput.value = '';
    textInput.value = '';
}

function renderComments(comments) {
    var list = document.getElementById('commentsList');
    if (!list) return;
    
    var html = '';
    for (var i = 0; i < comments.length; i++) {
        html += createCommentHTML(comments[i]);
    }
    list.innerHTML = html;
}

function createCommentHTML(comment) {
    var timeAgo = getTimeAgo(new Date(comment.timestamp));
    return '<div class="comment-item">' +
        '<div class="comment-header">' +
            '<span class="comment-author">' + escapeHTML(comment.name) + '</span>' +
            '<span class="comment-date">' + timeAgo + '</span>' +
        '</div>' +
        '<p class="comment-text">' + escapeHTML(comment.text) + '</p>' +
    '</div>';
}

function getTimeAgo(date) {
    var seconds = Math.floor((Date.now() - date) / 1000);
    if (seconds < 60) return 'الآن';
    if (seconds < 3600) return 'منذ ' + Math.floor(seconds / 60) + ' دقيقة';
    if (seconds < 86400) return 'منذ ' + Math.floor(seconds / 3600) + ' ساعة';
    return 'منذ ' + Math.floor(seconds / 86400) + ' يوم';
}

function escapeHTML(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ============================================
// Navigation
// ============================================
function startExperience() {
    console.log('🚀 Starting experience - going to Stats Overlay');
    // Go to Stats Overlay (Page 2)
    var startScreen = document.getElementById('startScreen');
    var statsOverlay = document.getElementById('statsOverlay');
    if (startScreen) startScreen.classList.add('hidden');
    if (statsOverlay) statsOverlay.classList.remove('hidden');
}

function goToMainExperience() {
    console.log('🎯 Going to Main Experience');
    // Go to Main Experience (Page 3)
    var statsOverlay = document.getElementById('statsOverlay');
    var mainExperience = document.getElementById('mainExperience');
    if (statsOverlay) statsOverlay.classList.add('hidden');
    if (mainExperience) mainExperience.classList.remove('hidden');
    updateRights();
    updateTimeline();
    updateImpacts();
    initMap();
}

// ============================================
// Rights Functions
// ============================================
function getClosestAge(age) {
    if (age < 15) return 9;
    if (age < 18) return 15;
    return 18;
}

function updateRights() {
    var container = document.getElementById('rightsContainer');
    if (!container) return;
    var closestAge = getClosestAge(currentAge);
    var rights = rightsData[closestAge];
    var keys = Object.keys(rights);
    var html = '';
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var right = rights[key];
        // Get translated text
        var title = window.i18n ? window.i18n.t('rights_data.' + closestAge + '.' + key + '.title', right.title) : right.title;
        var statusLabel = window.i18n ? window.i18n.t('rights_data.' + closestAge + '.' + key + '.statusLabel', right.statusLabel) : right.statusLabel;
        var description = window.i18n ? window.i18n.t('rights_data.' + closestAge + '.' + key + '.description', right.description) : right.description;
        var detailsBtn = window.i18n ? window.i18n.t('rights.view_details', 'عرض التفاصيل') : 'عرض التفاصيل';

        html += '<div class="right-card ' + right.status + '" onclick="showDetails(\'' + key + '\', ' + closestAge + ')">' +
            '<div class="right-header">' +
                '<span class="right-icon">' + right.icon + '</span>' +
                '<div class="right-info">' +
                    '<h4 class="right-title">' + title + '</h4>' +
                    '<span class="right-status status-' + right.status + '">' + statusLabel + '</span>' +
                '</div>' +
            '</div>' +
            '<p class="right-description">' + description + '</p>' +
            '<button class="details-btn">' + detailsBtn + '</button>' +
        '</div>';
    }
    container.innerHTML = html;
}

function updateTimeline() {
    var items = document.querySelectorAll('.timeline-item');
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var ageRange = item.dataset.age;
        var isActive = false;
        if (ageRange === '9-12' && currentAge >= 9 && currentAge <= 12) isActive = true;
        if (ageRange === '13-15' && currentAge >= 13 && currentAge <= 15) isActive = true;
        if (ageRange === '16-17' && currentAge >= 16 && currentAge <= 17) isActive = true;
        if (ageRange === '18' && currentAge >= 18) isActive = true;
        if (isActive) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    }
}

function updateImpacts() {
    var container = document.getElementById('impactGrid');
    if (!container) return;
    var closestAge = getClosestAge(currentAge);
    var impacts = impactData[closestAge] || [];
    var html = '';

    for (var i = 0; i < impacts.length; i++) {
        var impact = impacts[i];
        // Get translated text
        var text = window.i18n ? window.i18n.t('impact_data.' + closestAge + '.' + i + '.text', impact.text) : impact.text;

        html += '<div class="impact-item ' + impact.type + '">' +
            '<span class="impact-icon">' + impact.icon + '</span>' +
            '<span class="impact-text">' + text + '</span>' +
        '</div>';
    }
    container.innerHTML = html;
}

// ============================================
// Modal Functions
// ============================================
function showDetails(key, age) {
    var modal = document.getElementById('detailsModal');
    var modalBody = document.getElementById('modalBody');
    var right = rightsData[age][key];

    // Get translated text
    var title = window.i18n ? window.i18n.t('rights_data.' + age + '.' + key + '.title', right.title) : right.title;
    var details = window.i18n ? window.i18n.t('rights_data.' + age + '.' + key + '.details', right.details) : right.details;
    var law = window.i18n ? window.i18n.t('rights_data.' + age + '.' + key + '.law', right.law) : right.law;
    var legalRefLabel = window.i18n ? window.i18n.t('rights.legal_reference', 'المرجع القانوني') : 'المرجع القانوني';

    modalBody.innerHTML = '<h3 class="modal-title">' + right.icon + ' ' + title + '</h3>' +
        '<p class="modal-description">' + details + '</p>' +
        '<div class="modal-law">' +
            '<div class="law-title">📜 ' + legalRefLabel + '</div>' +
            '<div class="law-text">' + law + '</div>' +
        '</div>';
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    console.log('🔒 Closing modal...');
    var modal = document.getElementById('detailsModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Make functions globally accessible for iOS inline handlers
window.closeModal = closeModal;
window.showDetails = showDetails;
window.updateRights = updateRights;
window.updateTimeline = updateTimeline;
window.updateImpacts = updateImpacts;
window.toggleTheme = toggleTheme;
window.startExperience = startExperience;
window.goToMainExperience = goToMainExperience;

// ============================================
// Share Functions
// ============================================
function shareTwitter() {
    var text = window.i18n ? window.i18n.t('share.twitter_text', 'اكتشفي حقوق الطفلة في القانون ومخاطر الزواج المبكر 💔\n\n#تحريرها #حماية_الطفولة') : 'اكتشفي حقوق الطفلة في القانون ومخاطر الزواج المبكر 💔\n\n#تحريرها #حماية_الطفولة';
    var url = window.location.href;
    window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url), '_blank');
}

function shareWhatsapp() {
    var defaultText = 'اكتشفي حقوق الطفلة في القانون ومخاطر الزواج المبكر\n\n' + window.location.href;
    var text = window.i18n ? window.i18n.t('share.whatsapp_text', defaultText) : defaultText;
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(function() {
        var btn = document.getElementById('copyLink');
        if (!btn) return;

        var originalText = btn.innerHTML;
        var copiedText = window.i18n ? window.i18n.t('cta.link_copied', 'تم النسخ!') : 'تم النسخ!';

        btn.innerHTML = '<span>✓</span> ' + copiedText;
        setTimeout(function() { btn.innerHTML = originalText; }, 2000);
    });
}

// ============================================
// Admin Password - SECRET ACCESS
// Press Ctrl+Shift+K to open admin login
// ============================================
var ADMIN_PASSWORD = 'TahrirAdmin@2025';
var isAdmin = localStorage.getItem('isAdmin') === 'true';

document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        showAdminLogin();
    }
});

// ============================================
// Articles State
// ============================================
var articles = [];
var articleLikes = JSON.parse(localStorage.getItem('articleLikes') || '{}');

// ============================================
// Articles Functions (API)
// ============================================
function loadArticles() {
    console.log('📚 Loading articles...');
    var grid = document.getElementById('articlesGrid');
    if (!grid) {
        console.log('⚠️ Articles grid not found, retrying...');
        setTimeout(loadArticles, 500);
        return;
    }

    fetch(API_URL + '/articles')
        .then(function(res) { 
            if (!res.ok) throw new Error('API Error');
            return res.json(); 
        })
        .then(function(data) {
            console.log('✅ Articles loaded:', data.length);
            articles = data;
            renderArticles();
        })
        .catch(function(err) {
            console.warn('⚠️ Articles API failed:', err);
            articles = [];
            renderArticles();
        });
}

function renderArticles() {
    var grid = document.getElementById('articlesGrid');
    if (!grid) return;

    if (articles.length === 0) {
        grid.innerHTML = '<div class="no-articles"><p>لا توجد مقالات حالياً</p></div>';
        return;
    }

    var html = '';
    for (var i = 0; i < articles.length; i++) {
        html += renderArticleCard(articles[i]);
    }
    grid.innerHTML = html;
}

// Helper to get translated article content
function getArticleContent(article) {
    var lang = window.i18n ? window.i18n.getCurrentLanguage() : 'ar';

    // Handle both old string format and new object format
    var title = typeof article.title === 'object' ? (article.title[lang] || article.title.ar) : article.title;
    var author = typeof article.author === 'object' ? (article.author[lang] || article.author.ar) : article.author;
    var content = typeof article.content === 'object' ? (article.content[lang] || article.content.ar) : article.content;

    return { title: title, author: author, content: content };
}

function renderArticleCard(article) {
    var date = new Date(article.timestamp);
    var lang = window.i18n ? window.i18n.getCurrentLanguage() : 'ar';
    var formattedDate = date.toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-IQ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    var articleContent = getArticleContent(article);
    var title = articleContent.title;
    var author = articleContent.author;
    var content = articleContent.content;
    var excerpt = content.substring(0, 100) + '...';
    var isLiked = articleLikes[article._id];
    var commentsCount = (article.comments || []).length;
    var readMoreText = lang === 'en' ? 'Read More' : 'قراءة المزيد';

    var imageHtml = article.image
        ? '<img src="' + escapeHTML(article.image) + '" alt="' + escapeHTML(title) + '" class="article-image">'
    return '<article class="article-card">' +
        imageHtml +
        '<div class="article-body">' +
            '<h4 class="article-title">' + escapeHTML(title) + '</h4>' +
            '<p class="article-date"><span class="emoji-icon">📅</span> ' + formattedDate + authorHtml + '</p>' +
            '<p class="article-excerpt">' + escapeHTML(excerpt) + '</p>' +
            '<hr class="article-divider">' +
            '<div class="article-actions">' +
                '<button class="article-action-btn ' + (isLiked ? 'liked' : '') + '" onclick="toggleArticleLike(\'' + article._id + '\')">' +
                    '<span class="action-icon emoji-icon">' + (isLiked ? '❤️' : '🤍') + '</span>' +
                    '<span>' + (article.likes || 0) + '</span>' +
                '</button>' +
                '<button class="article-action-btn" onclick="openArticle(\'' + article._id + '\')">' +
                    '<span class="action-icon emoji-icon">💬</span>' +
                    '<span>' + commentsCount + '</span>' +
                '</button>' +
                '<button class="read-more-btn" onclick="openArticle(\'' + article._id + '\')">' + readMoreText + '</button>' +
            '</div>' +
        '</div>' +
    '</article>';
}

function toggleArticleLike(articleId) {
    if (articleLikes[articleId]) return;

    articleLikes[articleId] = true;
    localStorage.setItem('articleLikes', JSON.stringify(articleLikes));

    fetch(API_URL + '/articles/' + articleId + '/like', { method: 'POST' })
        .then(function(res) { return res.json(); })
        .then(function() { loadArticles(); })
        .catch(function(err) { console.error(err); });
}

function openArticle(articleId) {
    var article = null;
    for (var i = 0; i < articles.length; i++) {
        if (articles[i]._id === articleId) {
            article = articles[i];
            break;
        }
    }
    if (!article) return;

    var modal = document.getElementById('detailsModal');
    var modalBody = document.getElementById('modalBody');
    var lang = window.i18n ? window.i18n.getCurrentLanguage() : 'ar';
    var articleContent = getArticleContent(article);
    var title = articleContent.title;
    var author = articleContent.author;
    var content = articleContent.content;

    var date = new Date(article.timestamp);
    var formattedDate = date.toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-IQ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    var isLiked = articleLikes[articleId];
    var comments = article.comments || [];

    // Translation constants
    var likeText = lang === 'en' ? 'Like' : 'إعجاب';
    var shareText = lang === 'en' ? 'Share' : 'مشاركة';
    var commentsTitle = lang === 'en' ? 'Comments' : 'التعليقات';
    var noCommentsText = lang === 'en' ? 'No comments yet' : 'لا توجد تعليقات بعد';
    var writeCommentPlaceholder = lang === 'en' ? 'Write a comment...' : 'اكتب تعليقاً...';
    var namePlaceholder = lang === 'en' ? 'Your Name' : 'اسمك';
    var sendText = lang === 'en' ? 'Send' : 'إرسال';
    var likesLabel = lang === 'en' ? 'Likes' : 'إعجاب';
    var commentsLabel = lang === 'en' ? 'Comments' : 'تعليق';

    // Build comments HTML
    var commentsHtml = '';
    if (comments.length > 0) {
        for (var i = 0; i < comments.length; i++) {
            var c = comments[i];
            commentsHtml += '<div class="comment-item">' +
                '<div class="comment-header">' +
                    '<strong>' + escapeHTML(c.name) + '</strong>' +
                    '<span class="comment-date">' + new Date(c.timestamp).toLocaleDateString() + '</span>' +
                '</div>' +
                '<p>' + escapeHTML(c.text) + '</p>' +
            '</div>';
        }
    } else {
        commentsHtml = '<p class="no-comments">' + noCommentsText + '</p>';
    }

    var imageHtml = article.image ? '<img src="' + escapeHTML(article.image) + '" alt="" class="article-modal-image">' : '';
    var authorHtml = author ? '<span>✍️ ' + escapeHTML(author) + '</span>' : '';
    var deleteBtn = isAdmin ? '<button class="article-action-btn danger" onclick="deleteArticle(\'' + article._id + '\')"><span class="action-icon">🗑️</span><span>حذف</span></button>' : '';

    modalBody.innerHTML = '<div class="article-modal-content">' +
        imageHtml +
        '<h3 class="article-modal-title">' + escapeHTML(title) + '</h3>' +
        '<div class="article-modal-meta">' +
            '<span>📅 ' + formattedDate + '</span>' +
            authorHtml +
            '<span>💬 ' + comments.length + ' ' + commentsLabel + '</span>' +
        '</div>' +
        '<div class="article-modal-body">' + escapeHTML(content).replace(/\n/g, '<br>') + '</div>' +
        deleteBtn +
        '<div class="article-comments-section">' +
            '<h4>' + commentsTitle + '</h4>' +
            '<div class="comments-list">' + commentsHtml + '</div>' +
            '<form class="comment-form" onsubmit="submitArticleComment(event, \'' + article._id + '\')">' +
                '<input type="text" id="articleCommentName" placeholder="' + namePlaceholder + '" class="details-input" required>' +
                '<textarea id="articleCommentText" placeholder="' + writeCommentPlaceholder + '" class="details-input" required></textarea>' +
                '<button type="submit" class="details-btn">' + sendText + '</button>' +
                '<button type="button" class="article-action-btn share-btn" onclick="shareArticle(\'' + article._id + '\')">' +
                    '<span class="action-icon">📤</span>' +
                    '<span>' + shareText + '</span>' +
                '</button>' +
            '</form>' +
        '</div>' +
    '</div>';

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function submitArticleComment(e, articleId) {
    e.preventDefault();
    var nameInput = document.getElementById('articleCommentName');
    var textInput = document.getElementById('articleCommentText');
    var name = nameInput.value.trim() || 'زائر';
    var text = textInput.value.trim();
    if (!text) return;

    fetch(API_URL + '/articles/' + articleId + '/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, text: text })
    })
        .then(function(res) { return res.json(); })
        .then(function() {
            loadArticles();
            openArticle(articleId);
        })
        .catch(function(err) { console.error(err); });
}

function shareArticle(articleId) {
    var article = null;
    for (var i = 0; i < articles.length; i++) {
        if (articles[i]._id === articleId) {
            article = articles[i];
            break;
        }
    }
    if (!article) return;
    var articleContent = getArticleContent(article);
    var title = articleContent.title;
    var text = title + '\n\n' + window.location.href;
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
}

function deleteArticle(articleId) {
    if (!isAdmin) return;
    if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return;

    fetch(API_URL + '/articles/' + articleId, { method: 'DELETE' })
        .then(function() {
            closeModal();
            loadArticles();
        })
        .catch(function(err) { console.error(err); });
}

// ============================================
// Admin Functions
// ============================================
function showAdminLogin() {
    var modal = document.getElementById('detailsModal');
    var modalBody = document.getElementById('modalBody');

    if (isAdmin) {
        modalBody.innerHTML = '<div class="admin-login-form">' +
            '<h3>👋 مرحباً أيها المدير!</h3>' +
            '<p>أنت مسجل الدخول كمدير</p>' +
            '<button class="submit-btn" onclick="toggleAdminPanel()">✍️ كتابة مقال جديد</button>' +
            '<button class="cancel-btn" onclick="logoutAdmin()">🚪 تسجيل الخروج</button>' +
            '</div>';
    } else {
        modalBody.innerHTML = '<div class="admin-login-form">' +
            '<h3>🔐 دخول لوحة الإدارة</h3>' +
            '<input type="password" id="adminPassword" placeholder="كلمة المرور" class="input-field">' +
            '<button class="submit-btn" onclick="loginAdmin()">دخول</button>' +
            '<button class="cancel-btn" onclick="closeModal()">إلغاء</button>' +
            '</div>';
    }

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function loginAdmin() {
    var passwordEl = document.getElementById('adminPassword');
    var password = passwordEl ? passwordEl.value : '';
    if (password === ADMIN_PASSWORD) {
        isAdmin = true;
        localStorage.setItem('isAdmin', 'true');
        closeModal();
        alert('تم تسجيل الدخول بنجاح! ✅');
        toggleAdminPanel();
    } else {
        alert('كلمة المرور غير صحيحة! ❌');
    }
}

function logoutAdmin() {
    isAdmin = false;
    localStorage.removeItem('isAdmin');
    closeModal();
    alert('تم تسجيل الخروج! 👋');
}

function toggleAdminPanel() {
    closeModal();
    var panel = document.getElementById('adminPanel');
    if (panel) {
        if (panel.classList.contains('hidden')) {
            panel.classList.remove('hidden');
        } else {
            panel.classList.add('hidden');
        }
        if (!panel.classList.contains('hidden')) {
            panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

function submitArticle(e) {
    e.preventDefault();
    if (!isAdmin) return;

    var title = document.getElementById('articleTitle').value.trim();
    var author = document.getElementById('articleAuthor').value.trim();
    var content = document.getElementById('articleContent').value.trim();
    var image = document.getElementById('articleImage').value.trim();

    if (!title || !content || !author) return;

    fetch(API_URL + '/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title, author: author, content: content, image: image })
    })
        .then(function(res) { return res.json(); })
        .then(function() {
            loadArticles();
            document.getElementById('articleTitle').value = '';
            document.getElementById('articleAuthor').value = '';
            document.getElementById('articleContent').value = '';
            document.getElementById('articleImage').value = '';
            var adminPanel = document.getElementById('adminPanel');
            if (adminPanel) adminPanel.classList.add('hidden');
            alert('تم نشر المقال بنجاح! ✅');
        })
        .catch(function(err) { console.error(err); });
}

// ============================================
// Global Functions
// ============================================
window.toggleArticleLike = toggleArticleLike;
window.openArticle = openArticle;
window.submitArticleComment = submitArticleComment;
window.shareArticle = shareArticle;
window.deleteArticle = deleteArticle;
window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;
window.toggleAdminPanel = toggleAdminPanel;

// ============================================
// Map Functions
// ============================================
function initMap() {
    var grid = document.getElementById('provincesGrid');
    if (!grid) return;

    var html = '';
    for (var i = 0; i < provincesData.length; i++) {
        var prov = provincesData[i];
        var name = window.i18n ? window.i18n.t('provinces.' + i + '.name', prov.name) : prov.name;
        html += '<button class="province-btn" onclick="selectProvince(' + prov.id + ')">' + name + '</button>';
    }
    grid.innerHTML = html;
}

function selectProvince(id) {
    var index = -1;
    for (var i = 0; i < provincesData.length; i++) {
        if (provincesData[i].id === id) {
            index = i;
            break;
        }
    }
    if (index === -1) return;
    var province = provincesData[index];

    // Get translations
    var name = window.i18n ? window.i18n.t('provinces.' + index + '.name', province.name) : province.name;
    var rate = window.i18n ? window.i18n.t('provinces.' + index + '.rate', province.rate) : province.rate;
    var type = window.i18n ? window.i18n.t('provinces.' + index + '.type', province.type) : province.type;
    var story = window.i18n ? window.i18n.t('provinces.' + index + '.story', province.story) : province.story;
    var childMarriageText = window.i18n ? window.i18n.t('stats_page.percentage_text', 'زواج قاصرات') : 'زواج قاصرات';

    // Update active state
    var buttons = document.querySelectorAll('.province-btn');
    for (var j = 0; j < buttons.length; j++) {
        var btn = buttons[j];
        if (btn.textContent.trim() === name) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }

    // Show details
    var emptyState = document.getElementById('mapEmptyState');
    if (emptyState) emptyState.classList.add('hidden');
    var details = document.getElementById('provinceDetails');
    if (details) details.classList.remove('hidden');

    // Show consequences section
    var mapConsequences = document.getElementById('mapConsequences');
    if (mapConsequences) mapConsequences.classList.remove('hidden');

    activeProvinceId = id;

    var provinceNameEl = document.getElementById('provinceName');
    var provinceRateEl = document.getElementById('provinceRate');
    var provinceTypeEl = document.getElementById('provinceType');
    var provinceStoryEl = document.getElementById('provinceStory');
    
    if (provinceNameEl) provinceNameEl.textContent = name;
    if (provinceRateEl) provinceRateEl.textContent = rate + ' ' + childMarriageText;
    if (provinceTypeEl) provinceTypeEl.textContent = type;
    if (provinceStoryEl) provinceStoryEl.textContent = '"' + story + '"';
}

window.selectProvince = selectProvince;

// ============================================
// Particles Effect
// ============================================
function initParticles() {
    var container = document.getElementById('particles');
    if (!container) return;

    var particleCount = 30;

    for (var i = 0; i < particleCount; i++) {
        var particle = document.createElement('div');
        particle.className = 'particle';

        // Random position
        particle.style.left = Math.random() * 100 + '%';

        // Random animation duration (5-15 seconds)
        var duration = 5 + Math.random() * 10;
        particle.style.animationDuration = duration + 's';

        // Random delay
        particle.style.animationDelay = Math.random() * 10 + 's';

        container.appendChild(particle);
    }
}

// ============================================
// Scroll Reveal Animations
// ============================================
function initScrollReveal() {
    var revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    function revealOnScroll() {
        for (var i = 0; i < revealElements.length; i++) {
            var el = revealElements[i];
            var elementTop = el.getBoundingClientRect().top;
            var windowHeight = window.innerHeight;

            if (elementTop < windowHeight - 100) {
                el.classList.add('active');
            }
        }
    }

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check
}

// ============================================
// Deferred Content Loading - For better performance
// ============================================
function loadDeferredContent() {
    // Load API content after initial render
    loadStats();
    loadArticles();
    incrementViews();
    initScrollReveal();
    
    // Load comments with slight delay (less critical)
    setTimeout(loadComments, 300);
}

// ============================================
// Initialize - Optimized for fast loading
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded - Initializing...');
    
    // Critical: Initialize theme and UI immediately
    initTheme();
    initParticles();
    
    // Defer non-critical API calls - Safari compatible
    if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(loadDeferredContent);
    } else {
        setTimeout(loadDeferredContent, 100);
    }

    if (hasLiked) {
        var likeBtnInit = document.getElementById('likeBtn');
        if (likeBtnInit) {
            likeBtnInit.classList.add('liked');
            var heartIcon = likeBtnInit.querySelector('.heart-icon');
            if (heartIcon) heartIcon.textContent = '❤️';
        }
    }

    // Theme toggle - with iOS touch support
    var themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        themeToggle.addEventListener('touchend', function(e) {
            e.preventDefault();
            toggleTheme();
        });
    }
    // Header theme toggle - with iOS touch support
    var headerThemeToggle = document.getElementById('headerThemeToggle');
    if (headerThemeToggle) {
        headerThemeToggle.addEventListener('click', toggleTheme);
        headerThemeToggle.addEventListener('touchend', function(e) {
            e.preventDefault();
            toggleTheme();
        });
    }
    
    // Start button - with iOS touch support
    var startBtnInit = document.getElementById('startBtn');
    if (startBtnInit) {
        startBtnInit.addEventListener('click', startExperience);
        startBtnInit.addEventListener('touchend', function(e) {
            e.preventDefault();
            startExperience();
        });
    }

    var ageSlider = document.getElementById('ageSlider');
    if (ageSlider) {
        ageSlider.addEventListener('input', function(e) {
            currentAge = parseInt(e.target.value);
            var ageNumberEl = document.getElementById('ageNumber');
            if (ageNumberEl) ageNumberEl.textContent = currentAge;
            // Also looking for ageValue in case it wasn't renamed in HTML yet
            var ageValueEl = document.getElementById('ageValue');
            if (ageValueEl) ageValueEl.textContent = currentAge;
            updateRights();
            updateTimeline();
            updateImpacts();
        });
    }

    var likeBtn = document.getElementById('likeBtn');
    if (likeBtn) likeBtn.addEventListener('click', toggleLike);
    
    var shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            var modal = document.getElementById('detailsModal');
            var modalBody = document.getElementById('modalBody');
            modalBody.innerHTML = '<h3 class="modal-title">📤 شارك الموقع</h3>' +
                '<div class="share-buttons">' +
                '<button class="share-btn twitter" onclick="shareTwitter()">𝕏 تويتر</button>' +
                '<button class="share-btn whatsapp" onclick="shareWhatsapp()">واتساب</button>' +
                '<button class="share-btn copy" id="copyLink" onclick="copyLink()">📋 نسخ الرابط</button>' +
                '</div>';
            modal.classList.add('show');
        });
    }

    var modalClose = document.getElementById('modalClose');
    if (modalClose) modalClose.addEventListener('click', closeModal);
    
    var detailsModal = document.getElementById('detailsModal');
    if (detailsModal) {
        detailsModal.addEventListener('click', function(e) {
            // Close when clicking outside the modal content (on overlay or modal background)
            if (e.target.id === 'detailsModal' || e.target.classList.contains('modal-overlay')) {
                closeModal();
            }
        });
    }

    var commentForm = document.getElementById('commentForm');
    if (commentForm) commentForm.addEventListener('submit', submitComment);
    
    var cancelAdmin = document.getElementById('cancelAdmin');
    if (cancelAdmin) {
        cancelAdmin.addEventListener('click', function() {
            var adminPanel = document.getElementById('adminPanel');
            if (adminPanel) adminPanel.classList.add('hidden');
        });
    }
    
    var articleForm = document.getElementById('articleForm');
    if (articleForm) articleForm.addEventListener('submit', submitArticle);

    // Stats Overlay Button - with iOS touch support
    var statsBtn = document.getElementById('statsBtn');
    if (statsBtn) {
        statsBtn.addEventListener('click', goToMainExperience);
        statsBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            goToMainExperience();
        });
    }

    // ============================================
    // Language Toggle - Single Button (handles both global and header toggles)
    // ============================================
    function setupLanguageToggle() {
        console.log('🔧 Setting up language toggle buttons...');

        var toggleBtn = document.getElementById('languageToggle');
        var langIcon = document.getElementById('langIcon');
        var headerToggleBtn = document.getElementById('headerLangToggle');

        // Update all button texts based on current language
        function updateToggleButtons() {
            var currentLang = window.i18n && window.i18n.getCurrentLanguage ? window.i18n.getCurrentLanguage() : 'ar';
            // Show the OTHER language (the one we'll switch TO)
            var newText = currentLang === 'ar' ? 'EN' : 'ع';
            
            if (langIcon) langIcon.textContent = newText;
            if (headerToggleBtn) {
                var headerLangIcon = headerToggleBtn.querySelector('.lang-icon');
                if (headerLangIcon) headerLangIcon.textContent = newText;
            }
            console.log('🔄 Toggle buttons updated to show: ' + newText);
        }

        // Toggle language function
        function handleLanguageToggle() {
            if (!window.i18n) {
                console.warn('⚠️ i18n not available');
                return;
            }

            var currentLang = window.i18n.getCurrentLanguage();
            var newLang = currentLang === 'ar' ? 'en' : 'ar';

            console.log('🌐 Toggling language from ' + currentLang + ' to ' + newLang);

            window.i18n.setLanguage(newLang).then(function() {
                updateToggleButtons();
                console.log('✅ Language toggled to: ' + newLang);
            }).catch(function(error) {
                console.error('❌ Error toggling language:', error);
            });
        }

        // Add click listeners to both buttons - with iOS touch support
        if (toggleBtn) {
            toggleBtn.addEventListener('click', handleLanguageToggle);
            toggleBtn.addEventListener('touchend', function(e) {
                e.preventDefault();
                handleLanguageToggle();
            });
        }
        if (headerToggleBtn) {
            headerToggleBtn.addEventListener('click', handleLanguageToggle);
            headerToggleBtn.addEventListener('touchend', function(e) {
                e.preventDefault();
                handleLanguageToggle();
            });
        }

        // Listen for language changes from other sources
        document.addEventListener('languageChanged', function (e) {
            console.log('📢 Language changed event received:', e.detail);
            updateToggleButtons();
        });

        // Set initial state
        setTimeout(function() {
            updateToggleButtons();
            console.log('✅ Language toggle initialized');
        }, 100);
    }

    // Initialize language toggle
    setupLanguageToggle();

    // ============================================
    // Language Change Handler for Dynamic Content
    // ============================================
    document.addEventListener('languageChanged', function (e) {
        console.log('🌐 Language changed to:', e.detail.language);
        console.log('🔄 Updating all dynamic content...');

        // Update all dynamic content
        if (typeof updateRights === 'function') {
            updateRights();
        }
        if (typeof updateImpacts === 'function') {
            updateImpacts();
        }
        if (typeof initMap === 'function') {
            initMap();
        }
        if (activeProvinceId && typeof selectProvince === 'function') {
            selectProvince(activeProvinceId);
        }
        if (typeof renderArticles === 'function') {
            renderArticles();
        }

        console.log('✅ All dynamic content updated');
    });
});
