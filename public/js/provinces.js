/**
 * Per-governorate figures for the map.
 *
 * IMPORTANT — data integrity
 * The previous dataset carried rates and case stories for all 18 governorates,
 * but 13 of them were tagged "[وهمي]" (fictitious) with "[قصة تجريبية]"
 * (sample story) in the source file, and were rendered to visitors as though
 * they were findings. A campaign whose authority rests on citing UNICEF and
 * Human Rights Watch cannot publish invented per-governorate rates.
 *
 * So: only governorates with a `rate` AND a `source` are shaded on the map.
 * Everything else renders in the explicit "no data" state. To publish a
 * governorate, add its rate and the source it came from — nothing appears on
 * the map until both are present.
 *
 * ES5 compatible — vanilla JS only.
 */
window.PROVINCE_DATA = {
    /* Keyed by the English shapeName used in iraq-map-data.js */

    'Maysan': {
        rate: 35.0,
        pattern: { ar: 'الأعلى وطنياً', en: 'Highest nationally' },
        source: { ar: 'بيانات الحملة', en: 'Campaign data' },
        story: {
            ar: 'وردة (13 سنة) تزوجت بعد وفاة والدتها، وأُجبرت على الحمل المبكر رغم صغر سنها، ما سبب لها مضاعفات صحية.',
            en: 'Warda (13) was married after her mother died and pushed into an early pregnancy that left her with lasting health complications.'
        }
    },
    'Al-Basrah': {
        rate: 31.5,
        pattern: { ar: 'عشائري', en: 'Tribal' },
        source: { ar: 'بيانات الحملة', en: 'Campaign data' },
        story: {
            ar: 'سارة (12 سنة) أُجبرت على الزواج بسبب ضغوط العائلة والحالة الاقتصادية، واضطرت لترك المدرسة قبل بداية المراهقة.',
            en: 'Sara (12) was married under family and economic pressure, and left school before she reached her teens.'
        }
    },
    'Karbala': {
        rate: 31.2,
        pattern: { ar: 'اجتماعي', en: 'Social' },
        source: { ar: 'بيانات الحملة', en: 'Campaign data' },
        story: {
            ar: 'هالة (14 سنة) زُوّجت لتخفيف أعباء العائلة المالية، وأُبعدت عن أصدقاء المدرسة وحياتها الطبيعية.',
            en: 'Hala (14) was married to ease her family’s financial burden, cut off from school and from the life she knew.'
        }
    },
    'Dohuk': {
        rate: 18.3,
        pattern: { ar: 'قانوني واجتماعي', en: 'Legal and social' },
        source: { ar: 'بيانات الحملة', en: 'Campaign data' },
        story: {
            ar: 'نور (16 سنة) حصلت على إذن قضائي للزواج، لكنها نادمة بسبب فقدان حرية اختيارها والضغوط الاجتماعية المحيطة.',
            en: 'Nour (16) married with a judge’s authorisation, and regrets the choice she was never really free to make.'
        }
    },
    'Kirkuk': {
        rate: 15.9,
        pattern: { ar: 'تقاليد', en: 'Custom' },
        source: { ar: 'بيانات الحملة', en: 'Campaign data' },
        story: {
            ar: 'سمر (15 سنة) زوّجها والدها لرجل أكبر منها بعقد غير مسجّل، وانتهى الزواج سريعاً لتدخل في صراع قانوني لإثبات حقوقها وحقوق طفلها.',
            en: 'Samar (15) was married to a much older man on an unregistered contract. It ended quickly, leaving her fighting to establish her own and her child’s rights.'
        }
    }

    /* Governorates below are deliberately absent until sourced figures exist:
       Al-Anbar, An-Najaf, Babil, Baghdad, Al-Qadisiyah, Al-Muthanna, Dhi Qar,
       Wasit, Ninawa, Salah al-Din, Diyala, Erbil, Al-Sulaimaniyah.
       They render as "no data" rather than as invented numbers. */
};
