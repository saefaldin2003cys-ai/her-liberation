"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Icon } from "@/components/icon";
import {
  DEFAULT_SITE_IMAGES,
  normalizeImageSetting,
  getImageAspectClass,
  getImageFitClass,
  getImagePositionClass,
  type SiteImages,
  type ImageSetting,
} from "@/lib/site-content-types";
import type { Article } from "@/lib/articles";

type ImageCardDef = {
  key: keyof SiteImages;
  title: string;
  description: string;
};

const IMAGE_CARDS: ImageCardDef[] = [
  {
    key: "homeHero",
    title: "صورة الواجهة الرئيسية (Hero)",
    description: "الصورة المعروضة في أعلى الصفحة الرئيسية بجانب العنوان الترحيبي.",
  },
  {
    key: "homeTestimony",
    title: "صورة قسم الشهادة (Testimony)",
    description: "الصورة المعروضة في قسم شهادة الناجية بالصفحة الرئيسية.",
  },
  {
    key: "campaignBefore18",
    title: "صورة حملة «قبل الـ 18» (مترابطة)",
    description: "صورة غلاف الحملة — مترابطة تلقائياً في الواجهة الرئيسية، وتفاصيل الحملة، وصفحة الحملات العامة.",
  },
  {
    key: "campaignsHero",
    title: "غلاف صفحة الحملات العامة (/campaigns)",
    description: "صورة الغلاف لصفحة الحملات. مترابطة افتراضياً مع حملة قبل الـ 18، أو يمكنك تخصيص صورة منفصلة لها.",
  },
  {
    key: "aboutHero",
    title: "صورة صفحة من نحن (About)",
    description: "الصورة التوثيقية البارزة في صفحة من نحن ورسالتنا.",
  },
  {
    key: "programSpotlight",
    title: "صورة مسار «من الرف إلى النور» (/programs)",
    description: "الصورة البارزة لمسار من الرف إلى النور في صفحة البرامج والمبادرات.",
  },
  {
    key: "logo",
    title: "شعار المنصة (Logo)",
    description: "شعار المنصة المعروض في الهيدر العلوي وتذييل الموقع عبر جميع الصفحات.",
  },
];

