import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const SOCIAL = [
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61584357966361" },
  { label: "X", href: "https://x.com/Herliberation1" },
  { label: "Instagram", href: "https://www.instagram.com/herliberation1/" },
  { label: "TikTok", href: "https://www.tiktok.com/@herliberation1" },
];

export async function SiteFooter({ logoUrl }: { logoUrl?: string }) {
  const t = await getTranslations("nav");
  const tf = await getTranslations("footer");
  const locale = await getLocale();
  const ar = locale === "ar";

  return (
    <footer className="bg-surface-ink py-16 text-on-ink-2">
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-4 flex items-center">
              <Image
                src={logoUrl || "/brand/logo.png"}
                alt={ar ? "شعار تحريرها" : "HerLiberation Logo"}
                width={240}
                height={80}
                className="h-16 sm:h-20 w-auto object-contain"
                unoptimized={logoUrl?.startsWith("/api/images")}
              />
            </div>
            <p className="max-w-[34ch] text-sm leading-relaxed">
              {ar
                ? "منصة وطنية عراقية للمناصرة والتوعية، تعمل على حماية حقوق الطفولة ورفع الحد الأدنى لسن الزواج."
                : "An Iraqi advocacy and awareness platform working to protect children’s rights and raise the minimum age of marriage."}
            </p>
          </div>

          <FooterCol title={ar ? "المنصة" : "Platform"}>
            <FooterLink href="/">{t("home")}</FooterLink>
            <FooterLink href="/campaigns">{t("campaign")}</FooterLink>
            <FooterLink href="/blog">{t("blog")}</FooterLink>
            <FooterLink href="/programs">{t("tracks")}</FooterLink>
          </FooterCol>

          <FooterCol title={ar ? "عن المنصة" : "About"}>
            <FooterLink href="/about">{t("about")}</FooterLink>
            <FooterLink href="/contact">{t("contact")}</FooterLink>
            <FooterLink href="/donate">{t("donate")}</FooterLink>
            <FooterLink href="/credits">
              {ar ? "المصادر والحقوق" : "Credits"}
            </FooterLink>
          </FooterCol>

          <FooterCol title={tf("follow_us")}>
            {SOCIAL.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm transition-colors hover:text-on-ink"
              >
                {s.label}
              </a>
            ))}
          </FooterCol>
        </div>

        <div className="mt-12 border-t border-v-800 pt-6 text-center text-xs">
          <p>{tf("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-3 font-mono text-xs font-medium uppercase tracking-[0.14em] text-v-300">
        {title}
      </h4>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="text-sm transition-colors hover:text-on-ink">
      {children}
    </Link>
  );
}
