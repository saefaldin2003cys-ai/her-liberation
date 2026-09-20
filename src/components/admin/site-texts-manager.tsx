"use client";

import { useState, useEffect } from "react";
import { Icon, type IconName } from "@/components/icon";

type FieldDef = {
  key: string;
  label: string;
  hint?: string;
  multiline?: boolean;
};

type PageSectionDef = {
  title: string;
  description?: string;
  fields: FieldDef[];
};

type PageTabDef = {
  id: string;
  title: string;
  icon: IconName;
  description: string;
  sections: PageSectionDef[];
};

const PAGE_TABS: PageTabDef[] = [
  {
    id: "home",
    title: "الصفحة الرئيسية",
    icon: "home",
    description: "تعديل جميع نصوص وأقسام الصفحة الرئيسية للمنصة.",
    sections: [
      {
        title: "قسم الواجهة الترحيبية (Hero)",
        description: "أول ما يراه الزائر في أعلى الصفحة الرئيسية.",
        fields: [
          { key: "home_hero.tagline", label: "الشعار الصغير (Tagline / Eyebrow)", hint: "يظهر فوق العنوان الرئيسي" },
          { key: "home_hero.title", label: "العنوان الرئيسي (Main Title)", multiline: true },
          { key: "home_hero.description", label: "الفقرة التمهيدية والوصف", multiline: true },
          { key: "home_hero.cta_primary", label: "نص الزر الأول (زر الحملات)" },
          { key: "home_hero.cta_secondary", label: "نص الزر الثاني (زر من نحن)" },
        ],
      },
      {
        title: "قسم رسالتنا وأهدافنا (Mission & Objectives)",
        description: "الركائز الأساسية لعمل المنصة وأهدافها التنموية.",
        fields: [
          { key: "mission.subtitle", label: "الشعار الصغير للقسم" },
          { key: "mission.title", label: "عنوان قسم الرسالة" },
          { key: "mission.description", label: "وصف رسالتنا التمهيدي", multiline: true },
          { key: "mission.point1_title", label: "عنوان الركيزة 1 (التوعية القانونية)" },
          { key: "mission.point1_desc", label: "وصف الركيزة 1", multiline: true },
          { key: "mission.point2_title", label: "عنوان الركيزة 2 (قصص واقعية)" },
          { key: "mission.point2_desc", label: "وصف الركيزة 2", multiline: true },
          { key: "mission.point3_title", label: "عنوان الركيزة 3 (الاستفتاء والمناصرة)" },
          { key: "mission.point3_desc", label: "وصف الركيزة 3", multiline: true },
        ],
      },
      {
        title: "قسم كيف نعمل والنهج (Approach)",
        description: "البطاقات الثلاث التعريفية بطرق عمل المنصة.",
        fields: [
          { key: "about_page.approach_subtitle", label: "الشعار الصغير" },
          { key: "about_page.approach_title", label: "عنوان القسم الرئيسي" },
          { key: "about_page.card1_title", label: "عنوان البطاقة 1" },
          { key: "about_page.card1_desc", label: "وصف البطاقة 1", multiline: true },
          { key: "about_page.card2_title", label: "عنوان البطاقة 2" },
          { key: "about_page.card2_desc", label: "وصف البطاقة 2", multiline: true },
          { key: "about_page.card3_title", label: "عنوان البطاقة 3" },
          { key: "about_page.card3_desc", label: "وصف البطاقة 3", multiline: true },
        ],
      },
      {
        title: "قسم الواقع والأرقام (Figures)",
        description: "العناوين والشروحات المرافقة للإحصائيات.",
        fields: [
          { key: "home_figures.title", label: "عنوان قسم الواقع" },
          { key: "home_figures.lead", label: "وصف الواقع والزواج خارج المحكمة", multiline: true },
        ],
      },
      {
        title: "قسم شهادة الناجية (Testimony)",
        description: "القصة والاقتباس المؤثر من واقع المحافظات.",
        fields: [
          { key: "testimonials.quote1", label: "نص الشهادة / الاقتباس", multiline: true },
          { key: "testimonials.author1_name", label: "اسم صاحبة الشهادة" },
          { key: "testimonials.author1_title", label: "صفة / سن ومحافظة صاحبة الشهادة" },
        ],
      },
      {
        title: "قسم ما يقوله القانون (Law Section)",
        description: "شرح المادة الثامنة ومفارقات الأهلية القانونية.",
        fields: [
          { key: "home_law.title", label: "عنوان القسم القانوني" },
          { key: "home_law.p1", label: "الفقرة الأولى (سن الزواج والاستثناء)", multiline: true },
          { key: "home_law.p2", label: "الفقرة الثانية (مفارقة الأهلية والتصرف المالي)", multiline: true },
          { key: "home_law.p3", label: "الفقرة الثالثة (دعوة لاستعراض الحقوق)", multiline: true },
          { key: "home_law.cta", label: "نص زر الانتقال للحقوق" },
        ],
      },
      {
        title: "قسم الخريطة والمقالات بالرئيسية",
        fields: [
          { key: "home_map.lead", label: "شرح خريطة المحافظات", multiline: true },
          { key: "home_map.cta", label: "نص زر فتح الخريطة" },
          { key: "articles.title", label: "عنوان قسم المقالات" },
          { key: "home_articles.cta", label: "نص زر كل المقالات" },
        ],
      },
    ],
  },
  {
    id: "campaigns",
    title: "صفحة الحملات",
    icon: "megaphone",
    description: "تعديل نصوص صفحة الحملات العامة وتفاصيل حملة «قبل الـ 18».",
    sections: [
      {
        title: "ترويسة صفحة الحملات العامة (/campaigns)",
        fields: [
          { key: "campaigns_page.title", label: "عنوان الصفحة" },
          { key: "campaigns_page.description", label: "وصف صفحة الحملات", multiline: true },
          { key: "campaigns_page.status_active", label: "شارة الحالة (مثل: حملة نشطة)" },
          { key: "campaigns_page.view_campaign", label: "نص زر استعراض الحملة" },
        ],
      },
      {
        title: "حملة «قبل الـ 18 عاماً: طفلة لا زوجة»",
        description: "النصوص المعروضة في غلاف الحملة وتفاصيلها.",
        fields: [
          { key: "campaign.slogan_ar", label: "شعار الحملة بالعربية" },
          { key: "campaign.slogan_en", label: "شعار الحملة بالإنجليزية" },
          { key: "hero.description", label: "الوصف التعريفي للحملة", multiline: true },
          { key: "hero_extra.visual_quote", label: "الاقتباس البصري المعبر", multiline: true },
        ],
      },
      {
        title: "أرقام وإحصائيات الحملة (Stats)",
        fields: [
          { key: "stats_page.title", label: "عنوان الإحصائيات (أرقام صادمة)" },
          { key: "stats_page.percentage", label: "النسبة المئوية (مثل: 28%)" },
          { key: "stats_page.percentage_text", label: "وصف النسبة المئوية" },
          { key: "stats_page.source", label: "مصدر الإحصائية" },
          { key: "stats_page.detail1", label: "الإحصائية المختصرة (مثل: 1 من كل 4)" },
          { key: "stats_page.detail1_desc", label: "شرح الإحصائية المختصرة", multiline: true },
        ],
      },
      {
        title: "استفتاء الحملة (Poll)",
        fields: [
          { key: "poll.title", label: "عنوان الاستفتاء" },
          { key: "poll.question", label: "سؤال الاستفتاء", multiline: true },
          { key: "poll.agree", label: "نص خيار الموافقة" },
          { key: "poll.disagree", label: "نص خيار المعارضة" },
          { key: "poll.thanks", label: "رسالة الشكر بعد التصويت" },
        ],
      },
    ],
  },
  {
    id: "programs",
    title: "صفحة البرامج",
    icon: "graduation",
    description: "تعديل نصوص صفحة البرامج والمبادرات ومسار «من الرف إلى النور».",
    sections: [
      {
        title: "ترويسة صفحة البرامج (/programs)",
        fields: [
          { key: "tracks_page.title", label: "عنوان الصفحة الرئيسي" },
          { key: "tracks_page.description", label: "الوصف العام لبرامج المنصة", multiline: true },
        ],
      },
      {
        title: "المسار البارز: من الرف إلى دائرة الضوء (Shelf to Spotlight)",
        description: "المبادرة المفتوح باب التقديم عليها حالياً.",
        fields: [
          { key: "tracks_page.featured_badge", label: "شارة الحالة (مثل: باب التقديم مفتوح)" },
          { key: "tracks_page.spotlight_title", label: "عنوان المبادرة" },
          { key: "tracks_page.spotlight_desc", label: "الوصف الشامل للمبادرة والتفاصيل", multiline: true },
          { key: "tracks_page.spotlight_apply", label: "نص زر التقديم" },
        ],
      },
      {
        title: "المسارات والتدريبات التنموية الأخرى",
        fields: [
          { key: "tracks_page.other_tracks_title", label: "عنوان قسم المسارات الأخرى" },
          { key: "tracks_page.track1_title", label: "عنوان المسار 1" },
          { key: "tracks_page.track1_desc", label: "وصف المسار 1", multiline: true },
          { key: "tracks_page.track2_title", label: "عنوان المسار 2" },
          { key: "tracks_page.track2_desc", label: "وصف المسار 2", multiline: true },
          { key: "tracks_page.track3_title", label: "عنوان المسار 3" },
          { key: "tracks_page.track3_desc", label: "وصف المسار 3", multiline: true },
          { key: "tracks_page.track4_title", label: "عنوان المسار 4" },
          { key: "tracks_page.track4_desc", label: "وصف المسار 4", multiline: true },
        ],
      },
    ],
  },
  {
    id: "about",
    title: "صفحة من نحن",
    icon: "users",
    description: "تعديل نصوص ورسالة ورؤية صفحة «من نحن».",
    sections: [
      {
        title: "مقدمة الصفحة التعريفية (/about)",
        fields: [
          { key: "about_page.eyebrow", label: "الشعار الصغير" },
          { key: "about_page.title", label: "عنوان الصفحة" },
          { key: "about_page.description", label: "الفقرة التعريفية الشاملة بالمنصة", multiline: true },
        ],
      },
      {
        title: "الرسالة والرؤية (Mission & Vision)",
        fields: [
          { key: "about_page.mission_vision_title", label: "عنوان القسم" },
          { key: "about_page.mission_title", label: "عنوان رسالتنا" },
          { key: "about_page.mission_desc", label: "نص رسالتنا التنموية", multiline: true },
          { key: "about_page.vision_title", label: "عنوان رؤيتنا" },
          { key: "about_page.vision_desc", label: "نص رؤيتنا لمجتمع أكثر عدالة", multiline: true },
        ],
      },
      {
        title: "نهج وفلسفة العمل (Philosophy)",
        fields: [
          { key: "about_page.quote", label: "اقتباس فلسفة العمل الجماعي", multiline: true },
        ],
      },
    ],
  },
  {
    id: "contact",
    title: "صفحة تواصل معنا",
    icon: "envelope",
    description: "تعديل نصوص صفحة التواصل والشبكات وفرص الشراكة والبيان التأسيسي.",
    sections: [
      {
        title: "ترويسة صفحة التواصل (/contact)",
        fields: [
          { key: "contact_page.title", label: "عنوان الصفحة" },
          { key: "contact_page.description", label: "وصف صفحة التواصل", multiline: true },
          { key: "contact_page.info_title", label: "عنوان معلومات التواصل" },
        ],
      },
      {
        title: "عناوين وسائل التواصل والاتصال",
        fields: [
          { key: "contact_page.email_title", label: "عنوان البريد الإلكتروني" },
          { key: "contact_page.facebook_title", label: "عنوان فيسبوك" },
          { key: "contact_page.twitter_title", label: "عنوان تويتر / إكس" },
          { key: "contact_page.instagram_title", label: "عنوان إنستغرام" },
          { key: "contact_page.tiktok_title", label: "عنوان تيك توك" },
        ],
      },
      {
        title: "البيان التأسيسي للمنصة (Manifesto)",
        description: "البيان البارز في صفحة التواصل.",
        fields: [
          { key: "contact_page.manifesto_title_1", label: "عنوان البيان - الشطر الأول" },
          { key: "contact_page.manifesto_title_2", label: "عنوان البيان - الشطر الثاني" },
          { key: "contact_page.manifesto_desc", label: "شرح ونص البيان التأسيسي", multiline: true },
          { key: "contact_page.manifesto_pillar_write", label: "الركيزة 1 (نكتب من أجلها)" },
          { key: "contact_page.manifesto_pillar_research", label: "الركيزة 2 (نبحث من أجلها)" },
          { key: "contact_page.manifesto_pillar_fight", label: "الركيزة 3 (نناضل من أجل حريتها)" },
        ],
      },
      {
        title: "فرص الشراكة والتعاون (Partnerships)",
        fields: [
          { key: "contact_page.partnerships_title", label: "عنوان فرص الشراكة" },
          { key: "contact_page.partnerships_desc", label: "وصف الشراكة والتعاون", multiline: true },
          { key: "contact_page.collaborate_title", label: "عنوان كيف نتعاون" },
          { key: "contact_page.collaborate_desc", label: "وصف آلية التواصل والتعاون", multiline: true },
        ],
      },
    ],
  },
  {
    id: "donate",
    title: "صفحة التبرع",
    icon: "heart",
    description: "تعديل نصوص صفحة التبرع والمساهمات ومسارات الدعم.",
    sections: [
      {
        title: "ترويسة صفحة التبرع (/donate)",
        fields: [
          { key: "donate_page.title", label: "عنوان الصفحة" },
          { key: "donate_page.description", label: "وصف التبرع والدعم", multiline: true },
        ],
      },
      {
        title: "كيف يُحدث تبرعك فرقاً (أوجه الصرف)",
        fields: [
          { key: "donate_page.purposes_title", label: "عنوان القسم" },
          { key: "donate_page.purpose1_title", label: "عنوان المسار 1 (التعليم والتوعية)" },
          { key: "donate_page.purpose1_desc", label: "وصف المسار 1", multiline: true },
          { key: "donate_page.purpose2_title", label: "عنوان المسار 2 (الوعي القانوني)" },
          { key: "donate_page.purpose2_desc", label: "وصف المسار 2", multiline: true },
          { key: "donate_page.purpose3_title", label: "عنوان المسار 3 (البرامج المجتمعية)" },
          { key: "donate_page.purpose3_desc", label: "وصف المسار 3", multiline: true },
        ],
      },
      {
        title: "طرق التبرع والتواصل",
        fields: [
          { key: "donate_page.how_to_title", label: "عنوان كيف تتبرع" },
          { key: "donate_page.how_to_desc", label: "إرشادات التبرع والمساهمة", multiline: true },
          { key: "donate_page.contact_btn", label: "نص زر التواصل للتبرع" },
        ],
      },
    ],
  },
  {
    id: "global",
    title: "الهيدر والفوتر والبيانات العامة",
    icon: "globe",
    description: "تعديل عناصر القائمة العلوية، تذييل الموقع، وعناوين محركات البحث (SEO).",
    sections: [
      {
        title: "عناصر القائمة العلوية (Navigation Menu)",
        fields: [
          { key: "nav.home", label: "رابط: الرئيسية" },
          { key: "nav.campaign", label: "رابط: حملات" },
          { key: "nav.blog", label: "رابط: مقالات" },
          { key: "nav.tracks", label: "رابط: البرامج" },
          { key: "nav.about", label: "رابط: من نحن" },
          { key: "nav.contact", label: "رابط: تواصل" },
          { key: "nav.donate", label: "رابط: التبرع" },
        ],
      },
      {
        title: "تذييل الموقع (Footer)",
        fields: [
          { key: "footer.copyright", label: "نص حقوق النشر (Copyright)" },
          { key: "footer.follow_us", label: "عنوان شبكات التواصل (تابعونا)" },
          { key: "supporters.title", label: "عنوان شريط الشركاء والداعمين" },
        ],
      },
      {
        title: "محركات البحث والمشاركة (SEO & Meta)",
        fields: [
          { key: "meta.title", label: "عنوان الموقع في المتصفح ومحركات البحث" },
          { key: "meta.description", label: "الوصف التعريفي في محركات البحث (Meta Description)", multiline: true },
          { key: "meta.keywords", label: "الكلمات المفتاحية (Keywords)" },
        ],
      },
    ],
  },
];

