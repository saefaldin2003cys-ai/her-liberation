"use client";

import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ThemeToggle } from "./theme-toggle";
import { LocaleToggle } from "./locale-toggle";
import { Icon } from "./icon";

const NAV = [
  { href: "/", key: "home" },
  { href: "/campaigns", key: "campaign" },
  { href: "/blog", key: "blog" },
  { href: "/programs", key: "tracks" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

export function SiteHeader({ logoUrl }: { logoUrl?: string }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-18 w-full max-w-[1240px] items-center gap-6 px-5 sm:px-8 lg:px-14">
        <Link
          href="/"
          aria-label={locale === "ar" ? "تحريرها - الصفحة الرئيسية" : "HerLiberation - Home"}
          className="flex flex-none items-center py-1 transition-opacity hover:opacity-90"
        >
          <Image
            src={logoUrl || "/brand/logo.png"}
            alt={locale === "ar" ? "شعار تحريرها" : "HerLiberation Logo"}
            width={160}
            height={52}
            className="h-12 sm:h-13 w-auto object-contain"
            priority
            unoptimized={logoUrl?.startsWith("/api/images")}
          />
        </Link>

        <nav
          aria-label={t("home")}
          className={[
            "gap-1 lg:ms-auto lg:flex lg:static lg:translate-y-0 lg:flex-row lg:border-0 lg:bg-transparent lg:p-0",
            "fixed inset-x-0 top-18 flex flex-col border-b border-line bg-surface px-5 pb-6 pt-3 transition-transform duration-300",
            open ? "translate-y-0" : "-translate-y-[130%] lg:translate-y-0",
          ].join(" ")}
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={[
                "rounded-full px-3.5 py-2.5 text-sm transition-colors lg:py-2",
                isActive(item.href)
                  ? "font-semibold text-accent"
                  : "font-medium text-ink-2 hover:bg-accent-wash hover:text-ink",
              ].join(" ")}
            >
              {t(item.key)}
            </Link>
          ))}
          <Link
            href="/donate"
            onClick={() => setOpen(false)}
            className="mt-3 rounded-full bg-accent px-5 py-2.5 text-center text-sm font-semibold text-surface transition-colors hover:bg-accent-deep lg:ms-2 lg:mt-0"
          >
            {t("donate")}
          </Link>
        </nav>

        <div className="flex flex-none items-center gap-2 ms-auto lg:ms-0">
          <ThemeToggle />
          <LocaleToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-2 transition-colors hover:border-accent hover:text-accent lg:hidden"
          >
            <Icon name={open ? "close" : "menu"} className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
