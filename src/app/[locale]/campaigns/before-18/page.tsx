import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Section, Wrap, Eyebrow, Figure } from "@/components/primitives";
import { RightsDashboard } from "@/components/rights-dashboard";
import { IraqMap } from "@/components/iraq-map";
import { SupportersMarquee } from "@/components/supporters-marquee";
import { Poll } from "@/components/poll";
import { ShareRow } from "@/components/share-row";
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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "campaign" });
  return {
    title: locale === "ar" ? "الحملة" : "The Campaign",
    description: t("slogan_ar"),
  };
}

export default async function CampaignPage({
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
    siteImages.campaignBefore18,
    DEFAULT_SITE_IMAGES.campaignBefore18,
  );

  return (
    <>
      {/* ---------- Hero ---------- */}
      <Section className="pb-0 pt-10 sm:pt-16">
        <Wrap>
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <Eyebrow>
                <Icon name="megaphone" className="h-3.5 w-3.5" />
                {ar ? "حملة نشطة" : "Active campaign"}
              </Eyebrow>
              <h1 className="mb-5 mt-4 text-h1">{t("hero.description")}</h1>
              <p className="max-w-[58ch] text-lead leading-relaxed text-ink-2">
                {t("hero_extra.visual_quote")}
              </p>
            </div>
            <div
              className={`relative overflow-hidden rounded-lg bg-v-100 shadow-sm ${getImageAspectClass(
                campaignImage.aspect,
              )} ${
                campaignImage.aspect === "4/5" || campaignImage.aspect === "1/1"
                  ? "max-w-[480px] mx-auto lg:ms-auto"
                  : ""
              }`}
            >
              <Image
                src={campaignImage.url}
                alt={
                  ar
                    ? "حقيبة ودفاتر مدرسية لطفلة عراقية ترمز لحق التعليم والطفولة"
                    : "An Iraqi girl's school backpack and notebooks symbolizing childhood and education"
                }
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className={`${getImageFitClass(
                  campaignImage.fit,
                )} ${getImagePositionClass(campaignImage.position)}`}
                unoptimized={campaignImage.url.startsWith("/api/images")}
              />
            </div>
          </div>
        </Wrap>
      </Section>

      {/* ---------- Figures ---------- */}
      <Section>
        <Wrap>
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

      {/* ---------- Rights by age ---------- */}
      <Section className="bg-surface-alt">
        <Wrap>
          <div className="mb-10 max-w-[62ch]">
            <Eyebrow>
              <Icon name="scales" className="h-3.5 w-3.5" />
              {ar ? "الحقوق حسب العمر" : "Rights by age"}
            </Eyebrow>
            <h2 className="mt-4 text-h2">
              {ar
                ? "ما الذي يمنحه القانون، وما الذي يسلبه"
                : "What the law grants, and what it takes"}
            </h2>
          </div>
          <RightsDashboard />
        </Wrap>
      </Section>

      {/* ---------- Map ---------- */}
      <Section>
        <Wrap>
          <div className="mb-12 max-w-[62ch]">
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

      {/* ---------- Poll ---------- */}
      <Section className="bg-surface-alt">
        <Wrap className="max-w-[820px]!">
          <Poll />
        </Wrap>
      </Section>

      {/* ---------- Supporters Marquee ---------- */}
      <SupportersMarquee />

      {/* ---------- Share ---------- */}
      <Section className="bg-surface-ink text-on-ink">
        <Wrap>
          <div className="mx-auto max-w-[56ch] text-center">
            <h2 className="mb-4 text-h2 text-on-ink">{t("cta.title")}</h2>
            <p className="mx-auto text-lead leading-relaxed text-on-ink-2">
              {t("cta.description")}
            </p>
            <ShareRow />
          </div>
        </Wrap>
      </Section>
    </>
  );
}
