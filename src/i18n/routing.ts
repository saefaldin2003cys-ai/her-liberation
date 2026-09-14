import { defineRouting } from "next-intl/routing";

/**
 * Arabic is the default and is served from /ar — both languages get a real
 * URL. The previous site kept the choice in localStorage on a single URL,
 * which meant search engines could only ever see the Arabic version.
 */
export const routing = defineRouting({
  locales: ["ar", "en"] as const,
  defaultLocale: "ar",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

export const DIRECTION: Record<Locale, "rtl" | "ltr"> = {
  ar: "rtl",
  en: "ltr",
};
