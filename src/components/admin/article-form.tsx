"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { RichEditor } from "./rich-editor";
import { Icon } from "@/components/icon";
import { compressImageClient } from "@/lib/client-image-compress";
import type { Article } from "@/lib/articles";

type Draft = {
  titleAr: string;
  titleEn: string;
  authorAr: string;
  authorEn: string;
  contentAr: string;
  contentEn: string;
  slug: string;
  coverImage: string;
  published: boolean;
};

function toDraft(a?: Article): Draft {
  return {
    titleAr: a?.title.ar ?? "",
    titleEn: a?.title.en ?? "",
    authorAr: a?.author?.ar ?? "",
    authorEn: a?.author?.en ?? "",
    contentAr: a?.content.ar ?? "",
    contentEn: a?.content.en ?? "",
    slug: a?.slug ?? "",
    coverImage: a?.coverImage ?? "",
    published: a?.published ?? true,
  };
}

export function ArticleForm({
  article,
  onSaved,
}: {
  article?: Article;
  onSaved: (a: Article) => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(article));
  const [tab, setTab] = useState<"ar" | "en">("ar");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pending = useRef<((url: string | null) => void) | null>(null);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  /** Opens the file picker and resolves with the hosted URL. */
  const pickImage = useCallback(() => {
    return new Promise<string | null>((resolve) => {
      pending.current = resolve;
      fileRef.current?.click();
    });
  }, []);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return pending.current?.(null);

    setMessage({ kind: "ok", text: "جارٍ رفع الصورة…" });
    try {
      const compressedFile = await compressImageClient(file);
      const fd = new FormData();
      fd.append("file", compressedFile);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setMessage(null);
      pending.current?.(data.url);
    } catch (err) {
      setMessage({ kind: "err", text: (err as Error).message });
      pending.current?.(null);
    } finally {
      pending.current = null;
    }
  }

  async function save() {
    if (!draft.titleAr.trim() || !draft.contentAr.trim()) {
      setMessage({ kind: "err", text: "العنوان والمحتوى بالعربية مطلوبان." });
      setTab("ar");
      return;
    }
    setSaving(true);
    setMessage(null);

    const payload = {
      title: { ar: draft.titleAr, en: draft.titleEn || undefined },
      author: draft.authorAr
        ? { ar: draft.authorAr, en: draft.authorEn || undefined }
        : undefined,
      content: { ar: draft.contentAr, en: draft.contentEn || undefined },
      coverImage: draft.coverImage || undefined,
      slug: draft.slug || undefined,
      published: draft.published,
    };

    try {
      const res = await fetch(
        article ? `/api/articles/${article._id}` : "/api/articles",
        {
          method: article ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setMessage({ kind: "ok", text: "تم الحفظ." });
      onSaved(data.article);
    } catch (err) {
      setMessage({ kind: "err", text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={onFile}
        className="hidden"
      />

      {/* Language tabs — the editor below follows the selected language's
          direction, so Arabic and English are both comfortable to write. */}
      <div className="flex gap-1 border-b border-line">
        {(["ar", "en"] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setTab(l)}
            className={[
              "-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition-colors",
              tab === l
                ? "border-accent text-accent"
                : "border-transparent text-ink-3 hover:text-ink",
            ].join(" ")}
          >
            {l === "ar" ? "العربية" : "English"}
            {l === "ar" && <span className="ms-1 text-bad">*</span>}
          </button>
        ))}
      </div>

      {tab === "ar" ? (
        <div className="flex flex-col gap-4" dir="rtl">
          <Field label="العنوان (مطلوب)">
            <input
              value={draft.titleAr}
              onChange={(e) => set("titleAr", e.target.value)}
              className={inputCls}
              dir="rtl"
            />
          </Field>
          <Field label="الكاتب">
            <input
              value={draft.authorAr}
              onChange={(e) => set("authorAr", e.target.value)}
              className={inputCls}
              dir="rtl"
            />
          </Field>
          <Field label="المحتوى (مطلوب)">
            <RichEditor
              value={draft.contentAr}
              onChange={(html) => set("contentAr", html)}
              dir="rtl"
              placeholder="اكتب المقال هنا…"
              onRequestImage={pickImage}
            />
          </Field>
        </div>
      ) : (
        <div className="flex flex-col gap-4" dir="ltr">
          <Field label="Title">
            <input
              value={draft.titleEn}
              onChange={(e) => set("titleEn", e.target.value)}
              className={inputCls}
              dir="ltr"
              placeholder="Falls back to the Arabic title if left empty"
            />
          </Field>
          <Field label="Author">
            <input
              value={draft.authorEn}
              onChange={(e) => set("authorEn", e.target.value)}
              className={inputCls}
              dir="ltr"
            />
          </Field>
          <Field label="Content">
            <RichEditor
              value={draft.contentEn}
              onChange={(html) => set("contentEn", html)}
              dir="ltr"
              placeholder="Write the English version here…"
              onRequestImage={pickImage}
            />
          </Field>
        </div>
      )}

      {/* Settings that are the same in both languages */}
      <div className="grid gap-4 border-t border-line pt-6 sm:grid-cols-2" dir="rtl">
        <Field label="الرابط (slug)">
          <input
            value={draft.slug}
            onChange={(e) => set("slug", e.target.value)}
            className={`${inputCls} font-mono text-sm`}
            dir="ltr"
            placeholder="يُشتق من العنوان تلقائياً"
          />
        </Field>

        <Field label="صورة الغلاف">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={async () => {
                const url = await pickImage();
                if (url) set("coverImage", url);
              }}
              className="inline-flex items-center gap-2 rounded-xs border border-line px-3 py-2 text-sm text-ink-2 transition-colors hover:border-accent hover:text-accent"
            >
              <Icon name="image" className="h-4 w-4" />
              اختر صورة
            </button>
            {draft.coverImage && (
              <>
                <Image
                  src={draft.coverImage}
                  alt=""
                  width={64}
                  height={44}
                  className="h-11 w-16 rounded-xs object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => set("coverImage", "")}
                  className="text-ink-3 transition-colors hover:text-bad"
                  aria-label="إزالة الصورة"
                >
                  <Icon name="trash" className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6" dir="rtl">
        <label className="flex items-center gap-2 text-sm text-ink-2">
          <input
            type="checkbox"
            checked={draft.published}
            onChange={(e) => set("published", e.target.checked)}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
          منشور
        </label>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-surface transition-colors hover:bg-accent-deep disabled:opacity-50"
        >
          {saving ? "جارٍ الحفظ…" : article ? "حفظ التعديلات" : "نشر المقال"}
        </button>

        {message && (
          <p
            role="status"
            className={`text-sm ${message.kind === "err" ? "text-bad" : "text-ok"}`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xs border border-line bg-surface px-3 py-2.5 text-ink transition-colors focus:border-accent focus:outline-none";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink-3">
        {label}
      </span>
      {children}
    </label>
  );
}
