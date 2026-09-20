import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Section, Wrap, PageHeader } from "@/components/primitives";
import { Icon } from "@/components/icon";
import { routing } from "@/i18n/routing";
import { getSiteImages } from "@/lib/site-content";
import {
  normalizeImageSetting,
  DEFAULT_SITE_IMAGES,
  getImageAspectClass,
  getImageFitClass,
  getImagePositionClass,
} from "@/lib/site-content-types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "campaigns_page" });
  return { title: t("title"), description: t("description") };
}

/**
 * The campaigns index.
 *
 * "Under 18" is one campaign the organisation runs, not the organisation
 * itself — so it lives here rather than owning the home page. Adding the next
 * campaign means adding an entry to this list.
 */
export default async function CampaignsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const ar = locale === "ar";
  const siteImages = await getSiteImages();
  const campaignImage = normalizeImageSetting(
    siteImages.campaignsHero || siteImages.campaignBefore18,
    DEFAULT_SITE_IMAGES.campaignBefore18,
  );

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Icon name="megaphone" className="h-3.5 w-3.5" />
            {t("nav.campaign")}
          </>
        }
        title={t("campaigns_page.title")}
        lead={t("campaigns_page.description")}
      />

      <Section>
        <Wrap>
          <article className="grid items-center gap-8 overflow-hidden rounded-lg border border-line bg-surface lg:grid-cols-[0.9fr_1.1fr]">
            <div
              className={`relative overflow-hidden ${
                campaignImage.aspect === "3/2"
                  ? "aspect-4/3 lg:aspect-auto lg:h-full lg:min-h-[340px]"
                  : getImageAspectClass(campaignImage.aspect)
              }`}
            >
              <Image
                src={campaignImage.url}
                alt={ar ? t("campaign.slogan_ar") : t("campaign.slogan_en")}
                fill
                sizes="(max-width: 1024px) 100vw, 480px"
                className={`${getImageFitClass(
                  campaignImage.fit,
                )} ${getImagePositionClass(campaignImage.position)}`}
                unoptimized={campaignImage.url.startsWith("/api/images")}
              />
            </div>

            <div className="p-6 sm:p-10">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent-wash px-3 py-1 font-mono text-xs font-semibold text-accent">
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-1.5 rounded-full bg-ok"
                />
                {t("campaigns_page.status_active")}
              </p>

              <h2 className="text-h2">
                {ar ? t("campaign.slogan_ar") : t("campaign.slogan_en")}
              </h2>

              <p className="mt-4 max-w-[52ch] leading-relaxed text-ink-2">
                {t("hero.description")}
              </p>

              <Link
                href="/campaigns/before-18"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-surface transition-colors hover:bg-accent-deep"
              >
                {t("campaigns_page.view_campaign")}
                <Icon name="arrow" className="h-4 w-4 rtl:-scale-x-100" />
              </Link>
            </div>
          </article>

          {/* Placeholder for the next campaign, so the page reads as a list
              rather than as a single item dressed up as one. */}
          <div className="mt-6 rounded-lg border border-dashed border-line p-10 text-center">
            <p className="text-ink-2">
              {ar
                ? "حملات أخرى قيد الإعداد."
                : "Further campaigns are in preparation."}
            </p>
            <Link
              href="/contact"
              className="mt-3 inline-block border-b-2 border-accent pb-0.5 text-sm font-semibold text-accent transition-colors hover:border-ink hover:text-ink"
            >
              {ar ? "اقترح حملة" : "Propose a campaign"}
            </Link>
          </div>
        </Wrap>
      </Section>
    </>
  );
}
