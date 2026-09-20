import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Section, Wrap, Eyebrow } from "@/components/primitives";
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
  const t = await getTranslations({ locale, namespace: "about_page" });
  return { title: t("title"), description: t("description") };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about_page" });
  const siteImages = await getSiteImages();
  const aboutHero = normalizeImageSetting(
    siteImages.aboutHero,
    DEFAULT_SITE_IMAGES.aboutHero,
  );

  return (
    <>
      {/* Hero section */}
      <Section className="pb-0 pt-10 sm:pt-16">
        <Wrap>
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <Eyebrow>{t("eyebrow")}</Eyebrow>
              <h1 className="sr-only">{t("title")}</h1>
              <p className="mt-4 max-w-[58ch] text-lead font-medium leading-relaxed text-ink">
                {t("description")}
              </p>
            </div>
            <div
              className={`relative overflow-hidden rounded-lg bg-v-100 shadow-sm ${getImageAspectClass(
                aboutHero.aspect,
              )} ${
                aboutHero.aspect === "4/5" || aboutHero.aspect === "1/1"
                  ? "max-w-[460px] mx-auto lg:ms-auto"
                  : ""
              }`}
            >
              <Image
                src={aboutHero.url}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 440px"
                className={`${getImageFitClass(
                  aboutHero.fit,
                )} ${getImagePositionClass(aboutHero.position)}`}
                unoptimized={aboutHero.url.startsWith("/api/images")}
              />
            </div>
          </div>
        </Wrap>
      </Section>

      {/* Mission & Vision */}
      <Section>
        <Wrap>
          <div className="mb-10 max-w-[62ch]">
            <h2 className="text-h2">{t("mission_vision_title")}</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-lg border border-line bg-surface p-8 shadow-xs">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-sm bg-v-100 text-accent">
                <Icon name="heart" className="h-5 w-5" />
              </div>
              <h3 className="mb-3 text-h3 font-semibold text-ink">
                {t("mission_title")}
              </h3>
              <p className="text-lead leading-relaxed text-ink-2">
                {t("mission_desc")}
              </p>
            </div>

            <div className="rounded-lg border border-line bg-surface p-8 shadow-xs">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-sm bg-v-100 text-accent">
                <Icon name="lightbulb" className="h-5 w-5" />
              </div>
              <h3 className="mb-3 text-h3 font-semibold text-ink">
                {t("vision_title")}
              </h3>
              <p className="text-lead leading-relaxed text-ink-2">
                {t("vision_desc")}
              </p>
            </div>
          </div>
        </Wrap>
      </Section>

      {/* How we work */}
      <Section className="bg-surface-ink text-on-ink">
        <Wrap>
          <div className="mb-12 max-w-[62ch]">
            <Eyebrow className="text-v-300">
              {t("approach_subtitle")}
            </Eyebrow>
            <h2 className="mt-4 text-h2 text-on-ink">
              {t("approach_title")}
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {(
              [
                ["megaphone", "card1"],
                ["graduation", "card2"],
                ["pen", "card3"],
              ] as const
            ).map(([icon, k]) => (
              <div key={k} className="rounded-lg bg-white/5 p-6 backdrop-blur-sm">
                <Icon name={icon} className="mb-4 h-7 w-7 text-v-300" />
                <h3 className="mb-2 text-h3 text-on-ink">
                  {t(`${k}_title`)}
                </h3>
                <p className="text-sm leading-relaxed text-on-ink-2">
                  {t(`${k}_desc`)}
                </p>
              </div>
            ))}
          </div>
        </Wrap>
      </Section>

      {/* Core Belief / Quote */}
      <Section>
        <Wrap>
          <blockquote className="mx-auto max-w-[64ch] border-s-[3px] border-accent ps-6 font-display text-h3 font-medium leading-snug text-ink">
            {t("quote")}
          </blockquote>
        </Wrap>
      </Section>
    </>
  );
}