// Helper to get nested value by string path (e.g. "home_hero.title")
function getNested(obj: any, path: string): string {
  if (!obj) return "";
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur === undefined || cur === null) return "";
    cur = cur[p];
  }
  return typeof cur === "string" ? cur : "";
}

// Helper to set nested value by string path
function setNested(obj: any, path: string, value: string): any {
  const root = { ...(obj || {}) };
  const parts = path.split(".");
  let cur = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    cur[p] = { ...(cur[p] || {}) };
    cur = cur[p];
  }
  cur[parts[parts.length - 1]] = value;
  return root;
}

export function SiteTextsManager() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [searchQuery, setSearchQuery] = useState("");

  // texts contains merged text (defaults + overrides) so inputs are always prepopulated!
  const [texts, setTexts] = useState<{ ar: Record<string, any>; en: Record<string, any> }>({
    ar: {},
    en: {},
  });
  // defaults contains original base translations
  const [defaults, setDefaults] = useState<{ ar: Record<string, any>; en: Record<string, any> }>({
    ar: {},
    en: {},
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    async function fetchTexts() {
      try {
        const res = await fetch("/api/site-content");
        if (!res.ok) throw new Error("تعذّر جلب محتوى الموقع");
        const data = await res.json();
        setTexts(data.texts || { ar: {}, en: {} });
        setDefaults(data.defaults || { ar: {}, en: {} });
      } catch (err) {
        setMessage({ kind: "err", text: (err as Error).message });
      } finally {
        setLoading(false);
      }
    }
    void fetchTexts();
  }, []);

  function handleFieldChange(key: string, value: string) {
    setTexts((prev) => ({
      ...prev,
      [lang]: setNested(prev[lang], key, value),
    }));
  }

  function handleRestoreField(key: string) {
    const defVal = getNested(defaults[lang], key);
    handleFieldChange(key, defVal);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts }),
      });
      if (!res.ok) throw new Error("فشل حفظ النصوص");
      setMessage({ kind: "ok", text: "تم حفظ النصوص بنجاح وتحديث الموقع فوراً!" });
    } catch (err) {
      setMessage({ kind: "err", text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-ink-3">جارٍ تحميل نصوص وصفحات الموقع…</p>;
  }

  const currentTabDef = PAGE_TABS.find((t) => t.id === activeTab) || PAGE_TABS[0];

  return (
    <div className="space-y-8">
      {/* Top Bar with Language Selector, Search and Save */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface p-4 shadow-xs">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">تعديل نصوص وصفحات الموقع</h2>
          <p className="text-xs text-ink-3">
            تم تخصيص واجهة مستقلة لكل صفحة لسهولة وسرعة التعديل. الحقول تعرض النص الحالي الفعلي مباشرة.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Language Toggle */}
          <div className="flex items-center rounded-full border border-line bg-surface-alt p-1">
            <button
              type="button"
              onClick={() => setLang("ar")}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
                lang === "ar"
                  ? "bg-accent text-surface shadow-xs"
                  : "text-ink-2 hover:text-ink"
              }`}
            >
              العربية (AR)
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
                lang === "en"
                  ? "bg-accent text-surface shadow-xs"
                  : "text-ink-2 hover:text-ink"
              }`}
            >
              English (EN)
            </button>
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2 text-sm font-semibold text-surface transition-colors hover:bg-accent-deep disabled:opacity-50"
          >
            <Icon name="check" className="h-4 w-4" />
            {saving ? "جارٍ الحفظ…" : "حفظ التغييرات"}
          </button>
        </div>
      </div>

      {message && (
        <div
          role="alert"
          className={`rounded-lg p-4 text-sm font-medium ${
            message.kind === "ok" ? "bg-ok/10 text-ok" : "bg-bad/10 text-bad"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Main Pages Sub-Navigation (Tabs) */}
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        {PAGE_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery("");
              }}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-3 text-center transition-all ${
                isActive
                  ? "border-accent bg-accent/5 text-accent shadow-xs font-bold"
                  : "border-line bg-surface text-ink-2 hover:border-accent/40 hover:text-ink"
              }`}
            >
              <Icon name={tab.icon} className={`h-5 w-5 ${isActive ? "text-accent" : "text-ink-3"}`} />
              <span className="text-xs font-medium leading-tight">{tab.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Page Header & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <h3 className="font-display text-base font-bold text-ink flex items-center gap-2">
            <Icon name={currentTabDef.icon} className="h-5 w-5 text-accent" />
            {currentTabDef.title}
          </h3>
          <p className="text-xs text-ink-3">{currentTabDef.description}</p>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="بحث في نصوص هذه الصفحة…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Sections and Fields of Active Page */}
      <div className="space-y-6">
        {currentTabDef.sections.map((section, sIdx) => {
          const matchingFields = section.fields.filter(
            (f) =>
              !searchQuery.trim() ||
              f.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
              f.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
              getNested(texts[lang], f.key).toLowerCase().includes(searchQuery.toLowerCase()),
          );

          if (matchingFields.length === 0) return null;

          return (
            <div
              key={sIdx}
              className="overflow-hidden rounded-xl border border-line bg-surface p-6 shadow-xs"
            >
              <div className="mb-5 border-b border-line pb-3">
                <h4 className="font-display text-sm font-bold text-ink">{section.title}</h4>
                {section.description && (
                  <p className="mt-1 text-xs text-ink-3">{section.description}</p>
                )}
              </div>

              <div className="space-y-4">
                {matchingFields.map((field) => {
                  const currentValue = getNested(texts[lang], field.key);
                  const defaultValue = getNested(defaults[lang], field.key);
                  const isModified = currentValue !== defaultValue;

                  return (
                    <div key={field.key} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-semibold text-ink flex items-center gap-2">
                          <span>{field.label}</span>
                          {isModified && (
                            <span className="rounded-full bg-accent-wash px-2 py-0.2 text-[0.65rem] font-bold text-accent">
                              معدّل
                            </span>
                          )}
                        </label>

                        {isModified && (
                          <button
                            type="button"
                            onClick={() => handleRestoreField(field.key)}
                            className="text-[0.7rem] text-ink-3 transition-colors hover:text-bad underline"
                            title="استعادة النص الافتراضي الأصلي"
                          >
                            استعادة الأصلي
                          </button>
                        )}
                      </div>

                      {field.hint && (
                        <p className="text-[0.7rem] text-ink-3">{field.hint}</p>
                      )}

                      {field.multiline ? (
                        <textarea
                          rows={3}
                          value={currentValue}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          className="w-full rounded-md border border-line bg-surface px-3 py-2 text-xs leading-relaxed text-ink transition-colors focus:border-accent focus:outline-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={currentValue}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          className="w-full rounded-md border border-line bg-surface px-3 py-2 text-xs text-ink transition-colors focus:border-accent focus:outline-none"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Save Bar */}
      <div className="flex justify-end pt-4 border-t border-line">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-2.5 text-sm font-semibold text-surface transition-colors hover:bg-accent-deep disabled:opacity-50"
        >
          <Icon name="check" className="h-4 w-4" />
          {saving ? "جارٍ الحفظ…" : "حفظ التغييرات"}
        </button>
      </div>
    </div>
  );
}
