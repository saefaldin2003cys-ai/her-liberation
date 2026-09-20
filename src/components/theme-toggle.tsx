"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Icon } from "./icon";

/**
 * The initial theme is applied by an inline script in the layout, before
 * first paint. This component observes data-theme to stay in sync across
 * client-side navigations and locale switches.
 */
export function ThemeToggle() {
  const t = useTranslations("header");
  const pathname = usePathname();
  const locale = useLocale();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    function syncTheme() {
      try {
        const saved = localStorage.getItem("theme");
        const current = document.documentElement.getAttribute("data-theme");
        const expected =
          saved === "dark" || saved === "light"
            ? saved
            : current ||
              (window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light");

        if (current !== expected) {
          document.documentElement.setAttribute("data-theme", expected);
        }
        setDark(expected === "dark");
      } catch {
        setDark(document.documentElement.getAttribute("data-theme") === "dark");
      }
    }

    syncTheme();

    const observer = new MutationObserver(() => {
      syncTheme();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const onStorage = (e: StorageEvent) => {
      if (e.key === "theme") {
        syncTheme();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", onStorage);
    };
  }, [pathname, locale]);

  function toggle() {
    const next = dark ? "light" : "dark";
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* private browsing — the choice just will not persist */
    }
    document.documentElement.setAttribute("data-theme", next);
    setDark(next === "dark");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("theme_toggle")}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-2 transition-colors hover:border-accent hover:text-accent"
    >
      <Icon name={dark ? "sun" : "moon"} className="h-[18px] w-[18px]" />
    </button>
  );
}
