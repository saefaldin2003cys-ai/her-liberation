import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Section, Wrap } from "@/components/primitives";
import { listArticles, type Article } from "@/lib/articles";
import { htmlToText } from "@/lib/sanitize";
import { isDbConfigured } from "@/lib/mongodb";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "articles" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("articles");
  const ar = locale === "ar";

  let articles: Article[] = [];
  let failed = false;
  if (isDbConfigured) {
    try {
      articles = await listArticles();
    } catch {
      failed = true;
    }
  } else {
    failed = true;
  }

  return (
    <Section className="pt-2">
      <Wrap>
        <div className="mb-10 max-w-[62ch]">
          <h1 className="mb-3 text-h1">{t("title")}</h1>
          <p className="text-lead leading-relaxed text-ink-2">
            {t("subtitle")}
          </p>
        </div>

        {failed && (
          <div className="rounded-lg border border-dashed border-line p-10 text-center">
            <p className="text-ink-2">
              {ar
                ? "قاعدة البيانات غير متصلة. أضف MONGODB_URI في ملف .env.local."
                : "The database is not connected. Add MONGODB_URI to .env.local."}
            </p>
          </div>
        )}

        {!failed && articles.length === 0 && (
          <p className="text-ink-3">{t("no_articles")}</p>
        )}

        {articles.length > 0 && (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a._id} article={a} ar={ar} more={t("read_more")} />
            ))}
          </div>
        )}
      </Wrap>
    </Section>
  );
}

function ArticleCard({
  article,
  ar,
  more,
}: {
  article: Article;
  ar: boolean;
  more: string;
}) {
  const title = ar ? article.title.ar : (article.title.en ?? article.title.ar);
  const html = ar ? article.content.ar : (article.content.en ?? article.content.ar);
  const author = ar ? article.author?.ar : (article.author?.en ?? article.author?.ar);

  return (
    <article className="flex flex-col gap-3">
      <Link
        href={`/blog/${article.slug}`}
        className="group block overflow-hidden rounded-lg bg-v-100"
      >
        <div className="relative aspect-4/3">
          {article.coverImage ? (
            <Image
              src={article.coverImage}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-3">
              <span className="font-mono text-xs">HerLiberation</span>
            </div>
          )}
        </div>
      </Link>

      <p className="flex gap-3 font-mono text-xs text-ink-3">
        <time dateTime={article.createdAt}>
          {new Date(article.createdAt).toLocaleDateString(
            ar ? "ar-IQ" : "en-GB",
            { year: "numeric", month: "long", day: "numeric" },
          )}
        </time>
        {author && <span>· {author}</span>}
      </p>

      <h2 className="text-h3">
        <Link
          href={`/blog/${article.slug}`}
          className="transition-colors hover:text-accent"
        >
          {title}
        </Link>
      </h2>

      <p className="text-sm leading-relaxed text-ink-2">
        {htmlToText(html, 140)}
      </p>

      <Link
        href={`/blog/${article.slug}`}
        className="mt-auto self-start border-b-2 border-accent pb-0.5 text-sm font-semibold text-accent transition-colors hover:border-ink hover:text-ink"
      >
        {more}
      </Link>
    </article>
  );
}
