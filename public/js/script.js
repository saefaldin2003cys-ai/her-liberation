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
const API_URL = '/api';

// ============================================
// Rights Data
// ============================================
const rightsData = {
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
            description: 'توقيع العقود يحتاج موافقة الولي وإشراف قضائي. محكمة الأحداث هي الحامية.',
            details: 'يمكن للفتاة توقيع بعض العقود بموافقة الولي وتحت إشراف قضائي من محكمة الأحداث.',
            law: 'قانون رعاية القاصرين'
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

const impactData = {
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
const provincesData = [
    { id: 1, name: 'ميسان', rate: '35%', type: 'أعلى نسبة', story: 'وردة (13 سنة) تزوجت بعد وفاة والدتها، وأجبرت على الحمل المبكر رغم صغر سنها، ما سبب لها مضاعفات صحية' },
    { id: 2, name: 'البصرة', rate: '31.5%', type: 'عشائري', story: '   سارة (12 سنة) أُجبرت على الزواج بسبب ضغوط العائلة والحالة الاقتصادية، واضطرت لترك المدرسة قبل بداية المراهقة' },
    { id: 3, name: 'كربلاء', rate: '31.2%', type: 'اجتماعي', story: 'هالة (14 سنة) زُوّجت لتخفيف أعباء العائلة المالية، وأُبعدت عن أصدقاء المدرسة وحياتها الطبيعية' },
    { id: 4, name: 'دهوك', rate: '18.3%', type: 'قانوني/اجتماعي', story: ' نور (16 سنة) حصلت على إذن قضائي للزواج، لكنها نادمة بسبب فقدان حرية اختيارها والضغوط الاجتماعية المحيطة' },
    { id: 5, name: 'كركوك', rate: '15.9%', type: 'تقاليد', story: 'سمر (15 سنة) زوّجها والدها لرجل أكبر منها بعقد غير مسجّل، وانتهى الزواج سريعًا لتدخل في صراع قانوني لإثبات حقوقها وحقوق طفلها.' }
];

const statusLabels = {
    forbidden: 'ممنوع',
    conditional: 'مشروط',
    allowed: 'مسموح'
};

// ============================================
// State
// ============================================
let currentAge = 9;
let hasLiked = localStorage.getItem('hasLiked') === 'true';
let viewCount = 0;
let likeCount = 0;
let activeProvinceId = null;

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
    const icon = $('.theme-icon');
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
    const viewEl = $('#viewCount');
    const likeEl = $('#likeCount');
    const headerLikeEl = $('#headerLikeCount');

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
    const list = $('#commentsList');
    if (!list) {
        setTimeout(loadComments, 500);
        return;
    }

    fetch(`${API_URL}/comments`)
        .then(res => res.json())
        .then(comments => renderComments(comments))
        .catch(() => renderComments([]));
}

function submitComment(e) {
    e.preventDefault();
    const nameInput = $('#commentName');
    const textInput = $('#commentText');
    const name = nameInput.value.trim() || 'زائر';
    const text = textInput.value.trim();
    if (!text) return;

    fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, text })
    })
        .then(res => res.json())
        .then(() => loadComments())
        .catch(console.error);

    nameInput.value = '';
    textInput.value = '';
}

function renderComments(comments) {
    const list = $('#commentsList');
    if (!list) return;
    list.innerHTML = comments.map(createCommentHTML).join('');
}

function createCommentHTML(comment) {
    const timeAgo = getTimeAgo(new Date(comment.timestamp));
    return `
        <div class="comment-item">
            <div class="comment-header">
                <span class="comment-author">${escapeHTML(comment.name)}</span>
                <span class="comment-date">${timeAgo}</span>
            </div>
            <p class="comment-text">${escapeHTML(comment.text)}</p>
        </div>
    `;
}

function getTimeAgo(date) {
    const seconds = Math.floor((Date.now() - date) / 1000);
    if (seconds < 60) return 'الآن';
    if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} دقيقة`;
    if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} ساعة`;
    return `منذ ${Math.floor(seconds / 86400)} يوم`;
}

