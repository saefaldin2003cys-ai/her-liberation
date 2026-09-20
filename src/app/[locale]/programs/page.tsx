import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Section, Wrap, PageHeader } from "@/components/primitives";
import { Icon, type IconName } from "@/components/icon";
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
  const t = await getTranslations({ locale, namespace: "tracks_page" });
  return { title: t("title"), description: t("description") };
}

const TRACKS: { key: string; icon: IconName }[] = [
  { key: "track1", icon: "scales" },
  { key: "track2", icon: "megaphone" },
  { key: "track3", icon: "users" },
  { key: "track4", icon: "graduation" },
];

const SPOTLIGHT_FORM_URL = "https://forms.gle/6S6HYpiQro6xPNq4A";

export default async function ProgramsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tracks_page");
  const tn = await getTranslations("nav");
  const ar = locale === "ar";
  const siteImages = await getSiteImages();
  const spotlightImage = normalizeImageSetting(
    siteImages.programSpotlight,
    DEFAULT_SITE_IMAGES.programSpotlight,
  );

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Icon name="graduation" className="h-3.5 w-3.5" />
            {tn("tracks")}
          </>
        }
        title={t("title")}
        lead={t("description")}
      />

      {/* Featured Program: From the Shelf to the Spotlight */}
      <Section className="pt-0">
        <Wrap>
          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-xs transition-all hover:border-accent">
            <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
              <div
                className={`relative w-full overflow-hidden bg-v-50 min-h-[340px] ${
                  spotlightImage.aspect === "3/2"
                    ? "aspect-4/5 sm:aspect-square lg:aspect-auto lg:h-full"
                    : getImageAspectClass(spotlightImage.aspect)
                }`}
              >
                <Image
                  src={spotlightImage.url}
                  alt={t("spotlight_title")}
                  fill
                  sizes="(max-width: 1024px) 100vw, 480px"
                  className={`${
                    spotlightImage.fit === "contain"
                      ? "object-contain p-6 sm:p-8"
                      : "object-cover"
                  } ${getImagePositionClass(spotlightImage.position)}`}
                  priority
                  unoptimized={spotlightImage.url.startsWith("/api/images")}
                />
              </div>

              <div className="p-6 sm:p-8 lg:p-12 lg:ps-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-accent-wash px-3.5 py-1 font-mono text-xs font-semibold text-accent">
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  {t("featured_badge")}
                </span>

                <h2 className="mb-4 mt-4 text-h2 font-bold text-ink">
                  {t("spotlight_title")}
                </h2>

                <p className="text-lead leading-relaxed text-ink-2">
                  {t("spotlight_desc")}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href={SPOTLIGHT_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-surface shadow-xs transition-colors hover:bg-accent-deep"
                  >
                    <span>{t("spotlight_apply")}</span>
                    <Icon name="arrow" className="h-4 w-4 rtl:-scale-x-100" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Wrap>
      </Section>

      {/* Other Tracks */}
      <Section className="bg-surface-alt">
        <Wrap>
          <div className="mb-10 max-w-[62ch]">
            <h3 className="mb-3 text-h2">{t("other_tracks_title")}</h3>
            <p className="text-lead leading-relaxed text-ink-2">
              {t("coming_soon")}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {TRACKS.map((tr) => (
              <article
                key={tr.key}
                className="rounded-lg border border-line bg-surface p-6"
              >
                <Icon name={tr.icon} className="mb-4 h-7 w-7 text-accent" />
                <h4 className="mb-2 text-h3 font-semibold text-ink">
                  {t(`${tr.key}_title` as never)}
                </h4>
                <p className="text-sm leading-relaxed text-ink-2">
                  {t(`${tr.key}_desc` as never)}
                </p>
                <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent-wash px-3 py-1 font-mono text-xs text-accent">
                  {ar ? "قيد التطوير" : "In development"}
                </p>
              </article>
            ))}
          </div>

          <Link
            href="/contact"
            className="mt-10 inline-flex items-center gap-2 border-b-2 border-accent pb-0.5 font-semibold text-accent transition-colors hover:border-ink hover:text-ink"
          >
            {ar ? "تواصل معنا للمشاركة" : "Get in touch to take part"}
            <Icon name="arrow" className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
        </Wrap>
      </Section>
    </>
  );
}
