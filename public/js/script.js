/* ============================================
   تحريرها - JavaScript Application
   Production Ready API Integration
   ============================================ */

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
// DOM Helpers
// ============================================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// ============================================
// Theme
// ============================================
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
        updateThemeIcon(true);
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
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
    fetch(`${API_URL}/stats`)
        .then(res => res.json())
        .then(data => {
            viewCount = data.views || 0;
            likeCount = data.likes || 0;
            updateStatsDisplay();
        })
        .catch(() => {
            viewCount = 150;
            likeCount = 42;
            updateStatsDisplay();
        });
}

function incrementViews() {
    fetch(`${API_URL}/stats/view`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            viewCount = data.views;
            likeCount = data.likes;
            updateStatsDisplay();
        })
        .catch(() => { });
}

function toggleLike() {
    if (hasLiked) return;
    hasLiked = true;
    localStorage.setItem('hasLiked', 'true');

    fetch(`${API_URL}/stats/like`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            likeCount = data.likes;
            updateStatsDisplay();
        })
        .catch(() => {
            likeCount++;
            updateStatsDisplay();
        });

    const likeBtn = $('#likeBtn');
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
    // Go to Stats Overlay (Page 2)
    $('#startScreen').classList.add('hidden');
    $('#statsOverlay').classList.remove('hidden');
}

