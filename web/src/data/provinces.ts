/**
 * Per-governorate figures shown on the map.
 *
 * DATA INTEGRITY — read before adding rows.
 * The previous site carried rates and case stories for all 18 governorates,
 * but 13 of them were tagged "[وهمي]" (fictitious) with "[قصة تجريبية]"
 * (sample story) in the source file, and were still rendered to visitors as
 * findings. A campaign that cites UNICEF and Human Rights Watch cannot
 * publish invented per-governorate rates without undermining the very
 * authority it depends on.
 *
 * So only governorates that have BOTH a `rate` and a `source` are shaded.
 * Every other governorate renders in the explicit "no data" state. Add a row
 * when you have a figure and can say where it came from — not before.
 */

export type ProvinceRecord = {
  /** Rate of marriage under 18, as a percentage. */
  rate: number;
  pattern: { ar: string; en: string };
  /** Where the figure came from. Required — no source, no shading. */
  source: { ar: string; en: string };
  story?: { ar: string; en: string };
};

/** Keyed by the English `name` in `iraq-map.ts`. */
export const PROVINCE_DATA: Record<string, ProvinceRecord> = {
  Maysan: {
    rate: 35.0,
    pattern: { ar: "الأعلى وطنياً", en: "Highest nationally" },
    source: { ar: "بيانات الحملة", en: "Campaign data" },
    story: {
      ar: "وردة (13 سنة) تزوجت بعد وفاة والدتها، وأُجبرت على الحمل المبكر رغم صغر سنها، ما سبب لها مضاعفات صحية.",
      en: "Warda (13) was married after her mother died and pushed into an early pregnancy that left lasting health complications.",
    },
  },
  "Al-Basrah": {
    rate: 31.5,
    pattern: { ar: "عشائري", en: "Tribal" },
    source: { ar: "بيانات الحملة", en: "Campaign data" },
    story: {
      ar: "سارة (12 سنة) أُجبرت على الزواج بسبب ضغوط العائلة والحالة الاقتصادية، واضطرت لترك المدرسة قبل بداية المراهقة.",
      en: "Sara (12) was married under family and economic pressure, and left school before she reached her teens.",
    },
  },
  Karbala: {
    rate: 31.2,
    pattern: { ar: "اجتماعي", en: "Social" },
    source: { ar: "بيانات الحملة", en: "Campaign data" },
    story: {
      ar: "هالة (14 سنة) زُوّجت لتخفيف أعباء العائلة المالية، وأُبعدت عن أصدقاء المدرسة وحياتها الطبيعية.",
      en: "Hala (14) was married to ease her family's financial burden, cut off from school and from the life she knew.",
    },
  },
  Dohuk: {
    rate: 18.3,
    pattern: { ar: "قانوني واجتماعي", en: "Legal and social" },
    source: { ar: "بيانات الحملة", en: "Campaign data" },
    story: {
      ar: "نور (16 سنة) حصلت على إذن قضائي للزواج، لكنها نادمة بسبب فقدان حرية اختيارها والضغوط الاجتماعية المحيطة.",
      en: "Nour (16) married with a judge's authorisation, and regrets a choice she was never really free to make.",
    },
  },
  Kirkuk: {
    rate: 15.9,
    pattern: { ar: "تقاليد", en: "Custom" },
    source: { ar: "بيانات الحملة", en: "Campaign data" },
    story: {
      ar: "سمر (15 سنة) زوّجها والدها لرجل أكبر منها بعقد غير مسجّل، وانتهى الزواج سريعاً لتدخل في صراع قانوني لإثبات حقوقها وحقوق طفلها.",
      en: "Samar (15) was married to a much older man on an unregistered contract. It ended quickly, leaving her fighting to establish her own and her child's rights.",
    },
  },
};

/** Bins for the choropleth. Sequential, single hue, light to dark. */
export const RATE_BINS = [
  { min: 0, max: 15, token: "var(--color-v-200)" },
  { min: 15, max: 22, token: "var(--color-v-400)" },
  { min: 22, max: 30, token: "var(--color-v-600)" },
  { min: 30, max: 100, token: "var(--color-v-800)" },
] as const;

export function binFor(rate: number) {
  return (
    RATE_BINS.find((b) => rate >= b.min && rate < b.max) ??
    RATE_BINS[RATE_BINS.length - 1]
  );
}
