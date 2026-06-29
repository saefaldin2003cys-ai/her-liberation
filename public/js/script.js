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
    window.requestIdleCallback = function (callback) {
        return setTimeout(function () {
            callback({
                didTimeout: false,
                timeRemaining: function () { return 50; }
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
    { id: 5, name: 'كركوك', rate: '15.9%', type: 'تقاليد', story: 'سمر (15 سنة) زوّجها والدها لرجل أكبر منها بعقد غير مسجّل، وانتهى الزواج سريعًا لتدخل في صراع قانوني لإثبات حقوقها وحقوق طفلها.' },
    { id: 6, name: 'الأنبار', rate: '12.4%', type: '[وهمي] عشائري', story: '[قصة تجريبية] آمنة (14 سنة) تركت المدرسة بعد تزويجها لابن عمها، وتحلم بالعودة لإكمال دراستها.' },
    { id: 7, name: 'النجف', rate: '17.1%', type: '[وهمي] اجتماعي', story: '[قصة تجريبية] زهراء (13 سنة) أُجبرت على الزواج لتسديد دين العائلة، وتعاني من العزلة عن صديقاتها.' },
    { id: 8, name: 'بابل', rate: '19.8%', type: '[وهمي] اقتصادي', story: '[قصة تجريبية] رقية (15 سنة) حُرمت من حلمها بأن تصبح طبيبة بعد زواج مبكر فرضته الظروف.' },
    { id: 9, name: 'بغداد', rate: '14.2%', type: '[وهمي] حضري', story: '[قصة تجريبية] مريم (16 سنة) واجهت ضغوطًا أسرية للزواج رغم تفوقها الدراسي.' },
    { id: 10, name: 'القادسية', rate: '20.3%', type: '[وهمي] ريفي', story: '[قصة تجريبية] فاطمة (13 سنة) زُوّجت في قرية نائية بعيدًا عن أي رعاية صحية أو تعليمية.' },
    { id: 11, name: 'المثنى', rate: '22.7%', type: '[وهمي] فقر', story: '[قصة تجريبية] نور (14 سنة) تزوجت مبكرًا بسبب الفقر، وأنجبت قبل أن تكمل نموها الجسدي.' },
    { id: 12, name: 'ذي قار', rate: '24.1%', type: '[وهمي] عشائري', story: '[قصة تجريبية] هدى (12 سنة) فُرض عليها الزواج لإنهاء نزاع عشائري بين عائلتين.' },
    { id: 13, name: 'واسط', rate: '16.6%', type: '[وهمي] اجتماعي', story: '[قصة تجريبية] سجى (15 سنة) منعها زوجها من إكمال دراستها بعد زواج مبكر.' },
    { id: 14, name: 'نينوى', rate: '13.9%', type: '[وهمي] نزوح', story: '[قصة تجريبية] ريم (14 سنة) زُوّجت أثناء النزوح هربًا من ظروف الحرب وفقدان المأوى.' },
    { id: 15, name: 'صلاح الدين', rate: '15.2%', type: '[وهمي] تقاليد', story: '[قصة تجريبية] دعاء (13 سنة) أُخرجت من المدرسة وزُوّجت تحت ضغط التقاليد المحلية.' },
    { id: 16, name: 'ديالى', rate: '18.5%', type: '[وهمي] اجتماعي', story: '[قصة تجريبية] لمى (15 سنة) عانت من مشاكل صحية بسبب الحمل المبكر بعد زواجها.' },
    { id: 17, name: 'أربيل', rate: '9.7%', type: '[وهمي] قانوني', story: '[قصة تجريبية] شيرين (16 سنة) حصلت على إذن زواج مبكر لكنها تأسف لفقدان سنوات شبابها.' },
    { id: 18, name: 'السليمانية', rate: '8.9%', type: '[وهمي] اجتماعي', story: '[قصة تجريبية] أفين (15 سنة) تركت طموحها في الرياضة بعد زواج مبكر غيّر مسار حياتها.' }
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
// Toast Notification Helper (Anti-Vibe-Coding)
// ============================================
function showToast(message, type) {
    type = type || 'info';
    var container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    
    var icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';
    
    toast.innerHTML = '<span>' + icon + '</span><span>' + message + '</span>';
    container.appendChild(toast);
    
    // Auto-remove toast
    setTimeout(function () {
        toast.classList.add('fade-out');
        setTimeout(function () {
            toast.remove();
        }, 300);
    }, 3000);
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

var lastThemeToggleTime = 0;
function toggleTheme() {
    var now = Date.now();
    if (now - lastThemeToggleTime < 50) {
        return;
    }
    lastThemeToggleTime = now;
    var isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
    var icons = document.querySelectorAll('.theme-icon');
    for (var i = 0; i < icons.length; i++) {
        icons[i].textContent = isDark ? '☀️' : '🌙';
    }
}

// ============================================
// Stats Functions (API)
// ============================================
function loadStats() {
    console.log('📊 Loading stats from API...');
    fetch(API_URL + '/stats')
        .then(function (res) {
            if (!res.ok) throw new Error('API Error');
            return res.json();
        })
        .then(function (data) {
            console.log('✅ Stats loaded:', data);
            viewCount = data.views || 0;
            likeCount = data.likes || 0;
            updateStatsDisplay();
        })
        .catch(function (err) {
            console.warn('⚠️ Stats API failed, using fallback:', err);
            // Show fallback values
            viewCount = 247;
            likeCount = 58;
            updateStatsDisplay();
        });
}

function incrementViews() {
    fetch(API_URL + '/stats/view', { method: 'POST' })
        .then(function (res) {
            if (!res.ok) throw new Error('API Error');
            return res.json();
        })
        .then(function (data) {
            if (data && typeof data.views === 'number') {
                viewCount = data.views;
                likeCount = data.likes;
                updateStatsDisplay();
            }
        })
        .catch(function () {
            console.warn('⚠️ Could not increment views');
        });
}

function toggleLike() {
    if (hasLiked) return;
    hasLiked = true;
    localStorage.setItem('hasLiked', 'true');

    fetch(API_URL + '/stats/like', { method: 'POST' })
        .then(function (res) {
            if (!res.ok) throw new Error('API Error');
            return res.json();
        })
        .then(function (data) {
            if (data && typeof data.likes === 'number') {
                likeCount = data.likes;
                updateStatsDisplay();
            }
        })
        .catch(function () {
            likeCount++;
            updateStatsDisplay();
        });

    var likeBtn = document.querySelector('#likeBtn');
    if (likeBtn) {
        likeBtn.classList.add('liked');
        likeBtn.querySelector('.heart-icon').textContent = '❤️';
    }
}

function animateCounter(element, targetValue) {
    if (!element) return;
    var start = 0;
    var duration = 1500; // 1.5 seconds
    var startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var currentValue = Math.floor(progress * targetValue);
        element.textContent = formatNumber(currentValue);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.textContent = formatNumber(targetValue);
        }
    }
    window.requestAnimationFrame(step);
}

function updateStatsDisplay() {
    var viewEl = document.getElementById('viewCount');
    var likeEl = document.getElementById('likeCount');
    var headerLikeEl = document.getElementById('headerLikeCount');

    if (viewEl) animateCounter(viewEl, viewCount);
    if (likeEl) animateCounter(likeEl, likeCount);
    if (headerLikeEl) animateCounter(headerLikeEl, likeCount);
}

function formatNumber(num) {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
}


function getTimeAgo(date) {
    var seconds = Math.floor((Date.now() - date) / 1000);
    if (seconds < 60) return 'الآن';
    if (seconds < 3600) return 'منذ ' + Math.floor(seconds / 60) + ' دقيقة';
    if (seconds < 86400) return 'منذ ' + Math.floor(seconds / 3600) + ' ساعة';
    return 'منذ ' + Math.floor(seconds / 86400) + ' يوم';
}

function escapeHTML(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function decodeEntities(html) {
    if (!html) return '';
    var txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

// Convert URLs in text to clickable links
function linkifyText(text) {
    // Regex to find URLs (http, https)
    var urlPattern = /(https?:\/\/[^\s<]+)/g;
    return text.replace(urlPattern, function (url) {
        // Decode any HTML entities in the URL
        var decodedUrl = url.replace(/&amp;/g, '&').replace(/&#x2F;/g, '/');
        return '<a href="' + decodedUrl + '" target="_blank" rel="noopener noreferrer" class="article-link">' + url + '</a>';
    });
}

function stripMarkdown(text) {
    if (!text) return '';
    return text
        .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
        .replace(/\*(.*?)\*/g, '$1')   // Italic
        .replace(/__(.*?)__/g, '$1')  // Underline
        .replace(/\[IMAGE_\d+\]/g, '') // Image placeholders
        .replace(/\[COVER\]/g, '');    // Cover placeholder
}

// ============================================
// Navigation
// ============================================
function startExperience() {
    console.log('🚀 Starting experience - going to Stats Overlay');
    var startScreen = document.getElementById('startScreen');
    var statsOverlay = document.getElementById('statsOverlay');
    if (startScreen && statsOverlay) {
        startScreen.classList.add('fade-out-screen');
        setTimeout(function() {
            startScreen.classList.add('hidden');
            startScreen.classList.remove('fade-out-screen');
            statsOverlay.classList.remove('hidden');
            statsOverlay.classList.add('fade-in-screen');
            setTimeout(function() {
                statsOverlay.classList.remove('fade-in-screen');
            }, 500);
        }, 500);
    }
}

function goToMainExperience() {
    console.log('🎯 Going to Main Experience');
    var statsOverlay = document.getElementById('statsOverlay');
    var mainExperience = document.getElementById('mainExperience');
    if (statsOverlay && mainExperience) {
        statsOverlay.classList.add('fade-out-screen');
        setTimeout(function() {
            statsOverlay.classList.add('hidden');
            statsOverlay.classList.remove('fade-out-screen');
            mainExperience.classList.remove('hidden');
            mainExperience.classList.add('fade-in-screen');
            setTimeout(function() {
                mainExperience.classList.remove('fade-in-screen');
            }, 500);
            updateRights();
            updateTimeline();
            updateImpacts();
            initMap();
            loadArticles();
            loadStats();
            incrementViews();
        }, 500);
    }
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

        html += '<div class="rights-item-card right-card ' + right.status + '" data-right-key="' + key + '" data-right-age="' + closestAge + '">' +
            '<div class="rights-card-header">' +
            '<span class="rights-card-icon">' + right.icon + '</span>' +
            '<h4 class="rights-card-title">' + title + '</h4>' +
            '</div>' +
            '<span class="rights-card-badge status-' + right.status + '">' + statusLabel + '</span>' +
            '<p class="rights-card-desc">' + description + '</p>' +
            '<button class="rights-card-action-btn details-btn">' + detailsBtn + '</button>' +
            '</div>';
    }
    container.innerHTML = html;
}

function updateActiveTabButton(age) {
    var tabs = document.querySelectorAll('.tab-select-btn');
    if (tabs.length === 3) {
        tabs[0].classList.remove('active');
        tabs[1].classList.remove('active');
        tabs[2].classList.remove('active');
        if (age < 15) {
            tabs[0].classList.add('active');
        } else if (age < 18) {
            tabs[1].classList.add('active');
        } else {
            tabs[2].classList.add('active');
        }
    }
}

function updateTimeline() {
    var items = document.querySelectorAll('.timeline-item, .timeline-node');
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
    updateActiveTabButton(currentAge);
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

        html += '<div class="dashboard-impact-item impact-item ' + impact.type + '">' +
            '<span class="dashboard-impact-icon">' + impact.icon + '</span>' +
            '<span class="dashboard-impact-text">' + text + '</span>' +
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
    navigator.clipboard.writeText(window.location.href).then(function () {
        var btn = document.getElementById('copyLink');
        if (!btn) return;

        var originalText = btn.innerHTML;
        var copiedText = window.i18n ? window.i18n.t('cta.link_copied', 'تم النسخ!') : 'تم النسخ!';

        btn.innerHTML = '<span>✓</span> ' + copiedText;
        setTimeout(function () { btn.innerHTML = originalText; }, 2000);
    });
}

// ============================================
// Admin Password - SECRET ACCESS
// Press Ctrl+Shift+K to open admin login
// ============================================
var ADMIN_PASSWORD = 'TahrirAdmin@2025';
var isAdmin = localStorage.getItem('isAdmin') === 'true';

document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        showAdminLogin();
    }
});

// ============================================
// Articles State
// ============================================
var articles = [];

// ============================================
// Articles Functions (API)
// ============================================
function loadArticles(attempt) {
    attempt = attempt || 0;
    var grid = document.getElementById('articlesGrid');
    if (!grid) {
        // This page has no articles grid (e.g. campaign page). Retry a few
        // times in case of slow DOM, then stop quietly instead of looping forever.
        if (attempt < 4) {
            setTimeout(function () { loadArticles(attempt + 1); }, 500);
        }
        return;
    }

    console.log('📚 Loading articles...');

    fetch(API_URL + '/articles')
        .then(function (res) {
            if (!res.ok) throw new Error('API Error');
            return res.json();
        })
        .then(function (data) {
            console.log('✅ Articles loaded:', data.length);
            articles = data;
            renderArticles();

            // Check for deep link on load
            var path = window.location.pathname;
            if (path.startsWith('/article/')) {
                var slugOrId = path.split('/article/')[1];
                if (slugOrId) {
                    // Clean the slug to remove any domain/article prefix
                    slugOrId = cleanSlug(decodeURIComponent(slugOrId));
                    openArticle(slugOrId, true);
                }
            }
        })
        .catch(function (err) {
            console.warn('⚠️ Articles API failed:', err);
            // Keep any previously loaded articles instead of wiping them
            if (articles.length === 0) {
                renderArticles();
            }
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
    var authorBio = article.authorBio ? (article.authorBio[lang] || article.authorBio.ar) : '';

    // Normalize: decode any pre-escaped entities from DB to avoid double-escaping
    return {
        title: decodeEntities(title),
        author: decodeEntities(author),
        content: decodeEntities(content),
        authorBio: decodeEntities(authorBio)
    };
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
    var excerpt = stripMarkdown(content).substring(0, 100) + '...';
    var readMoreText = lang === 'en' ? 'Read More' : 'قراءة المزيد';

    var imagePosition = article.imagePosition !== undefined ? article.imagePosition : 50;
    var imageHtml = article.image
        ? '<img src="' + escapeHTML(article.image) + '" alt="' + escapeHTML(title) + '" class="article-image" style="object-position: center ' + imagePosition + '%;">'
        : '<div class="article-image-placeholder"><span class="emoji-icon">📰</span></div>';

    var authorHtml = author ? ' • ' + escapeHTML(author) : '';

    return '<article class="article-card">' +
        '<div class="article-image-container">' + imageHtml + '</div>' +
        '<div class="article-body">' +
        '<h4 class="article-title">' + escapeHTML(title) + '</h4>' +
        '<p class="article-date">' + formattedDate + authorHtml + '</p>' +
        '<p class="article-excerpt">' + escapeHTML(excerpt) + '</p>' +
        '<hr class="article-divider">' +
        '<div class="article-actions">' +
        '<button class="read-more-btn" data-article-id="' + article._id + '">' + readMoreText + '</button>' +
        '</div>' +
        '</div>' +
        '</article>';
}

function openArticle(articleId, fromPopState) {
    var article = null;
    // Search by ID or Slug
    for (var i = 0; i < articles.length; i++) {
        if (articles[i]._id === articleId || articles[i].slug === articleId) {
            article = articles[i];
            break;
        }
    }

    if (!article) {
        // Show loading in article page while fetching
        var articlePage = document.getElementById('articlePage');
        var articleViewContent = document.getElementById('articleViewContent');
        if (articlePage && articleViewContent) {
            articlePage.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            articleViewContent.innerHTML = '<div style="text-align: center; padding: 50px;"><div class="loading-spinner"></div><p>جاري التحميل...</p></div>';
        }
        
        // Try fetching specifically if not in list
        fetch(API_URL + '/articles/detail/' + articleId)
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (data && !data.error) {
                    // Temporarily add to list and open
                    articles.push(data);
                    openArticle(data._id, fromPopState);
                } else {
                    if (articleViewContent) {
                        articleViewContent.innerHTML = '<div style="text-align: center; padding: 50px;"><p>❌ المقالة غير موجودة</p></div>';
                    }
                }
            })
            .catch(function() {
                if (articleViewContent) {
                    articleViewContent.innerHTML = '<div style="text-align: center; padding: 50px;"><p>❌ حدث خطأ في التحميل</p></div>';
                }
            });
        return;
    }

    console.log('📖 Opening Article:', article._id);
    var articlePage = document.getElementById('articlePage');
    var articleViewContent = document.getElementById('articleViewContent');
    if (!articlePage || !articleViewContent) return;

    var lang = window.i18n ? window.i18n.getCurrentLanguage() : 'ar';
    
    // Update page direction based on language
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    
    var articleContent = getArticleContent(article);
    var title = articleContent.title;
    var author = articleContent.author;
    var content = articleContent.content;
    var authorBio = articleContent.authorBio;

    var date = new Date(article.timestamp);
    var formattedDate = date.toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-IQ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Translation constants
    var shareText = lang === 'en' ? 'Share' : 'مشاركة';

    var modalImagePosition = article.imagePosition !== undefined ? article.imagePosition : 50;
    var imageHtml = article.image ? '<img src="' + escapeHTML(article.image) + '" alt="" class="article-modal-image" style="object-position: center ' + modalImagePosition + '%;">' : '';

    // Process content with placeholders
    var processedContent = escapeHTML(content).replace(/\n/g, '<br>');

    // Handle Bold Text: **text** -> <strong>text</strong>
    processedContent = processedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Handle Italic Text: *text* -> <em>text</em>
    processedContent = processedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Handle Underline: __text__ -> <u>text</u>
    processedContent = processedContent.replace(/__(.*?)__/g, '<u>$1</u>');
    var usedImages = new Set();
    var mainImagePlaced = false;

    // Handle [COVER] placeholder
    if (processedContent.includes('[COVER]')) {
        if (article.image) {
            processedContent = processedContent.replace('[COVER]', imageHtml);
            mainImagePlaced = true;
        } else {
            processedContent = processedContent.replace('[COVER]', '');
        }
    }

    // Handle [IMAGE_N] placeholders
    if (article.images && article.images.length > 0) {
        for (var k = 0; k < article.images.length; k++) {
            var placeholder = '[IMAGE_' + (k + 1) + ']';
            if (processedContent.includes(placeholder)) {
                var img = article.images[k];
                var caption = img.caption ? (img.caption[lang] || img.caption.ar) : '';
                var alignClass = (img.alignment || 'full') === 'full' ? 'align-full' : ('align-' + img.alignment);
                var inlineImgHtml = '<div class="inline-article-image ' + alignClass + '">' +
                    '<img src="' + escapeHTML(img.url) + '" alt="' + escapeHTML(caption) + '" class="additional-img">' +
                    (caption ? '<p class="img-caption">' + escapeHTML(caption) + '</p>' : '') +
                    '</div>';
                processedContent = processedContent.replace(placeholder, inlineImgHtml);
                usedImages.add(k);
            }
        }
    }

    // Additional Images HTML (for those not placed via placeholders)
    var additionalImagesHtml = '';
    var remainingImages = [];
    if (article.images && article.images.length > 0) {
        for (var j = 0; j < article.images.length; j++) {
            if (!usedImages.has(j)) {
                remainingImages.push(article.images[j]);
            }
        }

        if (remainingImages.length > 0) {
            additionalImagesHtml = '<div class="article-additional-images">';
            for (var m = 0; m < remainingImages.length; m++) {
                var rImg = remainingImages[m];
                var rCaption = rImg.caption ? (rImg.caption[lang] || rImg.caption.ar) : '';
                additionalImagesHtml += '<div class="additional-image-wrapper">' +
                    '<img src="' + escapeHTML(rImg.url) + '" alt="' + escapeHTML(rCaption) + '" class="additional-img">' +
                    (rCaption ? '<p class="img-caption">' + escapeHTML(rCaption) + '</p>' : '') +
                    '</div>';
            }
            additionalImagesHtml += '</div>';
        }
    }

    var authorBioHtml = authorBio ? '<div class="author-bio-section">' +
        '<h4>' + (lang === 'en' ? 'About the Author' : 'عن الكاتبة') + '</h4>' +
        '<p>' + escapeHTML(authorBio) + '</p>' +
        '</div>' : '';

    var authorHtml = author ? '<span>✍️ ' + escapeHTML(author) + '</span>' : '';
    var deleteBtn = isAdmin ? '<button class="article-action-btn danger" data-delete-id="' + article._id + '"><span class="action-icon">🗑️</span><span>حذف</span></button>' : '';

    var breadcrumbHtml = '<div class="article-breadcrumb">' +
        '<span>' + (lang === 'en' ? 'Editorial' : 'قضايا ومقالات') + '</span>' +
        '<span> / </span>' +
        '<span class="breadcrumb-active">' + (lang === 'en' ? 'Deep Dive' : 'نظرة معمقة') + '</span>' +
        '</div>';

    var shareSectionHtml = '<div class="article-end-share">' +
        '<h4 class="share-title">' + (lang === 'en' ? 'Share this story' : 'شارك هذه القصة') + '</h4>' +
        '<div class="share-buttons-row">' +
        '<button class="share-btn-big copy" data-link-id="' + (article.slug || article._id) + '">' +
        '<span class="btn-icon">🔗</span> <span id="copyLinkTextContent">' + (lang === 'en' ? 'Copy Link' : 'نسخ الرابط') + '</span>' +
        '</button>' +
        '</div>' +
        '</div>';

    var titleFontSize = article.titleFontSize || 3.5;

    articleViewContent.innerHTML = '<div class="premium-reader">' +
        breadcrumbHtml +
        '<h1 class="article-page-title" dir="auto" style="font-size: ' + titleFontSize + 'rem;">' + escapeHTML(title) + '</h1>' +
        '<div class="article-modal-meta">' +
        '<div class="author-meta-item">' +
        '<span class="meta-icon">✍️</span>' +
        '<div class="author-details">' +
        '<span class="author-name">' + (author ? escapeHTML(author) : (lang === 'en' ? 'HerLiberation' : 'تحريرها')) + '</span>' +
        '<span class="article-date-inline">' + formattedDate + '</span>' +
        (authorBio ? '<p class="author-bio-inline">' + escapeHTML(authorBio) + '</p>' : '') +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        (!mainImagePlaced ? '<div class="main-modal-image-wrapper">' + imageHtml + '</div>' : '') +
        '<div class="article-modal-body">' + linkifyText(processedContent) + '</div>' +
        additionalImagesHtml +
        shareSectionHtml +
        '<div class="article-modal-footer">' +
        deleteBtn +
        '</div>' +
        '</div>';

    articlePage.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Smooth scroll to top
    articlePage.scrollTop = 0;

    // Update URL if needed
    if (!fromPopState) {
        var slug = article.slug || article._id;
        var cleanedSlug = cleanSlug(slug);
        history.pushState({ articleId: article._id }, '', '/article/' + cleanedSlug);
    }

    loadSuggestedArticles(article._id);
}

// Separate function to render article content (used for language switching)
function renderArticleContent(article) {
    var articleViewContent = document.getElementById('articleViewContent');
    if (!articleViewContent) return;

    var lang = window.i18n ? window.i18n.getCurrentLanguage() : 'ar';
    var articleContent = getArticleContent(article);
    var title = articleContent.title;
    var author = articleContent.author;
    var content = articleContent.content;
    var authorBio = articleContent.authorBio;

    var date = new Date(article.timestamp);
    var formattedDate = date.toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-IQ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    var modalImagePosition = article.imagePosition !== undefined ? article.imagePosition : 50;
    var imageHtml = article.image ? '<img src="' + escapeHTML(article.image) + '" alt="" class="article-modal-image" style="object-position: center ' + modalImagePosition + '%;">' : '';

    var processedContent = '';
    var usedImages = new Set();
    var mainImagePlaced = false;
    var additionalImagesHtml = '';
    var isHtmlContent = /<[a-z][\s\S]*>/i.test(content);

    if (isHtmlContent) {
        if (window.DOMPurify) {
            processedContent = DOMPurify.sanitize(content);
        } else {
            processedContent = content;
        }
    } else {
        processedContent = escapeHTML(content).replace(/\n/g, '<br>');
        processedContent = processedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        processedContent = processedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
        processedContent = processedContent.replace(/__(.*?)__/g, '<u>$1</u>');

        if (processedContent.includes('[COVER]')) {
            if (article.image) {
                processedContent = processedContent.replace('[COVER]', imageHtml);
                mainImagePlaced = true;
            } else {
                processedContent = processedContent.replace('[COVER]', '');
            }
        }

        if (article.images && article.images.length > 0) {
            for (var k = 0; k < article.images.length; k++) {
                var placeholder = '[IMAGE_' + (k + 1) + ']';
                if (processedContent.includes(placeholder)) {
                    var img = article.images[k];
                    var caption = img.caption ? (img.caption[lang] || img.caption.ar) : '';
                    var alignClass = (img.alignment || 'full') === 'full' ? 'align-full' : ('align-' + img.alignment);
                    var inlineImgHtml = '<div class="inline-article-image ' + alignClass + '">' +
                        '<img src="' + escapeHTML(img.url) + '" alt="' + escapeHTML(caption) + '" class="additional-img">' +
                        (caption ? '<p class="img-caption">' + escapeHTML(caption) + '</p>' : '') +
                        '</div>';
                    processedContent = processedContent.replace(placeholder, inlineImgHtml);
                    usedImages.add(k);
                }
            }
        }

        var remainingImages = [];
        if (article.images && article.images.length > 0) {
            for (var j = 0; j < article.images.length; j++) {
                if (!usedImages.has(j)) {
                    remainingImages.push(article.images[j]);
                }
            }
            if (remainingImages.length > 0) {
                additionalImagesHtml = '<div class="article-additional-images">';
                for (var m = 0; m < remainingImages.length; m++) {
                    var rImg = remainingImages[m];
                    var rCaption = rImg.caption ? (rImg.caption[lang] || rImg.caption.ar) : '';
                    additionalImagesHtml += '<div class="additional-image-wrapper">' +
                        '<img src="' + escapeHTML(rImg.url) + '" alt="' + escapeHTML(rCaption) + '" class="additional-img">' +
                        (rCaption ? '<p class="img-caption">' + escapeHTML(rCaption) + '</p>' : '') +
                        '</div>';
                }
                additionalImagesHtml += '</div>';
            }
        }
    }

    var authorBioHtml = authorBio ? '<div class="author-bio-section">' +
        '<h4>' + (lang === 'en' ? 'About the Author' : 'عن الكاتبة') + '</h4>' +
        '<p>' + escapeHTML(authorBio) + '</p>' +
        '</div>' : '';

    var authorHtml = author ? '<span>✍️ ' + escapeHTML(author) + '</span>' : '';
    var deleteBtn = isAdmin ? '<button class="article-action-btn danger" data-delete-id="' + article._id + '"><span class="action-icon">🗑️</span><span>حذف</span></button>' : '';

    var breadcrumbHtml = '<div class="article-breadcrumb">' +
        '<span>' + (lang === 'en' ? 'Editorial' : 'قضايا ومقالات') + '</span>' +
        '<span> / </span>' +
        '<span class="breadcrumb-active">' + (lang === 'en' ? 'Deep Dive' : 'نظرة معمقة') + '</span>' +
        '</div>';

    var shareSectionHtml = '<div class="article-end-share">' +
        '<h4 class="share-title">' + (lang === 'en' ? 'Share this story' : 'شارك هذه القصة') + '</h4>' +
        '<div class="share-buttons-row">' +
        '<button class="share-btn-big copy" data-link-id="' + (article.slug || article._id) + '">' +
        '<span class="btn-icon">🔗</span> <span id="copyLinkTextContent">' + (lang === 'en' ? 'Copy Link' : 'نسخ الرابط') + '</span>' +
        '</button>' +
        '</div>' +
        '</div>';

    var titleFontSize = article.titleFontSize || 3.5;

    articleViewContent.innerHTML = '<div class="premium-reader">' +
        breadcrumbHtml +
        '<h1 class="article-page-title" dir="auto" style="font-size: ' + titleFontSize + 'rem;">' + escapeHTML(title) + '</h1>' +
        '<div class="article-modal-meta">' +
        '<div class="author-meta-item">' +
        '<span class="meta-icon">✍️</span>' +
        '<div class="author-details">' +
        '<span class="author-name">' + (author ? escapeHTML(author) : (lang === 'en' ? 'HerLiberation' : 'تحريرها')) + '</span>' +
        '<span class="article-date-inline">' + formattedDate + '</span>' +
        (authorBio ? '<p class="author-bio-inline">' + escapeHTML(authorBio) + '</p>' : '') +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        (!mainImagePlaced ? '<div class="main-modal-image-wrapper">' + imageHtml + '</div>' : '') +
        '<div class="article-modal-body">' + linkifyText(processedContent) + '</div>' +
        additionalImagesHtml +
        shareSectionHtml +
        '<div class="article-modal-footer">' +
        deleteBtn +
        '</div>' +
        '</div>';
}

function closeArticlePage(fromPopState) {
    var articlePage = document.getElementById('articlePage');
    
    // If we came from a direct link (article-mode), reload to home page
    if (document.body.classList.contains('article-mode')) {
        window.location.href = '/';
        return;
    }
    
    if (articlePage) {
        articlePage.classList.add('hidden');
        document.body.style.overflow = '';
    }
    if (!fromPopState) {
        history.pushState(null, '', '/');
    }
}

function loadSuggestedArticles(currentId) {
    var grid = document.getElementById('suggestedArticlesGrid');
    if (!grid) return;

    grid.innerHTML = '<div class="loading-spinner"></div>';

    fetch(API_URL + '/articles/related/' + currentId)
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (!data || data.length === 0) {
                grid.innerHTML = '';
                return;
            }
            grid.innerHTML = '';
            var lang = window.i18n ? window.i18n.getCurrentLanguage() : 'ar';

            data.forEach(function (article) {
                var content = getArticleContent(article);
                var card = document.createElement('div');
                card.className = 'article-card';
                card.addEventListener('click', function () { openArticle(article._id); });

                var imageHtml = article.image ?
                    '<div class="article-image-container"><img src="' + escapeHTML(article.image) + '" class="article-image" loading="lazy"></div>' :
                    '<div class="article-image-placeholder">📄</div>';

                card.innerHTML = imageHtml +
                    '<div class="article-content-wrapper">' +
                    '<h4 class="article-card-title">' + escapeHTML(content.title) + '</h4>' +
                    '</div>';
                grid.appendChild(card);
            });
        })
        .catch(function () { grid.innerHTML = ''; });
}


function cleanSlug(slugOrId) {
    // Remove domain and /article/ prefix if present
    var cleaned = slugOrId;
    // Remove http:// or https:// and domain
    cleaned = cleaned.replace(/^https?:\/\/[^\/]+\/?/, '');
    // Remove /article/ prefix
    cleaned = cleaned.replace(/^article\//, '');
    return cleaned;
}

function copyArticleLink(slugOrId) {
    var cleanedSlug = cleanSlug(slugOrId);
    var url = window.location.origin + '/article/' + cleanedSlug;
    var tempInput = document.createElement('input');
    tempInput.value = url;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    var textEl = document.getElementById('copyLinkTextContent');
    if (textEl) {
        var lang = window.i18n ? window.i18n.getCurrentLanguage() : 'ar';
        var originalText = textEl.textContent;
        textEl.textContent = lang === 'en' ? 'Copied!' : 'تم النسخ!';
        setTimeout(function () {
            textEl.textContent = originalText;
        }, 2000);
    }
}

function deleteArticle(articleId) {
    if (!isAdmin) return;
    
    var modal = document.getElementById('detailsModal');
    var modalBody = document.getElementById('modalBody');
    if (!modal || !modalBody) return;
    
    var lang = window.i18n ? window.i18n.getCurrentLanguage() : 'ar';
    var confirmTitle = lang === 'en' ? 'Confirm Deletion' : 'تأكيد الحذف';
    var confirmDesc = lang === 'en' ? 'Are you sure you want to delete this article?' : 'هل أنت متأكد من حذف هذا المقال؟';
    var yesText = lang === 'en' ? 'Yes, Delete' : 'نعم، احذف';
    var noText = lang === 'en' ? 'Cancel' : 'إلغاء';
    
    modalBody.innerHTML = '<div class="admin-login-form">' +
        '<h3>⚠️ ' + confirmTitle + '</h3>' +
        '<p>' + confirmDesc + '</p>' +
        '<div style="display: flex; gap: 10px; margin-top: 20px; justify-content: center; width: 100%;">' +
        '<button class="submit-btn danger admin-delete-confirm-btn" data-article-id="' + articleId + '" style="background:#ef4444; width: calc(50% - 5px);">' + yesText + '</button>' +
        '<button class="cancel-btn admin-cancel-btn" style="width: calc(50% - 5px);">' + noText + '</button>' +
        '</div>' +
        '</div>';
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
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
            '<button class="submit-btn admin-write-btn">✍️ كتابة مقال جديد</button>' +
            '<button class="cancel-btn admin-logout-btn">🚪 تسجيل الخروج</button>' +
            '</div>';
    } else {
        modalBody.innerHTML = '<div class="admin-login-form">' +
            '<h3>🔐 دخول لوحة الإدارة</h3>' +
            '<input type="password" id="adminPassword" placeholder="كلمة المرور" class="input-field">' +
            '<button class="submit-btn admin-login-submit">دخول</button>' +
            '<button class="cancel-btn admin-cancel-btn">إلغاء</button>' +
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
        showToast('تم تسجيل الدخول بنجاح! ✅', 'success');
        toggleAdminPanel();
    } else {
        showToast('كلمة المرور غير صحيحة! ❌', 'error');
    }
}

function logoutAdmin() {
    isAdmin = false;
    localStorage.removeItem('isAdmin');
    closeModal();
    showToast('تم تسجيل الخروج! 👋', 'info');
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
        .then(function (res) {
            if (!res.ok) throw new Error('API Error');
            return res.json();
        })
        .then(function () {
            loadArticles();
            document.getElementById('articleTitle').value = '';
            document.getElementById('articleAuthor').value = '';
            document.getElementById('articleContent').value = '';
            document.getElementById('articleImage').value = '';
            var adminPanel = document.getElementById('adminPanel');
            if (adminPanel) adminPanel.classList.add('hidden');
            showToast('تم نشر المقال بنجاح! ✅', 'success');
        })
        .catch(function (err) {
            console.error(err);
            showToast('فشل نشر المقال ❌', 'error');
        });
}

// ============================================
// Global Functions
// ============================================
window.openArticle = openArticle;
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
        html += '<button class="province-btn" data-province-id="' + prov.id + '">' + name + '</button>';
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
    if (provinceRateEl) provinceRateEl.textContent = rate;
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
    var revealElements = document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right');

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
// Scroll Progress & Scroll to Top Helpers
// ============================================
function updateScrollProgress() {
    var winScroll, height;
    var articlePage = document.getElementById('articlePage');
    
    if (articlePage && !articlePage.classList.contains('hidden')) {
        winScroll = articlePage.scrollTop;
        height = articlePage.scrollHeight - articlePage.clientHeight;
    } else {
        winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    }
    
    var scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    var progress = document.getElementById('scrollProgress');
    if (progress) {
        progress.style.width = scrolled + '%';
    }
}

function checkScrollToTop() {
    var btn = document.getElementById('scrollToTop');
    if (!btn) return;
    
    var winScroll;
    var articlePage = document.getElementById('articlePage');
    if (articlePage && !articlePage.classList.contains('hidden')) {
        winScroll = articlePage.scrollTop;
    } else {
        winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    }
    
    if (winScroll > 400) {
        btn.classList.add('show');
    } else {
        btn.classList.remove('show');
    }
}

// ============================================
// Typewriter Effect
// ============================================
var typewriterTimeoutId = null;
function startTypewriter() {
    var descEl = document.querySelector('.hero-description');
    if (!descEl) return;
    
    if (typewriterTimeoutId) {
        clearTimeout(typewriterTimeoutId);
    }
    
    var key = 'hero.description';
    var defaultText = "اكتشف كيف يحدد القانون حقوق الطفل بين 9 و18 سنة وكيف يمكن للزواج المبكر أن يسلبه هذه الحقوق";
    var text = window.i18n ? window.i18n.t(key, defaultText) : defaultText;
    
    descEl.innerHTML = '';
    descEl.classList.add('typewriter');
    
    var i = 0;
    var speed = 30; // ms
    
    function type() {
        if (i < text.length) {
            if (text.substr(i, 4) === '<br>') {
                descEl.innerHTML += '<br>';
                i += 4;
            } else if (text[i] === '\n') {
                descEl.innerHTML += '<br>';
                i++;
            } else {
                descEl.innerHTML += text[i];
                i++;
            }
            typewriterTimeoutId = setTimeout(type, speed);
        } else {
            descEl.classList.remove('typewriter');
            typewriterTimeoutId = null;
        }
    }
    type();
}

function loadDeferredContent() {
    initScrollReveal();
    if (typeof initCountersObserver === 'function') {
        initCountersObserver();
    }
}

// ============================================
// Initialize - Optimized for fast loading
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 DOM Content Loaded - Initializing...');

    // Check if this is a direct article link - hide main content immediately
    var path = window.location.pathname;
    if (path.startsWith('/article/')) {
        document.body.classList.add('article-mode');
        var articlePage = document.getElementById('articlePage');
        if (articlePage) {
            articlePage.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

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
    // Skip if nav.js already bound the theme toggle (it owns theme on all pages)
    var themeToggle = document.getElementById('themeToggle');
    if (themeToggle && themeToggle.getAttribute('data-nav-bound') !== 'true') {
        themeToggle.addEventListener('click', toggleTheme);
        themeToggle.addEventListener('touchend', function (e) {
            e.preventDefault();
            toggleTheme();
        });
    }
    // Header theme toggle - with iOS touch support
    var headerThemeToggle = document.getElementById('headerThemeToggle');
    if (headerThemeToggle) {
        headerThemeToggle.addEventListener('click', toggleTheme);
        headerThemeToggle.addEventListener('touchend', function (e) {
            e.preventDefault();
            toggleTheme();
        });
    }

    // Start button - with iOS touch support
    var startBtnInit = document.getElementById('startBtn');
    if (startBtnInit) {
        startBtnInit.addEventListener('click', startExperience);
        startBtnInit.addEventListener('touchend', function (e) {
            e.preventDefault();
            startExperience();
        });
    }

    function updateSliderTrack(val, min, max) {
        min = min || 9;
        max = max || 18;
        var percent = ((val - min) / (max - min)) * 100;
        var currentLang = window.i18n && window.i18n.getCurrentLanguage ? window.i18n.getCurrentLanguage() : 'ar';
        var isRTL = currentLang === 'ar';
        var dir = isRTL ? 'to left' : 'to right';
        var slider = document.getElementById('ageSlider');
        if (slider) {
            slider.style.background = 'linear-gradient(' + dir + ', var(--accent-primary) 0%, var(--accent-secondary) ' + percent + '%, var(--bg-secondary) ' + percent + '%, var(--bg-secondary) 100%)';
        }
    }

    var ageSlider = document.getElementById('ageSlider');
    if (ageSlider) {
        updateSliderTrack(ageSlider.value, ageSlider.min, ageSlider.max);
        
        ageSlider.addEventListener('input', function (e) {
            currentAge = parseInt(e.target.value);
            var ageNumberEl = document.getElementById('ageNumber');
            if (ageNumberEl) ageNumberEl.textContent = currentAge;
            var ageValueEl = document.getElementById('ageValue');
            if (ageValueEl) ageValueEl.textContent = currentAge;
            updateRights();
            updateTimeline();
            updateImpacts();
            updateSliderTrack(currentAge, e.target.min, e.target.max);
        });

        document.addEventListener('languageChanged', function () {
            updateSliderTrack(ageSlider.value, ageSlider.min, ageSlider.max);
        });
    }

    var likeBtn = document.getElementById('likeBtn');
    if (likeBtn) likeBtn.addEventListener('click', toggleLike);

    // ============================================
    // Event Delegation (Anti-Vibe-Coding)
    // ============================================
    
    // 1. Rights Cards click event delegation
    var rightsContainer = document.getElementById('rightsContainer');
    if (rightsContainer) {
        rightsContainer.addEventListener('click', function (e) {
            var card = e.target.closest('.right-card');
            if (card) {
                var key = card.dataset.rightKey;
                var age = parseInt(card.dataset.rightAge);
                if (key && !isNaN(age)) {
                    showDetails(key, age);
                }
            }
        });
    }

    // 2. Provinces Map click event delegation
    var provincesGrid = document.getElementById('provincesGrid');
    if (provincesGrid) {
        provincesGrid.addEventListener('click', function (e) {
            var btn = e.target.closest('.province-btn');
            if (btn) {
                var provinceId = parseInt(btn.dataset.provinceId);
                if (!isNaN(provinceId)) {
                    selectProvince(provinceId);
                }
            }
        });
    }

    // 3. Articles Grid read-more click event delegation
    var articlesGrid = document.getElementById('articlesGrid');
    if (articlesGrid) {
        articlesGrid.addEventListener('click', function (e) {
            var btn = e.target.closest('.read-more-btn');
            if (btn) {
                var articleId = btn.dataset.articleId;
                if (articleId) {
                    openArticle(articleId);
                }
            }
        });
    }

    // 4. Article Page (View Content) delete/copy click event delegation
    var articleViewContent = document.getElementById('articleViewContent');
    if (articleViewContent) {
        articleViewContent.addEventListener('click', function (e) {
            var deleteBtn = e.target.closest('[data-delete-id]');
            if (deleteBtn) {
                var articleId = deleteBtn.dataset.deleteId;
                if (articleId) deleteArticle(articleId);
                return;
            }
            var copyBtn = e.target.closest('[data-link-id]');
            if (copyBtn) {
                var linkId = copyBtn.dataset.linkId;
                if (linkId) copyArticleLink(linkId);
                return;
            }
        });
    }

    // 5. Poll Options click event delegation
    var pollOptions = document.getElementById('pollOptions');
    if (pollOptions) {
        pollOptions.addEventListener('click', function (e) {
            var btn = e.target.closest('.poll-option');
            if (btn && !btn.disabled) {
                var voteChoice = btn.dataset.vote;
                if (voteChoice) {
                    submitPollVote(voteChoice);
                }
            }
        });
    }

    // 6. Call to Action Social Share click bindings
    var ctaShareTwitter = document.getElementById('ctaShareTwitter');
    if (ctaShareTwitter) {
        ctaShareTwitter.addEventListener('click', shareTwitter);
    }
    var copyLinkBtn = document.getElementById('copyLink');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', copyLink);
    }

    // 7. Details Modal overlay/close/admin clicks delegation
    var detailsModal = document.getElementById('detailsModal');
    var modalBody = document.getElementById('modalBody');
    if (detailsModal && modalBody) {
        modalBody.addEventListener('click', function (e) {
            if (e.target.classList.contains('admin-write-btn')) {
                toggleAdminPanel();
            } else if (e.target.classList.contains('admin-logout-btn')) {
                logoutAdmin();
            } else if (e.target.classList.contains('admin-login-submit')) {
                loginAdmin();
            } else if (e.target.classList.contains('admin-cancel-btn')) {
                closeModal();
            } else if (e.target.classList.contains('modal-share-twitter')) {
                shareTwitter();
            } else if (e.target.classList.contains('modal-share-copy')) {
                copyLink();
            } else if (e.target.classList.contains('admin-delete-confirm-btn')) {
                var articleId = e.target.dataset.articleId;
                if (articleId) {
                    var lang = window.i18n ? window.i18n.getCurrentLanguage() : 'ar';
                    fetch(API_URL + '/articles/' + articleId, { method: 'DELETE' })
                        .then(function (res) {
                            if (!res.ok) throw new Error('API Error');
                            closeModal();
                            loadArticles();
                            showToast(lang === 'en' ? 'Article deleted successfully! ✅' : 'تم حذف المقال بنجاح! ✅', 'success');
                        })
                        .catch(function (err) {
                            console.error(err);
                            showToast(lang === 'en' ? 'Failed to delete article ❌' : 'فشل حذف المقال ❌', 'error');
                        });
                }
            }
        });
        
        var modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', closeModal);
        }
        var modalClose = document.getElementById('modalClose');
        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }
    }

    var shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function () {
            var modal = document.getElementById('detailsModal');
            var modalBody = document.getElementById('modalBody');
            if (modal && modalBody) {
                modalBody.innerHTML = '<h3 class="modal-title">📤 شارك الموقع</h3>' +
                    '<div class="share-buttons">' +
                    '<button class="share-btn twitter modal-share-twitter">𝕏 تويتر</button>' +
                    '<button class="share-btn copy modal-share-copy" id="copyLink">📋 نسخ الرابط</button>' +
                    '</div>';
                modal.classList.add('show');
            }
        });
    }

    var modalClose = document.getElementById('modalClose');
    if (modalClose) modalClose.addEventListener('click', closeModal);

    var detailsModal = document.getElementById('detailsModal');
    if (detailsModal) {
        detailsModal.addEventListener('click', function (e) {
            // Close when clicking outside the modal content (on overlay or modal background)
            if (e.target.id === 'detailsModal' || e.target.classList.contains('modal-overlay')) {
                closeModal();
            }
        });
    }


    var cancelAdmin = document.getElementById('cancelAdmin');
    if (cancelAdmin) {
        cancelAdmin.addEventListener('click', function () {
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
        statsBtn.addEventListener('touchend', function (e) {
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
        var langIcon = toggleBtn ? toggleBtn.querySelector('.lang-icon') : null;
        var headerToggleBtn = document.getElementById('headerLangToggle');

        // Update all button texts based on current language
        function updateToggleButtons() {
            var currentLang = window.i18n && window.i18n.getCurrentLanguage ? window.i18n.getCurrentLanguage() : 'ar';
            // Show the OTHER language (the one we'll switch TO)
            var newText = currentLang === 'ar' ? 'EN' : 'ع';

            // Update the main toggle button text
            if (langIcon) langIcon.textContent = newText;
            // Also update if it's in the nav (multi-page)
            if (toggleBtn) {
                var navLangIcon = toggleBtn.querySelector('.lang-icon');
                if (navLangIcon && navLangIcon !== langIcon) navLangIcon.textContent = newText;
            }
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

            window.i18n.setLanguage(newLang).then(function () {
                updateToggleButtons();
                console.log('✅ Language toggled to: ' + newLang);
            }).catch(function (error) {
                console.error('❌ Error toggling language:', error);
            });
        }

        // Add click listeners to both buttons - with iOS touch support
        // Skip #languageToggle if nav.js already bound it
        if (toggleBtn && toggleBtn.getAttribute('data-nav-bound') !== 'true') {
            toggleBtn.addEventListener('click', handleLanguageToggle);
            toggleBtn.addEventListener('touchend', function (e) {
                e.preventDefault();
                handleLanguageToggle();
            });
        }
        if (headerToggleBtn) {
            headerToggleBtn.addEventListener('click', handleLanguageToggle);
            headerToggleBtn.addEventListener('touchend', function (e) {
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
        setTimeout(function () {
            updateToggleButtons();
            console.log('✅ Language toggle initialized');
        }, 100);
    }

    // Initialize language toggle
    setupLanguageToggle();

    // ============================================
    // Load Articles & Stats on page load
    // ============================================
    loadArticles();
    loadStats();
    incrementViews();

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
        
        // Re-type description on language toggle
        if (typeof startTypewriter === 'function') {
            startTypewriter();
        }

        console.log('✅ All dynamic content updated');
    });

    // ============================================
    // Poll Functions
    // ============================================

    // Check if user already voted (from localStorage)
    var hasVoted = localStorage.getItem('poll_voted') === 'true';

    // Load poll on page load - disabled for local database-free mode
    // loadPoll();

    function loadPoll() {
        var pollForm = document.getElementById('pollForm');
        var pollResults = document.getElementById('pollResults');

        if (!pollForm || !pollResults) return;

        // If already voted, show results directly
        if (hasVoted) {
            pollForm.classList.add('hidden');
            pollResults.classList.remove('hidden');
            // Fetch and display current results
            fetch(API_URL + '/poll')
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    updatePollResults(data);
                })
                .catch(function (err) {
                    console.warn('Poll load error:', err);
                });
        }
    }

    // Make submitPollVote globally accessible
    window.submitPollVote = function (choice) {
        var pollForm = document.getElementById('pollForm');
        var pollResults = document.getElementById('pollResults');

        if (!pollForm || !pollResults) return;

        // Disable buttons to prevent double-click
        var buttons = pollForm.querySelectorAll('.poll-option');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].disabled = true;
            buttons[i].style.opacity = '0.5';
        }

        fetch(API_URL + '/poll/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ choice: choice })
        })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                // Mark as voted
                localStorage.setItem('poll_voted', 'true');
                hasVoted = true;

                // Show results
                pollForm.classList.add('hidden');
                pollResults.classList.remove('hidden');

                // Update the bars with animation
                updatePollResults(data);
            })
            .catch(function (err) {
                console.error('Vote error:', err);
                // Re-enable buttons on error
                for (var i = 0; i < buttons.length; i++) {
                    buttons[i].disabled = false;
                    buttons[i].style.opacity = '1';
                }
            });
    };

    function updatePollResults(data) {
        var total = data.total || 1; // Prevent division by zero

        var agreePercent = Math.round((data.agree18 / total) * 100);
        var disagreePercent = Math.round((data.disagree / total) * 100);

        // Update percentages
        var agreePercentEl = document.getElementById('agreePercent');
        var disagreePercentEl = document.getElementById('disagreePercent');

        if (agreePercentEl) agreePercentEl.textContent = agreePercent + '%';
        if (disagreePercentEl) disagreePercentEl.textContent = disagreePercent + '%';

        // Update vote counts
        var agreeCountEl = document.getElementById('agreeCount');
        var disagreeCountEl = document.getElementById('disagreeCount');

        if (agreeCountEl) agreeCountEl.textContent = data.agree18 || 0;
        if (disagreeCountEl) disagreeCountEl.textContent = data.disagree || 0;

        // Animate bars with slight delay
        setTimeout(function () {
            var agreeBar = document.getElementById('agreeBar');
            var disagreeBar = document.getElementById('disagreeBar');

            if (agreeBar) agreeBar.style.width = agreePercent + '%';
            if (disagreeBar) disagreeBar.style.width = disagreePercent + '%';
        }, 100);
    }

    // ============================================
    // Scroll Progress & Back to Top Event Listeners
    // ============================================
    window.addEventListener('scroll', function () {
        updateScrollProgress();
        checkScrollToTop();
    });

    var articlePageScroll = document.getElementById('articlePage');
    if (articlePageScroll) {
        articlePageScroll.addEventListener('scroll', function () {
            updateScrollProgress();
            checkScrollToTop();
        });
    }

    var scrollToTopBtn = document.getElementById('scrollToTop');
    if (scrollToTopBtn) {
        var handleScrollToTop = function (e) {
            e.preventDefault();
            var articlePage = document.getElementById('articlePage');
            if (articlePage && !articlePage.classList.contains('hidden')) {
                articlePage.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
        scrollToTopBtn.addEventListener('click', handleScrollToTop);
        scrollToTopBtn.addEventListener('touchend', handleScrollToTop);
    }

    // ============================================
    // Independent Article Routing
    // ============================================
    var backBtn = document.getElementById('articleBack');
    if (backBtn) {
        backBtn.addEventListener('click', function () { closeArticlePage(); });
        backBtn.addEventListener('touchend', function (e) {
            e.preventDefault();
            closeArticlePage();
        });
    }

    // Article language toggle
    var articleLangToggle = document.getElementById('articleLangToggle');
    if (articleLangToggle) {
        var handleArticleLangToggle = function () {
            if (window.i18n) {
                var currentLang = window.i18n.getCurrentLanguage();
                var newLang = currentLang === 'ar' ? 'en' : 'ar';
                
                // Update icon first
                var icon = document.getElementById('articleLangIcon');
                if (icon) icon.textContent = newLang === 'ar' ? 'EN' : 'ع';
                
                // Set language and wait for it to complete
                window.i18n.setLanguage(newLang).then(function() {
                    // The direction is already updated by i18n.updateHTMLAttributes()
                    // Now reload article content with new language
                    var currentPath = window.location.pathname;
                    if (currentPath.startsWith('/article/')) {
                        var slugOrId = currentPath.split('/article/')[1];
                        if (slugOrId) {
                            slugOrId = cleanSlug(decodeURIComponent(slugOrId));
                            // Find and re-render article
                            for (var i = 0; i < articles.length; i++) {
                                if (articles[i]._id === slugOrId || articles[i].slug === slugOrId) {
                                    renderArticleContent(articles[i]);
                                    break;
                                }
                            }
                        }
                    }
                });
            }
        };
        articleLangToggle.addEventListener('click', handleArticleLangToggle);
        articleLangToggle.addEventListener('touchend', function (e) {
            e.preventDefault();
            handleArticleLangToggle();
        });
    }

    // ============================================
    // Testimonials Carousel Logic
    // ============================================
    var activeTestimonialIndex = 1;
    var totalTestimonials = 2;

    window.nextTestimonial = function() {
        var currentSlide = document.getElementById('slide-' + activeTestimonialIndex);
        if (currentSlide) currentSlide.classList.add('hidden');
        
        activeTestimonialIndex++;
        if (activeTestimonialIndex > totalTestimonials) {
            activeTestimonialIndex = 1;
        }
        
        var nextSlide = document.getElementById('slide-' + activeTestimonialIndex);
        if (nextSlide) nextSlide.classList.remove('hidden');
    };

    window.prevTestimonial = function() {
        var currentSlide = document.getElementById('slide-' + activeTestimonialIndex);
        if (currentSlide) currentSlide.classList.add('hidden');
        
        activeTestimonialIndex--;
        if (activeTestimonialIndex < 1) {
            activeTestimonialIndex = totalTestimonials;
        }
        
        var prevSlide = document.getElementById('slide-' + activeTestimonialIndex);
        if (prevSlide) prevSlide.classList.remove('hidden');
    };

    // ============================================
    // Intersection Observer for Metrics Counter Cards
    // ============================================
    function animateNumber(el, start, end, suffix) {
        var duration = 1200;
        var startTime = null;
        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var val = Math.floor(progress * (end - start) + start);
            el.textContent = val + suffix;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                el.textContent = end + suffix;
            }
        }
        window.requestAnimationFrame(step);
    }

    function initCountersObserver() {
        var cards = document.querySelectorAll('.metric-card');
        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        var numEl = entry.target.querySelector('.metric-number-wrapper');
                        if (numEl && !numEl.dataset.animated) {
                            numEl.dataset.animated = 'true';
                            var text = numEl.textContent;
                            if (text.indexOf('%') !== -1) {
                                animateNumber(numEl, 0, parseInt(text), '%');
                            } else if (text.indexOf('/') !== -1) {
                                // Fractions
                            } else {
                                animateNumber(numEl, 0, parseInt(text), '');
                            }
                        }
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            cards.forEach(function(card) { observer.observe(card); });
        }
    }

    // ============================================
    // Dynamic Content Refresh (i18n Support)
    // ============================================
    window.updateAllDynamicContent = function() {
        console.log('Refreshing all dynamic translations');
        updateRights();
        updateTimeline();
        updateImpacts();
        initMap();
        if (activeProvinceId !== null) {
            selectProvince(activeProvinceId);
        }
        // Force refresh articles grid text
        renderArticles();

        // If an article is currently open, re-render it in the new language
        var articlePage = document.getElementById('articlePage');
        if (articlePage && !articlePage.classList.contains('hidden')) {
            // Find the currently displayed article by checking history state
            var state = window.history.state;
            if (state && state.articleId) {
                var article = null;
                for (var i = 0; i < articles.length; i++) {
                    if (articles[i]._id === state.articleId || articles[i].slug === state.articleId) {
                        article = articles[i];
                        break;
                    }
                }
                if (article && typeof renderArticleContent === 'function') {
                    renderArticleContent(article);
                }
            }
        }
    };

    window.addEventListener('popstate', function (event) {
        if (event.state && event.state.articleId) {
            openArticle(event.state.articleId, true);
        } else {
            closeArticlePage(true);
        }
    });

    // ============================================
    // Loading Screen Fadeout & Typewriter Trigger
    // ============================================
    function triggerLoaderFadeOut() {
        setTimeout(function () {
            var loader = document.getElementById('loadingScreen');
            if (loader) {
                loader.classList.add('fade-out');
                setTimeout(function () {
                    loader.classList.add('hidden');
                    startTypewriter();
                }, 500);
            } else {
                startTypewriter();
            }
        }, 800);
    }

    if (document.readyState === 'complete') {
        triggerLoaderFadeOut();
    } else {
        window.addEventListener('load', triggerLoaderFadeOut);
    }
});

// ============================================
// Reveal Entrance Enhancer (Premium Section Redesign)
// Progressive enhancement: fades in `.reveal-on-scroll` elements as they
// enter the viewport. Honors prefers-reduced-motion and degrades gracefully
// when IntersectionObserver is unavailable by revealing all targets at once.
// ============================================
(function () {
  var targets = document.querySelectorAll('.reveal-on-scroll');
  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced || !('IntersectionObserver' in window)) {
    for (var i = 0; i < targets.length; i++) targets[i].classList.add('is-revealed');
    return; // show everything immediately
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  for (var j = 0; j < targets.length; j++) io.observe(targets[j]);
})();
