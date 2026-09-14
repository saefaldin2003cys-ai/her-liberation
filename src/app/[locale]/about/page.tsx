import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Section, Wrap, Eyebrow } from "@/components/primitives";
import { Icon } from "@/components/icon";
import { routing } from "@/i18n/routing";

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
  const t = await getTranslations();
  const ar = locale === "ar";

  return (
    <>
      <Section className="pb-0 pt-10 sm:pt-16">
        <Wrap>
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
            <div>
              <Eyebrow>{t("mission.subtitle")}</Eyebrow>
              <h1 className="mb-5 mt-4 text-h1">{t("about_page.title")}</h1>
              <p className="max-w-[58ch] text-lead leading-relaxed text-ink-2">
                {t("about_page.description")}
              </p>
            </div>
            <div className="relative aspect-4/3 overflow-hidden rounded-lg bg-v-100">
              {/* Art-direction slot — replace with a documentary photograph. */}
              <Image
                src="/img/kirkuk-classroom.jpg"
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 440px"
                className="object-cover"
              />
            </div>
          </div>
        </Wrap>
      </Section>

      {/* Mission points */}
      <Section>
        <Wrap>
          <div className="mb-12 max-w-[62ch]">
            <h2 className="mb-3 text-h2">{t("mission.title")}</h2>
            <p className="text-lead leading-relaxed text-ink-2">
              {t("mission.description")}
            </p>
          </div>
          <ol className="grid gap-8 sm:grid-cols-3">
            {(["point1", "point2", "point3"] as const).map((k, i) => (
              <li key={k} className="border-s-[3px] border-v-600 ps-5">
                <span className="num text-sm font-semibold text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-h3">{t(`mission.${k}_title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">
                  {t(`mission.${k}_desc`)}
                </p>
              </li>
            ))}
          </ol>
        </Wrap>
      </Section>

      {/* How we work */}
      <Section className="bg-surface-ink text-on-ink">
        <Wrap>
          <div className="mb-12 max-w-[62ch]">
            <Eyebrow className="text-v-300">
              {t("about_page.approach_subtitle")}
            </Eyebrow>
            <h2 className="mt-4 text-h2 text-on-ink">
              {t("about_page.approach_title")}
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {(
              [
                ["megaphone", "card1"],
                ["users", "card2"],
                ["chart", "card3"],
              ] as const
            ).map(([icon, k]) => (
              <div key={k}>
                <Icon name={icon} className="mb-4 h-7 w-7 text-v-300" />
                <h3 className="mb-2 text-h3 text-on-ink">
                  {t(`about_page.${k}_title`)}
                </h3>
                <p className="text-sm leading-relaxed text-on-ink-2">
                  {t(`about_page.${k}_desc`)}
                </p>
              </div>
            ))}
          </div>
        </Wrap>
      </Section>

      <Section>
        <Wrap>
          <blockquote className="mx-auto max-w-[60ch] border-s-[3px] border-accent ps-6 font-display text-h3 font-medium leading-snug text-ink">
            {ar
              ? "قبل الـ18 عامًا: طفلة لا زوجة."
              : "Under 18: a child, not a wife."}
          </blockquote>
        </Wrap>
      </Section>
    </>
  );
}
