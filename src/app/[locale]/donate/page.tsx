import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Section, Wrap, PageHeader } from "@/components/primitives";
import { Icon, type IconName } from "@/components/icon";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "donate_page" });
  return { title: t("title"), description: t("description") };
}

const PURPOSES: { key: string; icon: IconName }[] = [
  { key: "purpose1", icon: "book" },
  { key: "purpose2", icon: "scales" },
  { key: "purpose3", icon: "users" },
];

export default async function DonatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("donate_page");
  const tn = await getTranslations("nav");

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <Icon name="heart" className="h-3.5 w-3.5" />
            {tn("donate")}
          </>
        }
        title={t("title")}
        lead={t("description")}
      />

      <Section>
        <Wrap>
          <h2 className="mb-12 text-h2">{t("purposes_title")}</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {PURPOSES.map((p) => (
              <div key={p.key} className="border-s-[3px] border-v-600 ps-5">
                <Icon name={p.icon} className="mb-3 h-6 w-6 text-accent" />
                <h3 className="mb-2 text-h3">{t(`${p.key}_title` as never)}</h3>
                <p className="text-sm leading-relaxed text-ink-2">
                  {t(`${p.key}_desc` as never)}
                </p>
              </div>
            ))}
          </div>
        </Wrap>
      </Section>

      <Section className="bg-surface-ink text-on-ink">
        <Wrap>
          <div className="mx-auto max-w-[56ch] text-center">
            <h2 className="mb-4 text-h2 text-on-ink">{t("how_to_title")}</h2>
            <p className="mx-auto text-lead leading-relaxed text-on-ink-2">
              {t("how_to_desc")}
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-v-300 px-6 py-3.5 text-sm font-semibold text-v-900 transition-colors hover:bg-v-200"
            >
              {t("contact_btn")}
              <Icon name="arrow" className="h-4 w-4 rtl:-scale-x-100" />
            </Link>
          </div>
        </Wrap>
      </Section>
    </>
  );
}