export function SiteImagesManager() {
  const [images, setImages] = useState<Record<keyof SiteImages, ImageSetting>>(() => ({
    homeHero: normalizeImageSetting(DEFAULT_SITE_IMAGES.homeHero, DEFAULT_SITE_IMAGES.homeHero),
    homeTestimony: normalizeImageSetting(DEFAULT_SITE_IMAGES.homeTestimony, DEFAULT_SITE_IMAGES.homeTestimony),
    campaignBefore18: normalizeImageSetting(DEFAULT_SITE_IMAGES.campaignBefore18, DEFAULT_SITE_IMAGES.campaignBefore18),
    campaignsHero: normalizeImageSetting(DEFAULT_SITE_IMAGES.campaignsHero, DEFAULT_SITE_IMAGES.campaignsHero),
    aboutHero: normalizeImageSetting(DEFAULT_SITE_IMAGES.aboutHero, DEFAULT_SITE_IMAGES.aboutHero),
    programSpotlight: normalizeImageSetting(DEFAULT_SITE_IMAGES.programSpotlight, DEFAULT_SITE_IMAGES.programSpotlight),
    logo: normalizeImageSetting(DEFAULT_SITE_IMAGES.logo, DEFAULT_SITE_IMAGES.logo),
  }));

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [uploadingArticleId, setUploadingArticleId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentKeyRef = useRef<keyof SiteImages | null>(null);

  const articleFileInputRef = useRef<HTMLInputElement>(null);
  const currentArticleIdRef = useRef<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [resContent, resArticles] = await Promise.all([
          fetch("/api/site-content"),
          fetch("/api/articles?drafts=1"),
        ]);

        if (resContent.ok) {
          const data = await resContent.json();
          if (data.images) {
            const raw = data.images as SiteImages;
            setImages({
              homeHero: normalizeImageSetting(raw.homeHero, DEFAULT_SITE_IMAGES.homeHero),
              homeTestimony: normalizeImageSetting(raw.homeTestimony, DEFAULT_SITE_IMAGES.homeTestimony),
              campaignBefore18: normalizeImageSetting(raw.campaignBefore18, DEFAULT_SITE_IMAGES.campaignBefore18),
              campaignsHero: normalizeImageSetting(raw.campaignsHero || raw.campaignBefore18, DEFAULT_SITE_IMAGES.campaignsHero),
              aboutHero: normalizeImageSetting(raw.aboutHero, DEFAULT_SITE_IMAGES.aboutHero),
              programSpotlight: normalizeImageSetting(raw.programSpotlight, DEFAULT_SITE_IMAGES.programSpotlight),
              logo: normalizeImageSetting(raw.logo, DEFAULT_SITE_IMAGES.logo),
            });
          }
        }

        if (resArticles.ok) {
          const aData = await resArticles.json();
          if (aData.articles) {
            setArticles(aData.articles);
          }
        }
      } catch (err) {
        setMessage({ kind: "err", text: (err as Error).message });
      } finally {
        setLoading(false);
      }
    }
    void fetchAll();
  }, []);

  function triggerUpload(key: keyof SiteImages) {
    currentKeyRef.current = key;
    fileInputRef.current?.click();
  }

  function triggerArticleCoverUpload(articleId: string) {
    currentArticleIdRef.current = articleId;
    articleFileInputRef.current?.click();
  }

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    const key = currentKeyRef.current;
    if (!file || !key) return;

    setUploadingKey(key);
    setMessage({ kind: "ok", text: "جارٍ فحص أبعاد الصورة ورفعها إلى قاعدة البيانات…" });

    // Pre-calculate natural aspect ratio from the file
    let detectedAspect: ImageSetting["aspect"] = "3/2";
    let detectedPosition: ImageSetting["position"] = "center";
    try {
      const img = document.createElement("img");
      const objectUrl = URL.createObjectURL(file);
      await new Promise<void>((resolve) => {
        img.onload = () => {
          const ratio = img.naturalWidth / img.naturalHeight;
          if (ratio < 0.9) {
            detectedAspect = "4/5";
            detectedPosition = "top";
          } else if (ratio >= 0.9 && ratio <= 1.15) {
            detectedAspect = "1/1";
          } else if (ratio > 1.15 && ratio <= 1.45) {
            detectedAspect = "4/3";
          } else if (ratio > 1.7) {
            detectedAspect = "16/9";
          } else {
            detectedAspect = "3/2";
          }
          URL.revokeObjectURL(objectUrl);
          resolve();
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          resolve();
        };
        img.src = objectUrl;
      });
    } catch {
      // fallback
    }

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "فشل رفع الصورة");

      setImages((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          url: data.url,
          aspect: detectedAspect,
          position: detectedPosition,
        },
      }));
      setMessage({
        kind: "ok",
        text: `تم رفع الصورة بنجاح وتعيين الأبعاد التلقائية (${detectedAspect})! يمكنك تعديل الأبعاد والموضع يدوياً أدناه ثم الضغط على «حفظ التغييرات».`,
      });
    } catch (err) {
      setMessage({ kind: "err", text: (err as Error).message });
    } finally {
      setUploadingKey(null);
      currentKeyRef.current = null;
    }
  }

  async function onArticleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    const articleId = currentArticleIdRef.current;
    if (!file || !articleId) return;

    setUploadingArticleId(articleId);
    setMessage({ kind: "ok", text: "جارٍ رفع وحفظ صورة غلاف المقال…" });

    try {
      const fd = new FormData();
      fd.append("file", file);
      const upRes = await fetch("/api/upload", { method: "POST", body: fd });
      const upData = await upRes.json();
      if (!upRes.ok) throw new Error(upData.error ?? "فشل رفع الصورة");

      const putRes = await fetch(`/api/articles/${articleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverImage: upData.url }),
      });
      if (!putRes.ok) throw new Error("فشل حفظ صورة غلاف المقال");

      setArticles((prev) =>
        prev.map((a) => (a._id === articleId ? { ...a, coverImage: upData.url } : a)),
      );
      setMessage({ kind: "ok", text: "تم تحديث صورة غلاف المقال بنجاح!" });
    } catch (err) {
      setMessage({ kind: "err", text: (err as Error).message });
    } finally {
      setUploadingArticleId(null);
      currentArticleIdRef.current = null;
    }
  }

  function updateSetting<K extends keyof ImageSetting>(
    imageKey: keyof SiteImages,
    prop: K,
    val: ImageSetting[K],
  ) {
    setImages((prev) => ({
      ...prev,
      [imageKey]: {
        ...prev[imageKey],
        [prop]: val,
      },
    }));
  }

  function restoreDefault(key: keyof SiteImages) {
    const defUrl = DEFAULT_SITE_IMAGES[key];
    setImages((prev) => ({
      ...prev,
      [key]: normalizeImageSetting(defUrl, defUrl),
    }));
    setMessage({ kind: "ok", text: "تمت استعادة الإعدادات الأصلية. اضغط «حفظ التغييرات» للاعتماد." });
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images }),
      });
      if (!res.ok) throw new Error("فشل حفظ الصور");
      setMessage({ kind: "ok", text: "تم حفظ الصور وإعدادات الأبعاد بنجاح وستظهر في الموقع فوراً!" });
    } catch (err) {
      setMessage({ kind: "err", text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-ink-3">جارٍ تحميل صور الموقع…</p>;
  }

  return (
    <div className="space-y-12">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={onFileSelected}
        className="hidden"
      />
      <input
        ref={articleFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={onArticleFileSelected}
        className="hidden"
      />

      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-surface p-4">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">إدارة وتعديل جميع صور وأغلفة الموقع</h2>
          <p className="text-xs text-ink-3">
            جميع صور صفحات الموقع وأغلفة المقالات قابلة للتعديل والتحكم الكامل بالنسب والأبعاد. الصور المشتركة (مثل الحملة والشعار) مترابطة تلقائياً عبر كل الصفحات.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-surface transition-colors hover:bg-accent-deep disabled:opacity-50"
        >
          <Icon name="check" className="h-4 w-4" />
          {saving ? "جارٍ الحفظ…" : "حفظ التغييرات"}
        </button>
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

      {/* SECTION 1: Site & Page Images */}
      <div>
        <div className="mb-4 flex items-center justify-between border-b border-line pb-2">
          <h3 className="font-display text-base font-bold text-ink">صور وصفحات الموقع الرئيسية</h3>
          <span className="text-xs text-ink-3">{IMAGE_CARDS.length} صور رئيسية</span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {IMAGE_CARDS.map((card) => {
            const config = images[card.key] || normalizeImageSetting(DEFAULT_SITE_IMAGES[card.key], DEFAULT_SITE_IMAGES[card.key]);
            const isCustom = config.url !== DEFAULT_SITE_IMAGES[card.key];
            const isUploading = uploadingKey === card.key;

            const aspectClass = getImageAspectClass(config.aspect);
            const fitClass = getImageFitClass(config.fit);
            const posClass = getImagePositionClass(config.position);

            return (
              <div
                key={card.key}
                className="flex flex-col justify-between overflow-hidden rounded-lg border border-line bg-surface transition-colors hover:border-accent/40"
              >
                <div className="p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold text-ink">{card.title}</h3>
                    {isCustom && (
                      <span className="rounded-full bg-accent-wash px-2 py-0.5 text-[0.7rem] font-semibold text-accent">
                        مخصصة
                      </span>
                    )}
                  </div>
                  <p className="mb-4 text-xs text-ink-3">{card.description}</p>

                  {/* Preview Frame with live adjustments applied */}
                  <div
                    className={`relative ${aspectClass} w-full overflow-hidden rounded-md border border-line bg-surface-alt transition-all duration-300`}
                  >
                    <Image
                      src={config.url}
                      alt={card.title}
                      fill
                      className={`${fitClass} ${posClass}`}
                      unoptimized
                    />
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-surface/80 backdrop-blur-xs">
                        <p className="text-xs font-semibold text-accent">جارٍ الرفع…</p>
                      </div>
                    )}
                  </div>

                  {/* Adjustment Controls */}
                  <div className="mt-4 space-y-3 rounded-md border border-line/60 bg-surface-alt/40 p-3 text-xs">
                    {/* Aspect Ratio */}
                    <div>
                      <label className="mb-1 block font-medium text-ink-2">نسبة الأبعاد (Aspect Ratio):</label>
                      <select
                        value={config.aspect || "3/2"}
                        onChange={(e) => updateSetting(card.key, "aspect", e.target.value as any)}
                        className="w-full rounded-xs border border-line bg-surface px-2.5 py-1.5 text-xs text-ink transition-colors focus:border-accent focus:outline-none"
                      >
                        <option value="4/5">طولي 4:5 (Portrait - ممتاز للصور الرأسية والوجوه)</option>
                        <option value="1/1">مربع 1:1 (Square)</option>
                        <option value="4/3">أفقي 4:3 (Landscape)</option>
                        <option value="3/2">أفقي 3:2 (Landscape القياسي)</option>
                        <option value="16/9">شاشة عريضة 16:9 (Widescreen)</option>
                      </select>
                    </div>

                    {/* Fit Mode */}
                    <div>
                      <label className="mb-1 block font-medium text-ink-2">طريقة الملاءمة (Fit Mode):</label>
                      <select
                        value={config.fit || "cover"}
                        onChange={(e) => updateSetting(card.key, "fit", e.target.value as any)}
                        className="w-full rounded-xs border border-line bg-surface px-2.5 py-1.5 text-xs text-ink transition-colors focus:border-accent focus:outline-none"
                      >
                        <option value="cover">ملء وتغطية الإطار بالكامل (Cover)</option>
                        <option value="contain">احتواء كامل بدون أي قص (Contain)</option>
                      </select>
                    </div>

                    {/* Focus Position (relevant if cover is used) */}
                    {config.fit !== "contain" && (
                      <div>
                        <label className="mb-1 block font-medium text-ink-2">موضع التركيز (Focus):</label>
                        <select
                          value={config.position || "center"}
                          onChange={(e) => updateSetting(card.key, "position", e.target.value as any)}
                          className="w-full rounded-xs border border-line bg-surface px-2.5 py-1.5 text-xs text-ink transition-colors focus:border-accent focus:outline-none"
                        >
                          <option value="top">أعلى (Top) - لحفظ الرؤوس والوجوه من الاقتصاص</option>
                          <option value="center">وسط (Center)</option>
                          <option value="bottom">أسفل (Bottom)</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between border-t border-line bg-surface-alt/60 p-3">
                  <button
                    type="button"
                    onClick={() => triggerUpload(card.key)}
                    disabled={isUploading || saving}
                    className="inline-flex items-center gap-1.5 rounded-xs border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
                  >
                    <Icon name="pen" className="h-3.5 w-3.5" />
                    تغيير الصورة
                  </button>

                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => restoreDefault(card.key)}
                      disabled={isUploading || saving}
                      className="text-xs text-ink-3 transition-colors hover:text-bad disabled:opacity-50"
                    >
                      استعادة الأصلية
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Article Cover Images */}
      <div>
        <div className="mb-4 flex items-center justify-between border-b border-line pb-2">
          <div>
            <h3 className="font-display text-base font-bold text-ink">أغلفة المقالات (Article Covers)</h3>
            <p className="text-xs text-ink-3">يمكنك تغيير وتحديث صورة غلاف أي مقال منشور في الموقع مباشرة من هنا.</p>
          </div>
          <span className="text-xs text-ink-3">{articles.length} مقالات</span>
        </div>

        {articles.length === 0 ? (
          <p className="text-xs text-ink-3">لا توجد مقالات منشورة حالياً.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => {
              const isUploadingThis = uploadingArticleId === article._id;
              const hasCover = !!article.coverImage;

              return (
                <div
                  key={article._id}
                  className="flex flex-col justify-between overflow-hidden rounded-lg border border-line bg-surface transition-colors hover:border-accent/40"
                >
                  <div className="p-5">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <h4 className="font-display text-sm font-bold text-ink line-clamp-1" title={article.title.ar}>
                        {article.title.ar}
                      </h4>
                      <span className="rounded-full bg-accent-wash px-2 py-0.5 text-[0.7rem] font-semibold text-accent flex-none">
                        مقال
                      </span>
                    </div>

                    <p className="mb-4 text-xs text-ink-3">
                      {new Date(article.createdAt).toLocaleDateString("ar-IQ", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>

                    {/* Cover Preview Frame */}
                    <div className="relative aspect-4/3 w-full overflow-hidden rounded-md border border-line bg-surface-alt">
                      {hasCover ? (
                        <Image
                          src={article.coverImage!}
                          alt={article.title.ar}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-ink-3">
                          لا توجد صورة غلاف
                        </div>
                      )}
                      {isUploadingThis && (
                        <div className="absolute inset-0 flex items-center justify-center bg-surface/80 backdrop-blur-xs">
                          <p className="text-xs font-semibold text-accent">جارٍ رفع الغلاف…</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-between border-t border-line bg-surface-alt/60 p-3">
                    <button
                      type="button"
                      onClick={() => triggerArticleCoverUpload(article._id)}
                      disabled={isUploadingThis || saving}
                      className="inline-flex items-center gap-1.5 rounded-xs border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
                    >
                      <Icon name="pen" className="h-3.5 w-3.5" />
                      {hasCover ? "تغيير غلاف المقال" : "إضافة صورة غلاف"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-surface transition-colors hover:bg-accent-deep disabled:opacity-50"
        >
          <Icon name="check" className="h-4 w-4" />
          {saving ? "جارٍ الحفظ…" : "حفظ التغييرات"}
        </button>
      </div>
    </div>
  );
}