function escapeHTML(str) {
    const div = document.createElement('div');
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
    const container = $('#rightsContainer');
    if (!container) return;
    const closestAge = getClosestAge(currentAge);
    const rights = rightsData[closestAge];

    container.innerHTML = Object.entries(rights).map(([key, right]) => {
        // Get translated text
        const title = window.i18n ? window.i18n.t(`rights_data.${closestAge}.${key}.title`, right.title) : right.title;
        const statusLabel = window.i18n ? window.i18n.t(`rights_data.${closestAge}.${key}.statusLabel`, right.statusLabel) : right.statusLabel;
        const description = window.i18n ? window.i18n.t(`rights_data.${closestAge}.${key}.description`, right.description) : right.description;
        const detailsBtn = window.i18n ? window.i18n.t('rights.view_details', 'عرض التفاصيل') : 'عرض التفاصيل';

        return `
            <div class="right-card ${right.status}" onclick="showDetails('${key}', ${closestAge})">
                <div class="right-header">
                    <span class="right-icon">${right.icon}</span>
                    <div class="right-info">
                        <h4 class="right-title">${title}</h4>
                        <span class="right-status status-${right.status}">${statusLabel}</span>
                    </div>
                </div>
                <p class="right-description">${description}</p>
                <button class="details-btn">${detailsBtn}</button>
            </div>
        `;
    }).join('');
}

function updateTimeline() {
    const items = $$('.timeline-item');
    items.forEach(item => {
        const ageRange = item.dataset.age;
        let isActive = false;
        if (ageRange === '9-12' && currentAge >= 9 && currentAge <= 12) isActive = true;
        if (ageRange === '13-15' && currentAge >= 13 && currentAge <= 15) isActive = true;
        if (ageRange === '16-17' && currentAge >= 16 && currentAge <= 17) isActive = true;
        if (ageRange === '18' && currentAge >= 18) isActive = true;
        item.classList.toggle('active', isActive);
    });
}

function updateImpacts() {
    const container = $('#impactGrid');
    if (!container) return;
    const closestAge = getClosestAge(currentAge);
    const impacts = impactData[closestAge] || [];

    container.innerHTML = impacts.map((impact, index) => {
        // Get translated text
        const text = window.i18n ? window.i18n.t(`impact_data.${closestAge}.${index}.text`, impact.text) : impact.text;

        return `
            <div class="impact-item ${impact.type}">
                <span class="impact-icon">${impact.icon}</span>
                <span class="impact-text">${text}</span>
            </div>
        `;
    }).join('');
}

// ============================================
// Modal Functions
// ============================================
function showDetails(key, age) {
    const modal = $('#detailsModal');
    const modalBody = $('#modalBody');
    const right = rightsData[age][key];

    // Get translated text
    const title = window.i18n ? window.i18n.t(`rights_data.${age}.${key}.title`, right.title) : right.title;
    const details = window.i18n ? window.i18n.t(`rights_data.${age}.${key}.details`, right.details) : right.details;
    const law = window.i18n ? window.i18n.t(`rights_data.${age}.${key}.law`, right.law) : right.law;
    const legalRefLabel = window.i18n ? window.i18n.t('rights.legal_reference', 'المرجع القانوني') : 'المرجع القانوني';

    modalBody.innerHTML = `
        <h3 class="modal-title">${right.icon} ${title}</h3>
        <p class="modal-description">${details}</p>
        <div class="modal-law">
            <div class="law-title">📜 ${legalRefLabel}</div>
            <div class="law-text">${law}</div>
        </div>
    `;
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
    const text = window.i18n ? window.i18n.t('share.twitter_text', 'اكتشفي حقوق الطفلة في القانون ومخاطر الزواج المبكر 💔\n\n#تحريرها #حماية_الطفولة') : 'اكتشفي حقوق الطفلة في القانون ومخاطر الزواج المبكر 💔\n\n#تحريرها #حماية_الطفولة';
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
}

