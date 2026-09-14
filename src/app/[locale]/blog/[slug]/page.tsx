import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Section, Wrap } from "@/components/primitives";
import { Icon } from "@/components/icon";
import { getArticle, listArticles } from "@/lib/articles";
import { htmlToText } from "@/lib/sanitize";
import { isDbConfigured } from "@/lib/mongodb";

export const revalidate = 60;

/** Pre-render the published articles; anything newer renders on demand. */
export async function generateStaticParams() {
  if (!isDbConfigured) return [];
  try {
    const articles = await listArticles({ limit: 100 });
    return articles.map((a) => ({ slug: a.slug! }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isDbConfigured) return {};
  const article = await getArticle(slug).catch(() => null);
  if (!article) return {};

  const ar = locale === "ar";
  const title = ar ? article.title.ar : (article.title.en ?? article.title.ar);
  const html = ar ? article.content.ar : (article.content.en ?? article.content.ar);

  return {
    title,
    description: htmlToText(html, 160),
    openGraph: {
      type: "article",
      title,
      description: htmlToText(html, 160),
      images: article.coverImage ? [article.coverImage] : undefined,
      publishedTime: article.createdAt,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("article");
  const ar = locale === "ar";

  if (!isDbConfigured) notFound();
  const article = await getArticle(slug).catch(() => null);
  if (!article || article.published === false) notFound();

  const title = ar ? article.title.ar : (article.title.en ?? article.title.ar);
  const html = ar ? article.content.ar : (article.content.en ?? article.content.ar);
  const author = ar ? article.author?.ar : (article.author?.en ?? article.author?.ar);

  const others = (await listArticles({ limit: 4 }).catch(() => []))
    .filter((a) => a._id !== article._id)
    .slice(0, 3);

  return (
    <>
      <Section className="pb-0">
        <Wrap className="max-w-[820px]!">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-ink"
          >
            <Icon name="arrow" className="h-4 w-4 ltr:-scale-x-100" />
            {t("back_to_blog")}
          </Link>

          <h1 className="text-h1">{title}</h1>

          <p className="mt-4 flex flex-wrap gap-3 font-mono text-sm text-ink-3">
            <time dateTime={article.createdAt}>
              {new Date(article.createdAt).toLocaleDateString(
                ar ? "ar-IQ" : "en-GB",
                { year: "numeric", month: "long", day: "numeric" },
              )}
            </time>
            {author && <span>· {author}</span>}
          </p>

          {article.coverImage && (
            <div className="relative mt-8 aspect-3/2 overflow-hidden rounded-lg bg-v-100">
              <Image
                src={article.coverImage}
                alt=""
                fill
                priority
                sizes="(max-width: 860px) 100vw, 820px"
                className="object-cover"
              />
            </div>
          )}

          {/* Sanitised server-side on write — see lib/sanitize.ts */}
          <div
            className="prose-body mt-10"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </Wrap>
      </Section>

      {others.length > 0 && (
        <Section>
          <Wrap className="max-w-[820px]!">
            <h2 className="mb-6 border-t border-line pt-10 text-h3">
              {t("suggested_title")}
            </h2>
            <ul className="flex flex-col divide-y divide-line">
              {others.map((o) => (
                <li key={o._id}>
                  <Link
                    href={`/blog/${o.slug}`}
                    className="flex items-center gap-4 py-4 transition-colors hover:text-accent"
                  >
                    <span className="font-display font-semibold">
                      {ar ? o.title.ar : (o.title.en ?? o.title.ar)}
                    </span>
                    <Icon
                      name="arrow"
                      className="ms-auto h-4 w-4 flex-none rtl:-scale-x-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Wrap>
        </Section>
      )}
    </>
  );
}
