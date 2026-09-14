import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Rubik, IBM_Plex_Sans_Arabic, JetBrains_Mono } from "next/font/google";

import { routing, DIRECTION, type Locale } from "@/i18n/routing";
import { SITE_URL, INDEXABLE } from "@/lib/site";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "../globals.css";

/* Display face — geometric, lightly softened, with Arabic that echoes the
   blocky Kufi of the wordmark. */
const rubik = Rubik({
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rubik",
  display: "swap",
});

/* Running text. */
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-ar",
  display: "swap",
});

/* Figures, so columns of numbers line up. */
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("title"),
      template: `%s | ${locale === "ar" ? "تحريرها" : "HerLiberation"}`,
    },
    description: t("description"),
    alternates: {
      canonical: `/${locale}`,
      languages: { ar: "/ar", en: "/en", "x-default": "/ar" },
    },
    openGraph: {
      type: "website",
      siteName: locale === "ar" ? "تحريرها" : "HerLiberation",
      title: t("title"),
      description: t("description"),
      locale: locale === "ar" ? "ar_IQ" : "en_US",
      url: `/${locale}`,
    },
    twitter: {
      card: "summary_large_image",
      site: "@Herliberation1",
      title: t("title"),
      description: t("description"),
    },
    // Off unless this deployment is the one on the real domain — see lib/site.
    robots: INDEXABLE
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

/* Applied before first paint so the page never flashes the wrong theme. */
const themeScript = `
(function(){try{
  var t=localStorage.getItem('theme');
  if(!t){t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';}
  document.documentElement.setAttribute('data-theme',t);
}catch(e){}
document.documentElement.classList.add('js');})();
`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      dir={DIRECTION[locale as Locale]}
      suppressHydrationWarning
      className={`${rubik.variable} ${plexArabic.variable} ${jetbrains.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-canvas text-ink antialiased">
        <NextIntlClientProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:z-100 focus:m-4 focus:rounded-xs focus:bg-accent focus:px-4 focus:py-3 focus:font-semibold focus:text-surface"
          >
            {locale === "ar" ? "تخطَّ إلى المحتوى" : "Skip to content"}
          </a>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
