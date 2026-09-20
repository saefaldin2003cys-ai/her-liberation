import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { getSiteTexts, deepMerge } from "@/lib/site-content";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const baseMessages = (await import(`../../messages/${locale}.json`)).default;
  const dbTexts = await getSiteTexts(locale);

  return {
    locale,
    messages: deepMerge(baseMessages, dbTexts),
  };
});
