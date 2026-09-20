"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArticleForm } from "./article-form";
import { SiteTextsManager } from "./site-texts-manager";
import { SiteImagesManager } from "./site-images-manager";
import { Icon } from "@/components/icon";
import type { Article } from "@/lib/articles";

type Tab = "articles" | "texts" | "images";
type View = { mode: "list" } | { mode: "new" } | { mode: "edit"; article: Article };

export function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("articles");
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [view, setView] = useState<View>({ mode: "list" });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/articles?drafts=1");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "تعذّر تحميل المقالات");
      setArticles(data.articles);
    } catch (err) {
      setError((err as Error).message);
      setArticles([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  }

  async function remove(a: Article) {
    if (!confirm(`حذف «${a.title.ar}» نهائياً؟`)) return;
    const res = await fetch(`/api/articles/${a._id}`, { method: "DELETE" });
    if (res.ok) void load();
    else setError("تعذّر الحذف");
  }

  return (
    <div dir="rtl">
      {/* Top Header */}
      <header className="mb-6 flex flex-wrap items-center gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-h2">لوحة الإدارة</h1>
          <p className="mt-1 text-xs text-ink-3">
            إدارة شاملة للمحتوى: المقالات، نصوص وصفحات الموقع، والصور
          </p>
        </div>
        <div className="ms-auto flex items-center gap-2">
          {activeTab === "articles" && view.mode === "list" && (
            <button
              type="button"
              onClick={() => setView({ mode: "new" })}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-surface transition-colors hover:bg-accent-deep"
            >
              <Icon name="pen" className="h-4 w-4" />
              مقال جديد
            </button>
          )}
          {activeTab === "articles" && view.mode !== "list" && (
            <button
              type="button"
              onClick={() => setView({ mode: "list" })}
              className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink-2 transition-colors hover:border-accent hover:text-accent"
            >
              رجوع إلى قائمة المقالات
            </button>
          )}
          <button
            type="button"
            onClick={logout}
            aria-label="تسجيل الخروج"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-2 transition-colors hover:border-accent hover:text-accent"
          >
            <Icon name="exit" className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Tabs Navigation */}
      <nav className="mb-8 flex items-center gap-2 border-b border-line pb-1">
        <button
          type="button"
          onClick={() => {
            setActiveTab("articles");
            setView({ mode: "list" });
          }}
          className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "articles"
              ? "text-accent after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-accent"
              : "text-ink-2 hover:text-ink"
          }`}
        >
          المقالات
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("texts")}
          className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "texts"
              ? "text-accent after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-accent"
              : "text-ink-2 hover:text-ink"
          }`}
        >
          نصوص الموقع
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("images")}
          className={`relative px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "images"
              ? "text-accent after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-accent"
              : "text-ink-2 hover:text-ink"
          }`}
        >
          صور الموقع
        </button>
      </nav>

      {error && (
        <p role="alert" className="mb-6 text-sm text-bad">
          {error}
        </p>
      )}

      {/* Tab 1: Articles */}
      {activeTab === "articles" && (
        <>
          {view.mode === "list" && (
            <ArticleList
              articles={articles}
              onEdit={(article) => setView({ mode: "edit", article })}
              onDelete={remove}
            />
          )}

          {view.mode === "new" && (
            <ArticleForm
              onSaved={() => {
                void load();
                setView({ mode: "list" });
              }}
            />
          )}

          {view.mode === "edit" && (
            <ArticleForm
              article={view.article}
              onSaved={() => {
                void load();
                setView({ mode: "list" });
              }}
            />
          )}
        </>
      )}

      {/* Tab 2: Site Texts */}
      {activeTab === "texts" && <SiteTextsManager />}

      {/* Tab 3: Site Images */}
      {activeTab === "images" && <SiteImagesManager />}
    </div>
  );
}

function ArticleList({
  articles,
  onEdit,
  onDelete,
}: {
  articles: Article[] | null;
  onEdit: (a: Article) => void;
  onDelete: (a: Article) => void;
}) {
  if (articles === null) {
    return <p className="text-ink-3">جارٍ التحميل…</p>;
  }

  if (articles.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line p-10 text-center">
        <p className="text-ink-2">لا توجد مقالات بعد.</p>
        <p className="mt-1 text-sm text-ink-3">
          اضغط «مقال جديد» للبدء.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-line rounded-lg border border-line bg-surface">
      {articles.map((a) => (
        <li key={a._id} className="flex flex-wrap items-center gap-4 p-4">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display font-semibold text-ink">
              {a.title.ar}
            </p>
            <p className="mt-0.5 font-mono text-xs text-ink-3">
              {new Date(a.createdAt).toLocaleDateString("ar-IQ")} · /{a.slug}
              {a.published === false && (
                <span className="ms-2 rounded-full bg-warn/15 px-2 py-0.5 text-warn">
                  مسودة
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onEdit(a)}
            className="rounded-xs border border-line px-3 py-1.5 text-sm text-ink-2 transition-colors hover:border-accent hover:text-accent"
          >
            تعديل
          </button>
          <button
            type="button"
            onClick={() => onDelete(a)}
            aria-label={`حذف ${a.title.ar}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xs text-ink-3 transition-colors hover:bg-bad/10 hover:text-bad"
          >
            <Icon name="trash" className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