function shareWhatsapp() {
    const text = window.i18n ? window.i18n.t('share.whatsapp_text', `اكتشفي حقوق الطفلة في القانون ومخاطر الزواج المبكر\n\n${window.location.href}`) : `اكتشفي حقوق الطفلة في القانون ومخاطر الزواج المبكر\n\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const btn = $('#copyLink');
        if (!btn) return;

        const originalText = btn.innerHTML;
        const copiedText = window.i18n ? window.i18n.t('cta.link_copied', 'تم النسخ!') : 'تم النسخ!';

        btn.innerHTML = `<span>✓</span> ${copiedText}`;
        setTimeout(() => { btn.innerHTML = originalText; }, 2000);
    });
}

// ============================================
// Admin Password - SECRET ACCESS
// Press Ctrl+Shift+K to open admin login
// ============================================
const ADMIN_PASSWORD = 'TahrirAdmin@2025';
let isAdmin = localStorage.getItem('isAdmin') === 'true';

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        showAdminLogin();
    }
});

// ============================================
// Articles State
// ============================================
let articles = [];
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
        : '<div class="article-image-placeholder"><span class="emoji-icon">📰</span></div>';
    
    var authorHtml = author ? ' • <span class="emoji-icon">✍️</span> ' + escapeHTML(author) : '';

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
            '<span>❤️ ' + (article.likes || 0) + ' ' + likesLabel + '</span>' +
            '<span>💬 ' + comments.length + ' ' + commentsLabel + '</span>' +
        '</div>' +
        '<div class="article-modal-body">' + escapeHTML(content).replace(/\n/g, '<br>') + '</div>' +
        '<div class="article-modal-actions">' +
            '<button class="article-action-btn ' + (isLiked ? 'liked' : '') + '" onclick="toggleArticleLike(\'' + article._id + '\'); openArticle(\'' + article._id + '\');">' +
                '<span class="action-icon">' + (isLiked ? '❤️' : '🤍') + '</span>' +
                '<span>' + likeText + '</span>' +
            '</button>' +
            '<button class="article-action-btn" onclick="shareArticle(\'' + article._id + '\')">' +
                '<span class="action-icon">📤</span>' +
                '<span>' + shareText + '</span>' +
            '</button>' +
            deleteBtn +
        '</div>' +
        '<div class="article-comments-section">' +
            '<h4>' + commentsTitle + '</h4>' +
            '<div class="comments-list">' + commentsHtml + '</div>' +
            '<form class="comment-form" onsubmit="submitArticleComment(event, \'' + article._id + '\')">' +
                '<input type="text" id="articleCommentName" placeholder="' + namePlaceholder + '" class="details-input" required>' +
                '<textarea id="articleCommentText" placeholder="' + writeCommentPlaceholder + '" class="details-input" required></textarea>' +
                '<button type="submit" class="details-btn">' + sendText + '</button>' +
            '</form>' +
        '</div>' +
    '</div>';

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function submitArticleComment(e, articleId) {
    e.preventDefault();
    const name = document.getElementById('articleCommentName').value.trim() || 'زائر';
    const text = document.getElementById('articleCommentText').value.trim();
    if (!text) return;

    fetch(`${API_URL}/articles/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, text })
    })
        .then(res => res.json())
        .then(() => {
            loadArticles();
            openArticle(articleId);
        })
        .catch(console.error);
}

