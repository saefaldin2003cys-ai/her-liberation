import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Section, Wrap } from "@/components/primitives";
import { Icon } from "@/components/icon";

export default async function NotFound() {
  const t = await getTranslations("error_page");

  return (
    <Section>
      <Wrap>
        <div className="mx-auto max-w-[48ch] py-10 text-center">
          <p className="num text-[clamp(4rem,14vw,9rem)] font-bold leading-none text-accent-soft">
            404
          </p>
          <h1 className="mt-4 text-h2">{t("title")}</h1>
          <p className="mx-auto mt-3 text-ink-2">{t("message")}</p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-surface transition-colors hover:bg-accent-deep"
          >
            {t("back_home")}
            <Icon name="arrow" className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
        </div>
      </Wrap>
    </Section>
  );
}
