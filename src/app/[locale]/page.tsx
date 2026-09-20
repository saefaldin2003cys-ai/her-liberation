import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icon";
import { Section, Wrap, Eyebrow, Figure } from "@/components/primitives";
import { IraqMap } from "@/components/iraq-map";
import { SupportersMarquee } from "@/components/supporters-marquee";
import { listArticles, type Article } from "@/lib/articles";
import { htmlToText } from "@/lib/sanitize";
import { isDbConfigured } from "@/lib/mongodb";
import { getSiteImages } from "@/lib/site-content";
import {
  normalizeImageSetting,
  DEFAULT_SITE_IMAGES,
  getImageAspectClass,
  getImageFitClass,
  getImagePositionClass,
} from "@/lib/site-content-types";

export const revalidate = 60;

/**
 * The organisation's home page.
 *
 * "Under 18: a child, not a wife" is a campaign this organisation runs, not
 * the organisation itself. It appears here as a featured campaign that links
 * onward and owns its own page under /campaigns; the home page is about
 * تحريرها — what it is, what it works on, and what it does.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const ar = locale === "ar";
  const siteImages = await getSiteImages();
  const heroImage = normalizeImageSetting(
    siteImages.homeHero,
    DEFAULT_SITE_IMAGES.homeHero,
  );
  const testimonyImage = normalizeImageSetting(
    siteImages.homeTestimony,
    DEFAULT_SITE_IMAGES.homeTestimony,
  );
  const campaignImage = normalizeImageSetting(
    siteImages.campaignBefore18,
    DEFAULT_SITE_IMAGES.campaignBefore18,
  );

  let articles: Article[] = [];
  if (isDbConfigured) {
    articles = await listArticles({ limit: 3 }).catch(() => []);
  }

  return (
    <>
      {/* ---------- Hero: the organisation ---------- */}
      <Section className="pb-0 pt-10 sm:pt-14">
        <Wrap>
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            <div>
              <Eyebrow>{t("home_hero.tagline")}</Eyebrow>
              {/* A sentence, not a slogan: set a step below the page-title
                  size with generous leading so it reads as writing. */}
              <h1 className="mb-5 mt-4 max-w-[22ch] text-[clamp(1.9rem,3.4vw,2.9rem)] leading-[1.45]">
                {t("home_hero.title")}
              </h1>
              <p className="max-w-[56ch] text-lead leading-relaxed text-ink-2">
                {t("home_hero.description")}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/campaigns"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-surface transition-colors hover:bg-accent-deep"
                >
                  {t("home_hero.cta_primary")}
                  <Icon name="arrow" className="h-4 w-4 rtl:-scale-x-100" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center rounded-full border-2 border-line-strong px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  {t("home_hero.cta_secondary")}
                </Link>
              </div>
            </div>

            {/* Art-direction slot: adapt to configured aspect ratio and fit. */}
            <div
              className={`relative w-full overflow-hidden rounded-lg bg-v-100 ${getImageAspectClass(
                heroImage.aspect,
              )} ${
                heroImage.aspect === "4/5" || heroImage.aspect === "1/1"
                  ? "max-w-[460px] mx-auto lg:ms-auto"
                  : ""
              }`}
            >
              <Image
                src={heroImage.url}
                alt={
                  ar
                    ? "صورة الواجهة الرئيسية"
                    : "Hero image"
                }
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 540px"
                className={`${getImageFitClass(heroImage.fit)} ${getImagePositionClass(
                  heroImage.position,
                )}`}
                unoptimized={heroImage.url.startsWith("/api/images")}
              />
            </div>
          </div>
        </Wrap>
      </Section>

      {/* ---------- The reality we work on ---------- */}
      <Section>
        <Wrap>
          <div className="mb-10 max-w-[62ch]">
            <h2 className="mb-3 text-h2">{t("home_figures.title")}</h2>
            <p className="text-lead leading-relaxed text-ink-2">
              {t("home_figures.lead")}
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            <Figure
              value="28%"
              label={t("stats_page.percentage_text")}
              source={t("stats_page.source")}
            />
            <Figure
              value="1 / 4"
              label={t("stats_page.detail1")}
              source={t("stats_page.detail1_desc")}
            />
            <Figure
              value="100%"
              label={t("stats_extra.deprivation_title")}
              source={t("stats_extra.deprivation_desc")}
            />
          </div>
        </Wrap>
      </Section>

      {/* ---------- Testimony ----------
          A survivor's own words, set large. The strongest thing on the page
          is not an image we do not have — it is this. */}
      <Section className="bg-surface-ink text-on-ink">
        <Wrap>
          <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            <div
              className={`relative overflow-hidden rounded-lg bg-v-900 ${getImageAspectClass(
                testimonyImage.aspect,
              )} ${
                testimonyImage.aspect === "4/5" || testimonyImage.aspect === "1/1"
                  ? "max-w-[460px] mx-auto"
                  : ""
              }`}
            >
              <Image
                src={testimonyImage.url}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 420px"
                className={`${getImageFitClass(
                  testimonyImage.fit,
                )} ${getImagePositionClass(testimonyImage.position)}`}
                unoptimized={testimonyImage.url.startsWith("/api/images")}
              />
            </div>

            <figure className="m-0">
              <Eyebrow className="text-v-300">
                {ar ? "شهادة" : "Testimony"}
              </Eyebrow>
              <blockquote className="mt-5 font-display text-h2 font-medium leading-snug text-on-ink">
                {t("testimonials.quote1")}
              </blockquote>
              <figcaption className="mt-6 border-t border-v-800 pt-5">
                <p className="font-display font-semibold text-on-ink">
                  {t("testimonials.author1_name")}
                </p>
                <p className="mt-1 font-mono text-sm text-on-ink-2">
                  {t("testimonials.author1_title")}
                </p>
              </figcaption>
            </figure>
          </div>
        </Wrap>
      </Section>

      {/* ---------- What we do ---------- */}
      <Section>
        <Wrap>
          <div className="mb-10 max-w-[62ch]">
            <Eyebrow>{t("mission.subtitle")}</Eyebrow>
            <h2 className="mb-3 mt-4 text-h2">{t("mission.title")}</h2>
            <p className="text-lead leading-relaxed text-ink-2">
              {t("mission.description")}
            </p>
          </div>
          <ol className="grid gap-8 sm:grid-cols-3">
            {(["point1", "point2", "point3"] as const).map((key, i) => (
              <li key={key} className="border-s-[3px] border-v-600 ps-5">
                <span className="num text-sm font-semibold text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-h3">{t(`mission.${key}_title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">
                  {t(`mission.${key}_desc`)}
                </p>
              </li>
            ))}
          </ol>
        </Wrap>
      </Section>

      {/* ---------- How we work ---------- */}
      <Section className="bg-surface-alt">
        <Wrap>
          <div className="mb-10 max-w-[62ch]">
            <Eyebrow>{t("about_page.approach_subtitle")}</Eyebrow>
            <h2 className="mt-4 text-h2">{t("about_page.approach_title")}</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {(
              [
                ["megaphone", "card1"],
                ["users", "card2"],
                ["chart", "card3"],
              ] as const
            ).map(([icon, key]) => (
              <div key={key}>
                <Icon name={icon} className="mb-4 h-7 w-7 text-accent" />
                <h3 className="mb-2 text-h3">
                  {t(`about_page.${key}_title`)}
                </h3>
                <p className="text-sm leading-relaxed text-ink-2">
                  {t(`about_page.${key}_desc`)}
                </p>
              </div>
            ))}
          </div>
        </Wrap>
      </Section>

      {/* ---------- Featured campaign ---------- */}
      <Section>
        <Wrap>
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-[52ch]">
              <Eyebrow>
                <Icon name="megaphone" className="h-3.5 w-3.5" />
                {t("nav.campaign")}
              </Eyebrow>
              <h2 className="mt-4 text-h2">{t("campaigns_page.title")}</h2>
            </div>
            <Link
              href="/campaigns"
              className="border-b-2 border-accent pb-0.5 text-sm font-semibold text-accent transition-colors hover:border-ink hover:text-ink"
            >
              {t("campaigns_page.view_campaign")}
            </Link>
          </div>

          <article className="grid items-center gap-8 overflow-hidden rounded-lg border border-line bg-surface lg:grid-cols-[0.85fr_1.15fr]">
            <div
              className={`relative overflow-hidden ${
                campaignImage.aspect === "3/2"
                  ? "aspect-[3/2] lg:aspect-auto lg:h-full lg:min-h-[280px]"
                  : getImageAspectClass(campaignImage.aspect)
              }`}
            >
              <Image
                src={campaignImage.url}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 420px"
                className={`${getImageFitClass(
                  campaignImage.fit,
                )} ${getImagePositionClass(campaignImage.position)}`}
                unoptimized={campaignImage.url.startsWith("/api/images")}
              />
            </div>
            <div className="p-6 sm:p-9">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent-wash px-3 py-1 font-mono text-xs font-semibold text-accent">
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 rounded-full bg-ok"
                />
                {t("campaigns_page.status_active")}
              </p>
              <h3 className="text-h2">
                {ar ? t("campaign.slogan_ar") : t("campaign.slogan_en")}
              </h3>
              <p className="mt-4 max-w-[52ch] leading-relaxed text-ink-2">
                {t("hero.description")}
              </p>
              <Link
                href="/campaigns/before-18"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-surface transition-colors hover:bg-accent-deep"
              >
                {t("campaigns_page.view_campaign")}
                <Icon name="arrow" className="h-4 w-4 rtl:-scale-x-100" />
              </Link>
            </div>
          </article>
        </Wrap>
      </Section>

      {/* ---------- Map ----------
          Real boundaries, real figures — the most substantial visual on the
          site, and one we own rather than borrow. */}
      <Section className="bg-surface-alt">
        <Wrap>
          <div className="mb-10 max-w-[62ch]">
            <Eyebrow>
              <Icon name="pin" className="h-3.5 w-3.5" />
              {ar ? "المحافظات" : "Governorates"}
            </Eyebrow>
            <h2 className="mb-3 mt-4 text-h2">{t("map.title")}</h2>
            <p className="text-lead leading-relaxed text-ink-2">
              {t("home_map.lead")}
            </p>
          </div>
          <IraqMap />
        </Wrap>
      </Section>

      {/* ---------- Expert voice ---------- */}
      <Section>
        <Wrap>
          <figure className="mx-auto m-0 max-w-[68ch] text-center">
            <blockquote className="font-display text-h2 font-medium leading-snug text-ink">
              {t("testimonials.quote2")}
            </blockquote>
            <figcaption className="mt-6">
              <p className="font-display font-semibold text-ink">
                {t("testimonials.author2_name")}
              </p>
              <p className="mt-1 font-mono text-sm text-ink-3">
                {t("testimonials.author2_title")}
              </p>
            </figcaption>
          </figure>
        </Wrap>
      </Section>

      {/* ---------- Latest writing ---------- */}
      {articles.length > 0 && (
        <Section className="bg-surface-alt">
          <Wrap>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-h2">{t("articles.title")}</h2>
              <Link
                href="/blog"
                className="border-b-2 border-accent pb-0.5 text-sm font-semibold text-accent transition-colors hover:border-ink hover:text-ink"
              >
                {t("home_articles.cta")}
              </Link>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => {
                const title = ar ? a.title.ar : (a.title.en ?? a.title.ar);
                const html = ar ? a.content.ar : (a.content.en ?? a.content.ar);
                return (
                  <article key={a._id} className="flex flex-col gap-3">
                    <Link
                      href={`/blog/${a.slug}`}
                      className="group block overflow-hidden rounded-lg bg-v-100"
                    >
                      <div className="relative aspect-4/3">
                        {a.coverImage ? (
                          <Image
                            src={a.coverImage}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 100vw, 380px"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center font-mono text-xs text-ink-3">
                            HerLiberation
                          </div>
                        )}
                      </div>
                    </Link>
                    <time
                      dateTime={a.createdAt}
                      className="font-mono text-xs text-ink-3"
                    >
                      {new Date(a.createdAt).toLocaleDateString(
                        ar ? "ar-IQ" : "en-GB",
                        { year: "numeric", month: "long", day: "numeric" },
                      )}
                    </time>
                    <h3 className="text-h3">
                      <Link
                        href={`/blog/${a.slug}`}
                        className="transition-colors hover:text-accent"
                      >
                        {title}
                      </Link>
                    </h3>
                    <p className="text-sm leading-relaxed text-ink-2">
                      {htmlToText(html, 120)}
                    </p>
                  </article>
                );
              })}
            </div>
          </Wrap>
        </Section>
      )}

      {/* ---------- Supporters Marquee ---------- */}
      <SupportersMarquee />

      {/* ---------- CTA ---------- */}
      <Section className="bg-surface-ink text-on-ink">
        <Wrap>
          <div className="mx-auto max-w-[56ch] text-center">
            <h2 className="mb-4 text-h2 text-on-ink">{t("cta.title")}</h2>
            <p className="mx-auto text-lead leading-relaxed text-on-ink-2">
              {t("cta.description")}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 rounded-full bg-v-300 px-6 py-3.5 text-sm font-semibold text-v-900 transition-colors hover:bg-v-200"
              >
                {t("nav.donate")}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-full border-2 border-v-600 px-6 py-3.5 text-sm font-semibold text-on-ink transition-colors hover:border-v-300 hover:text-v-300"
              >
                {t("nav.contact")}
              </Link>
            </div>
          </div>
        </Wrap>
      </Section>
    </>
  );
}