function shareArticle(articleId) {
    const article = articles.find(a => a._id === articleId);
    if (!article) return;
    const { title } = getArticleContent(article);
    const text = `${title}\n\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function deleteArticle(articleId) {
    if (!isAdmin) return;
    if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return;

    fetch(`${API_URL}/articles/${articleId}`, { method: 'DELETE' })
        .then(() => {
            closeModal();
            loadArticles();
        })
        .catch(console.error);
}

// ============================================
// Admin Functions
// ============================================
function showAdminLogin() {
    const modal = $('#detailsModal');
    const modalBody = $('#modalBody');

    if (isAdmin) {
        modalBody.innerHTML = `
            <div class="admin-login-form">
                <h3>👋 مرحباً أيها المدير!</h3>
                <p>أنت مسجل الدخول كمدير</p>
                <button class="submit-btn" onclick="toggleAdminPanel()">✍️ كتابة مقال جديد</button>
                <button class="cancel-btn" onclick="logoutAdmin()">🚪 تسجيل الخروج</button>
            </div>
        `;
    } else {
        modalBody.innerHTML = `
            <div class="admin-login-form">
                <h3>🔐 دخول لوحة الإدارة</h3>
                <input type="password" id="adminPassword" placeholder="كلمة المرور" class="input-field">
                <button class="submit-btn" onclick="loginAdmin()">دخول</button>
                <button class="cancel-btn" onclick="closeModal()">إلغاء</button>
            </div>
        `;
    }

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function loginAdmin() {
    const password = $('#adminPassword').value;
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
    const panel = $('#adminPanel');
    if (panel) {
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) {
            panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

function submitArticle(e) {
    e.preventDefault();
    if (!isAdmin) return;

    const title = $('#articleTitle').value.trim();
    const author = $('#articleAuthor').value.trim();
    const content = $('#articleContent').value.trim();
    const image = $('#articleImage').value.trim();

    if (!title || !content || !author) return;

    fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author, content, image })
    })
        .then(res => res.json())
        .then(() => {
            loadArticles();
            $('#articleTitle').value = '';
            $('#articleAuthor').value = '';
            $('#articleContent').value = '';
            $('#articleImage').value = '';
            const adminPanel = $('#adminPanel');
            if (adminPanel) adminPanel.classList.add('hidden');
            alert('تم نشر المقال بنجاح! ✅');
        })
        .catch(console.error);
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
    const grid = $('#provincesGrid');
    if (!grid) return;

    grid.innerHTML = provincesData.map((prov, index) => {
        // Get translated name
        const name = window.i18n ? window.i18n.t(`provinces.${index}.name`, prov.name) : prov.name;

        return `
            <button class="province-btn" onclick="selectProvince(${prov.id})">
                ${name}
            </button>
        `;
    }).join('');
}

function selectProvince(id) {
    const index = provincesData.findIndex(p => p.id === id);
    if (index === -1) return;
    const province = provincesData[index];

    // Get translations
    const name = window.i18n ? window.i18n.t(`provinces.${index}.name`, province.name) : province.name;
    const rate = window.i18n ? window.i18n.t(`provinces.${index}.rate`, province.rate) : province.rate;
    const type = window.i18n ? window.i18n.t(`provinces.${index}.type`, province.type) : province.type;
    const story = window.i18n ? window.i18n.t(`provinces.${index}.story`, province.story) : province.story;
    const childMarriageText = window.i18n ? window.i18n.t('stats_page.percentage_text', 'زواج قاصرات') : 'زواج قاصرات';

    // Update active state
    $$('.province-btn').forEach((btn, i) => {
        // Re-fetch translated name for comparison to be safe, or just check index if we had it attached to DOM
        // Simpler: just check if the button text matches the current translated name
        btn.classList.toggle('active', btn.textContent.trim() === name);
    });

    // Show details
    $('#mapEmptyState').classList.add('hidden');
    const details = $('#provinceDetails');
    details.classList.remove('hidden');

    // Show consequences section
    const mapConsequences = $('#mapConsequences');
    if (mapConsequences) mapConsequences.classList.remove('hidden');

    activeProvinceId = id;

    $('#provinceName').textContent = name;
    $('#provinceRate').textContent = `${rate} ${childMarriageText}`;
    $('#provinceType').textContent = type;
    $('#provinceStory').textContent = `"${story}"`;
}

window.selectProvince = selectProvince;

// ============================================
// Particles Effect
// ============================================
function initParticles() {
    const container = $('#particles');
    if (!container) return;

    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Random position
        particle.style.left = Math.random() * 100 + '%';

        // Random animation duration (5-15 seconds)
        const duration = 5 + Math.random() * 10;
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
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    const revealOnScroll = () => {
        revealElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            if (elementTop < windowHeight - 100) {
                el.classList.add('active');
            }
        });
    };

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
        const likeBtn = $('#likeBtn');
        if (likeBtn) {
            likeBtn.classList.add('liked');
            likeBtn.querySelector('.heart-icon').textContent = '❤️';
        }
    }

    // Theme toggle - with iOS touch support
    const themeToggle = $('#themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        themeToggle.addEventListener('touchend', function(e) {
            e.preventDefault();
            toggleTheme();
        });
    }
    // Header theme toggle - with iOS touch support
    const headerThemeToggle = $('#headerThemeToggle');
    if (headerThemeToggle) {
        headerThemeToggle.addEventListener('click', toggleTheme);
        headerThemeToggle.addEventListener('touchend', function(e) {
            e.preventDefault();
            toggleTheme();
        });
    }
    
    // Start button - with iOS touch support
    const startBtn = $('#startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', startExperience);
        startBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            startExperience();
        });
    }

    const ageSlider = $('#ageSlider');
    if (ageSlider) {
        ageSlider.addEventListener('input', (e) => {
            currentAge = parseInt(e.target.value);
            const ageNumberEl = $('#ageNumber');
            if (ageNumberEl) ageNumberEl.textContent = currentAge;
            // Also looking for ageValue in case it wasn't renamed in HTML yet
            const ageValueEl = $('#ageValue');
            if (ageValueEl) ageValueEl.textContent = currentAge;
            updateRights();
            updateTimeline();
            updateImpacts();
        });
    }

    const likeBtn = $('#likeBtn');
    if (likeBtn) likeBtn.addEventListener('click', toggleLike);
    
    const shareBtn = $('#shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            const modal = $('#detailsModal');
            const modalBody = $('#modalBody');
            modalBody.innerHTML = `
                <h3 class="modal-title">📤 شارك الموقع</h3>
                <div class="share-buttons">
                    <button class="share-btn twitter" onclick="shareTwitter()">𝕏 تويتر</button>
                    <button class="share-btn whatsapp" onclick="shareWhatsapp()">واتساب</button>
                    <button class="share-btn copy" id="copyLink" onclick="copyLink()">📋 نسخ الرابط</button>
                </div>
            `;
            modal.classList.add('show');
        });
    }

    const modalClose = $('#modalClose');
    if (modalClose) modalClose.addEventListener('click', closeModal);
    
    const detailsModal = $('#detailsModal');
    if (detailsModal) {
        detailsModal.addEventListener('click', function(e) {
            // Close when clicking outside the modal content (on overlay or modal background)
            if (e.target.id === 'detailsModal' || e.target.classList.contains('modal-overlay')) {
                closeModal();
            }
        });
    }

    const commentForm = $('#commentForm');
    if (commentForm) commentForm.addEventListener('submit', submitComment);
    
    const cancelAdmin = $('#cancelAdmin');
    if (cancelAdmin) {
        cancelAdmin.addEventListener('click', function() {
            const adminPanel = $('#adminPanel');
            if (adminPanel) adminPanel.classList.add('hidden');
        });
    }
    
    const articleForm = $('#articleForm');
    if (articleForm) articleForm.addEventListener('submit', submitArticle);

    // Stats Overlay Button - with iOS touch support
    const statsBtn = $('#statsBtn');
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

        const toggleBtn = document.getElementById('languageToggle');
        const langIcon = document.getElementById('langIcon');
        const headerToggleBtn = document.getElementById('headerLangToggle');

        // Update all button texts based on current language
        function updateToggleButtons() {
            const currentLang = window.i18n && window.i18n.getCurrentLanguage ? window.i18n.getCurrentLanguage() : 'ar';
            // Show the OTHER language (the one we'll switch TO)
            const newText = currentLang === 'ar' ? 'EN' : 'ع';
            
            if (langIcon) langIcon.textContent = newText;
            if (headerToggleBtn) {
                headerToggleBtn.querySelector('.lang-icon').textContent = newText;
            }
            console.log(`🔄 Toggle buttons updated to show: ${newText}`);
        }

        // Toggle language function
        async function handleLanguageToggle() {
            if (!window.i18n) {
                console.warn('⚠️ i18n not available');
                return;
            }

            const currentLang = window.i18n.getCurrentLanguage();
            const newLang = currentLang === 'ar' ? 'en' : 'ar';

            console.log(`🌐 Toggling language from ${currentLang} to ${newLang}`);

            try {
                await window.i18n.setLanguage(newLang);
                updateToggleButtons();
                console.log(`✅ Language toggled to: ${newLang}`);
            } catch (error) {
                console.error('❌ Error toggling language:', error);
            }
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
        setTimeout(() => {
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
