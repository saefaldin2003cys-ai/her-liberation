import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Section, Wrap, PageHeader } from "@/components/primitives";
import { Icon, type IconName } from "@/components/icon";
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
  const t = await getTranslations({ locale, namespace: "tracks_page" });
  return { title: t("title"), description: t("description") };
}

const TRACKS: { key: string; icon: IconName }[] = [
  { key: "track1", icon: "scales" },
  { key: "track2", icon: "megaphone" },
  { key: "track3", icon: "users" },
  { key: "track4", icon: "graduation" },
];

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

      <Section>
        <Wrap>
          <div className="grid gap-5 sm:grid-cols-2">
            {TRACKS.map((tr) => (
              <article
                key={tr.key}
                className="rounded-lg border border-line bg-surface p-6"
              >
                <Icon name={tr.icon} className="mb-4 h-7 w-7 text-accent" />
                <h2 className="mb-2 text-h3">{t(`${tr.key}_title` as never)}</h2>
                <p className="text-sm leading-relaxed text-ink-2">
                  {t(`${tr.key}_desc` as never)}
                </p>
                <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent-wash px-3 py-1 font-mono text-xs text-accent">
                  {ar ? "قيد التطوير" : "In development"}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-10 max-w-[56ch] text-ink-3">{t("coming_soon")}</p>

          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 border-b-2 border-accent pb-0.5 font-semibold text-accent transition-colors hover:border-ink hover:text-ink"
          >
            {ar ? "تواصل معنا للمشاركة" : "Get in touch to take part"}
            <Icon name="arrow" className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
        </Wrap>
      </Section>
    </>
  );
}
