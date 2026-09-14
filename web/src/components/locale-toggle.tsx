"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

/** Switches locale while staying on the same page. */
export function LocaleToggle() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const next: Locale = locale === "ar" ? "en" : "ar";

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(() => router.replace(pathname, { locale: next }))
      }
      aria-label={next === "en" ? "Switch to English" : "التبديل إلى العربية"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line font-mono text-[0.72rem] font-semibold text-ink-2 transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
    >
      {next === "en" ? "EN" : "ع"}
    </button>
  );
}
