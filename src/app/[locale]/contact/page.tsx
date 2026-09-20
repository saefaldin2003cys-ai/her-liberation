import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Section, Wrap } from "@/components/primitives";
import { Icon, type IconName } from "@/components/icon";
import { BrandIcon, type BrandName } from "@/components/brand-icon";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact_page" });
  return { title: t("title"), description: t("description") };
}

const EMAIL = "info@her-liberation.org";

/** Each channel carries its own platform mark, not a generic share glyph. */
const CHANNELS: {
  key: string;
  brand?: BrandName;
  icon?: IconName;
  href: string;
  handle: string;
}[] = [
  { key: "email_title", icon: "mail", href: `mailto:${EMAIL}`, handle: EMAIL },
  {
    key: "facebook_title",
    brand: "facebook",
    href: "https://www.facebook.com/profile.php?id=61584357966361",
    handle: "HerLiberation",
  },
  {
    key: "twitter_title",
    brand: "x",
    href: "https://x.com/Herliberation1",
    handle: "@Herliberation1",
  },
  {
    key: "instagram_title",
    brand: "instagram",
    href: "https://www.instagram.com/herliberation1/",
    handle: "@herliberation1",
  },
  {
    key: "tiktok_title",
    brand: "tiktok",
    href: "https://www.tiktok.com/@herliberation1",
    handle: "@herliberation1",
  },
  {
    key: "threads_title",
    brand: "threads",
    href: "https://www.threads.com/@herliberation1",
    handle: "@herliberation1",
  },
];

const PARTNERS: { key: string; icon: IconName }[] = [
  { key: "partner_ngo", icon: "users" },
  { key: "partner_edu", icon: "graduation" },
  { key: "partner_media", icon: "megaphone" },
  { key: "partner_tech", icon: "chart" },
];

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact_page");

  return (
    <>
      {/* Top Manifesto Section */}
      <Section className="pb-4 pt-12 sm:pt-16">
        <Wrap>
          <div className="mx-auto max-w-[62ch] text-center">
            <h1 className="mb-2 text-h1 font-bold text-ink">
              {t("manifesto_title_1")}
            </h1>
            <p className="mb-4 font-display text-h2 font-medium text-accent">
              {t("manifesto_title_2")}
            </p>
            <p className="mx-auto text-lead leading-relaxed text-ink-2">
              {t("manifesto_desc")}
            </p>
            <div className="mt-8 flex justify-center">
              <a
                href="#contact-methods"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-surface shadow-xs transition-colors hover:bg-accent-deep"
              >
                {t("manifesto_btn_community")}
              </a>
            </div>
          </div>
        </Wrap>
      </Section>

      {/* Partnerships Section */}
      <Section className="bg-surface-alt">
        <Wrap>
          <div className="mb-10 max-w-[62ch]">
            <h2 className="mb-3 text-h2">{t("partnerships_title")}</h2>
            <p className="text-lead leading-relaxed text-ink-2">
              {t("partnerships_desc")}
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PARTNERS.map((p) => (
              <div key={p.key}>
                <Icon name={p.icon} className="mb-3 h-6 w-6 text-accent" />
                <h3 className="mb-2 font-display font-semibold text-ink">
                  {t(`${p.key}_title` as never)}
                </h3>
                <p className="text-sm leading-relaxed text-ink-2">
                  {t(`${p.key}_desc` as never)}
                </p>
              </div>
            ))}
          </div>
        </Wrap>
      </Section>

      {/* Contact Methods / Channels */}
      <Section id="contact-methods">
        <Wrap>
          <div className="mb-10 max-w-[62ch]">
            <h2 className="mb-3 text-h2">{t("title")}</h2>
            <p className="text-lead leading-relaxed text-ink-2">
              {t("description")}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CHANNELS.map((c) => (
              <a
                key={c.key}
                href={c.href}
                target={c.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={
                  c.href.startsWith("mailto:")
                    ? undefined
                    : "noopener noreferrer"
                }
                className="flex items-center gap-4 rounded-lg border border-line bg-surface p-5 transition-colors hover:border-accent"
              >
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-accent-wash text-accent">
                  {c.brand ? (
                    <BrandIcon name={c.brand} className="h-5 w-5" />
                  ) : (
                    <Icon name={c.icon!} className="h-5 w-5" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block font-display font-semibold text-ink">
                    {t(c.key as never)}
                  </span>
                  <span className="block truncate font-mono text-xs text-ink-3">
                    {c.handle}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </Wrap>
      </Section>
    </>
  );
}