function goToMainExperience() {
    // Go to Main Experience (Page 3)
    $('#statsOverlay').classList.add('hidden');
    $('#mainExperience').classList.remove('hidden');
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
    const modal = $('#detailsModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

window.showDetails = showDetails;

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
let articleLikes = JSON.parse(localStorage.getItem('articleLikes') || '{}');

// ============================================
// Articles Functions (API)
// ============================================
function loadArticles() {
    const grid = $('#articlesGrid');
    if (!grid) return;

    fetch(`${API_URL}/articles`)
        .then(res => res.json())
        .then(data => {
            articles = data;
            renderArticles();
        })
        .catch(() => {
            articles = [];
            renderArticles();
        });
}

function renderArticles() {
    const grid = $('#articlesGrid');
    if (!grid) return;

    if (articles.length === 0) {
        grid.innerHTML = '<div class="no-articles"><p>لا توجد مقالات حالياً</p></div>';
        return;
    }

    grid.innerHTML = articles.map(article => renderArticleCard(article)).join('');
}

// Helper to get translated article content
function getArticleContent(article) {
    const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'ar';

    // Handle both old string format and new object format
    const title = typeof article.title === 'object' ? (article.title[lang] || article.title.ar) : article.title;
    const author = typeof article.author === 'object' ? (article.author[lang] || article.author.ar) : article.author;
    const content = typeof article.content === 'object' ? (article.content[lang] || article.content.ar) : article.content;

    return { title, author, content };
}

function renderArticleCard(article) {
    const date = new Date(article.timestamp);
    const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'ar';
    const formattedDate = date.toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-IQ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const { title, author, content } = getArticleContent(article);
    const excerpt = content.substring(0, 100) + '...';
    const isLiked = articleLikes[article.id];
    const commentsCount = (article.comments || []).length;
    const readMoreText = lang === 'en' ? 'Read More' : 'قراءة المزيد';

    return `
        <article class="article-card">
            ${article.image
            ? `<img src="${escapeHTML(article.image)}" alt="${escapeHTML(title)}" class="article-image">`
            : `<div class="article-image-placeholder"><span class="emoji-icon">📰</span></div>`
        }
            <div class="article-body">
                <h4 class="article-title">${escapeHTML(title)}</h4>
                <p class="article-date"><span class="emoji-icon">📅</span> ${formattedDate} ${author ? `• <span class="emoji-icon">✍️</span> ${escapeHTML(author)}` : ''}</p>
                <p class="article-excerpt">${escapeHTML(excerpt)}</p>
                
                <hr class="article-divider">
                
                <div class="article-actions">
                    <button class="article-action-btn ${isLiked ? 'liked' : ''}" onclick="toggleArticleLike('${article.id}')">
                        <span class="action-icon emoji-icon">${isLiked ? '❤️' : '🤍'}</span>
                        <span>${article.likes || 0}</span>
                    </button>
                    <button class="article-action-btn" onclick="openArticle('${article.id}')">
                        <span class="action-icon emoji-icon">💬</span>
                        <span>${commentsCount}</span>
                    </button>
                    <button class="read-more-btn" onclick="openArticle('${article.id}')">${readMoreText}</button>
                </div>
            </div>
        </article>
    `;
}

function toggleArticleLike(articleId) {
    if (articleLikes[articleId]) return;

    articleLikes[articleId] = true;
    localStorage.setItem('articleLikes', JSON.stringify(articleLikes));

    fetch(`${API_URL}/articles/${articleId}/like`, { method: 'POST' })
        .then(res => res.json())
        .then(() => loadArticles())
        .catch(console.error);
}

function openArticle(articleId) {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    const modal = $('#detailsModal');
    const modalBody = $('#modalBody');
    const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'ar';
    const { title, author, content } = getArticleContent(article);

    const date = new Date(article.timestamp);
    const formattedDate = date.toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-IQ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const isLiked = articleLikes[articleId];
    const comments = article.comments || [];

    // Translation constants
    const likeText = lang === 'en' ? 'Like' : 'إعجاب';
    const shareText = lang === 'en' ? 'Share' : 'مشاركة';
    const commentsTitle = lang === 'en' ? 'Comments' : 'التعليقات';
    const noCommentsText = lang === 'en' ? 'No comments yet' : 'لا توجد تعليقات بعد';
    const writeCommentPlaceholder = lang === 'en' ? 'Write a comment...' : 'اكتب تعليقاً...';
    const namePlaceholder = lang === 'en' ? 'Your Name' : 'اسمك';
    const sendText = lang === 'en' ? 'Send' : 'إرسال';
    const likesLabel = lang === 'en' ? 'Likes' : 'إعجاب';
    const commentsLabel = lang === 'en' ? 'Comments' : 'تعليق';

    modalBody.innerHTML = `
        <div class="article-modal-content">
            ${article.image ? `<img src="${escapeHTML(article.image)}" alt="" class="article-modal-image">` : ''}
            <h3 class="article-modal-title">${escapeHTML(title)}</h3>
            <div class="article-modal-meta">
                <span>📅 ${formattedDate}</span>
                ${author ? `<span>✍️ ${escapeHTML(author)}</span>` : ''}
                <span>❤️ ${article.likes || 0} ${likesLabel}</span>
                <span>💬 ${comments.length} ${commentsLabel}</span>
            </div>
            <div class="article-modal-body">${escapeHTML(content).replace(/\n/g, '<br>')}</div>
            
            <div class="article-modal-actions">
                <button class="article-action-btn ${isLiked ? 'liked' : ''}" onclick="toggleArticleLike('${article.id}'); openArticle('${article.id}');">
                    <span class="action-icon">${isLiked ? '❤️' : '🤍'}</span>
                    <span>${likeText}</span>
                </button>
                <button class="article-action-btn" onclick="shareArticle('${article.id}')">
                    <span class="action-icon">📤</span>
                    <span>${shareText}</span>
                </button>
                ${isAdmin ? `<button class="article-action-btn danger" onclick="deleteArticle('${article.id}')">
                    <span class="action-icon">🗑️</span>
                    <span>حذف</span>
                </button>` : ''}
            </div>

            <div class="article-comments-section">
                <h4>${commentsTitle}</h4>
                <div class="comments-list">
                    ${comments.length ? comments.map(c => `
                        <div class="comment-item">
                            <div class="comment-header">
                                <strong>${escapeHTML(c.name)}</strong>
                                <span class="comment-date">${new Date(c.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p>${escapeHTML(c.text)}</p>
                        </div>
                    `).join('') : `<p class="no-comments">${noCommentsText}</p>`}
                </div>
                
                <form class="comment-form" onsubmit="submitArticleComment(event, '${article.id}')">
                    <input type="text" id="articleCommentName" placeholder="${namePlaceholder}" class="details-input" required>
                    <textarea id="articleCommentText" placeholder="${writeCommentPlaceholder}" class="details-input" required></textarea>
                    <button type="submit" class="details-btn">${sendText}</button>
                </form>
            </div>
        </div>
    `;
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
    const article = articles.find(a => a.id === articleId);
    if (!article) return;
    const text = `${article.title}\n\n${window.location.href}`;
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
            $('#adminPanel')?.classList.add('hidden');
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
    $('#mapConsequences')?.classList.remove('hidden');

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
// Initialize
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadStats();
    loadComments();
    loadArticles();
    incrementViews();
    initParticles();
    initScrollReveal();

    if (hasLiked) {
        const likeBtn = $('#likeBtn');
        if (likeBtn) {
            likeBtn.classList.add('liked');
            likeBtn.querySelector('.heart-icon').textContent = '❤️';
        }
    }

    $('#themeToggle')?.addEventListener('click', toggleTheme);
    $('#startBtn')?.addEventListener('click', startExperience);

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

    $('#likeBtn')?.addEventListener('click', toggleLike);
    $('#shareBtn')?.addEventListener('click', () => {
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

    $('#modalClose')?.addEventListener('click', closeModal);
    $('#detailsModal')?.addEventListener('click', (e) => {
        // Close when clicking outside the modal content (on overlay or modal background)
        if (e.target.id === 'detailsModal' || e.target.classList.contains('modal-overlay')) {
            closeModal();
        }
    });

    $('#commentForm')?.addEventListener('submit', submitComment);
    $('#cancelAdmin')?.addEventListener('click', () => {
        $('#adminPanel')?.classList.add('hidden');
    });
    $('#articleForm')?.addEventListener('submit', submitArticle);

    // Stats Overlay Button
    $('#statsBtn')?.addEventListener('click', goToMainExperience);

    // ============================================
    // Language Toggle - Single Button
    // ============================================
    function setupLanguageToggle() {
        console.log('🔧 Setting up language toggle button...');

        const toggleBtn = document.getElementById('languageToggle');
        const langIcon = document.getElementById('langIcon');

        if (!toggleBtn || !langIcon) {
            console.warn('⚠️ Language toggle button not found');
            return;
        }

        // Update button text based on current language
        function updateToggleButton() {
            const currentLang = window.i18n?.getCurrentLanguage() || 'ar';
            // Show the OTHER language (the one we'll switch TO)
            langIcon.textContent = currentLang === 'ar' ? 'EN' : 'ع';
            console.log(`🔄 Toggle button updated to show: ${langIcon.textContent}`);
        }

        // Toggle language on click
        toggleBtn.addEventListener('click', async function () {
            if (!window.i18n) {
                console.warn('⚠️ i18n not available');
                return;
            }

            const currentLang = window.i18n.getCurrentLanguage();
            const newLang = currentLang === 'ar' ? 'en' : 'ar';

            console.log(`🌐 Toggling language from ${currentLang} to ${newLang}`);

            try {
                await window.i18n.setLanguage(newLang);
                updateToggleButton();
                console.log(`✅ Language toggled to: ${newLang}`);
            } catch (error) {
                console.error('❌ Error toggling language:', error);
            }
        });

        // Listen for language changes from other sources
        document.addEventListener('languageChanged', function (e) {
            console.log('📢 Language changed event received:', e.detail);
            updateToggleButton();
        });

        // Set initial state
        setTimeout(() => {
            updateToggleButton();
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
