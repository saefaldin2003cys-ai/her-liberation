import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Section, Wrap } from "./primitives";

export const SUPPORTERS = [
  {
    id: "unicef",
    name: "UNICEF",
    nameAr: "منظمة الأمم المتحدة للطفولة (اليونيسف)",
    src: "/supporters/unicef.svg",
    width: 130,
    height: 36,
    className: "h-9 w-auto object-contain",
  },
  {
    id: "hrw",
    name: "Human Rights Watch",
    nameAr: "منظمة هيومن رايتس ووتش",
    src: "/supporters/hrw.svg",
    width: 64,
    height: 64,
    className: "h-11 w-auto rounded-xs object-contain",
  },
  {
    id: "iraqi-women",
    name: "Iraqi Women Network",
    nameAr: "شبكة النساء العراقيات",
    src: "/supporters/iraqi-women-network.jpg",
    width: 90,
    height: 52,
    className: "h-11 w-auto rounded-xs object-contain",
  },
  {
    id: "minors-care",
    name: "Iraqi Directorate of Minor Care",
    nameAr: "دائرة رعاية القاصرين - جمهورية العراق",
    src: "/supporters/iraq-justice.svg",
    width: 50,
    height: 50,
    className: "h-11 w-auto object-contain",
  },
  {
    id: "no-child-marriage",
    name: "Stop Child Marriage Campaign",
    nameAr: "حملة لا لزواج القاصرات",
    src: "/supporters/no-child-marriage.svg",
    width: 140,
    height: 48,
    className: "h-10 w-auto object-contain",
  },
] as const;

export async function SupportersMarquee() {
  const t = await getTranslations("supporters");
  const locale = await getLocale();
  const ar = locale === "ar";

  // Duplicate list twice to allow seamless infinite looping
  const items = [...SUPPORTERS, ...SUPPORTERS, ...SUPPORTERS];

  return (
    <Section className="overflow-hidden py-10! sm:py-14!">
      <Wrap>
        <h2 className="mb-6 text-center font-mono text-xs uppercase tracking-[0.14em] text-ink-3">
          {t("title")}
        </h2>

        <div className="marquee-mask relative w-full overflow-hidden py-3">
          <div className="animate-marquee flex items-center gap-6 sm:gap-10">
            {items.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                title={ar ? item.nameAr : item.name}
                className="group flex h-20 min-w-[140px] sm:min-w-[170px] items-center justify-center rounded-xl border border-line bg-surface px-5 py-3 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-xs"
              >
                <Image
                  src={item.src}
                  alt={ar ? item.nameAr : item.name}
                  width={item.width}
                  height={item.height}
                  className={`${item.className} opacity-85 transition-opacity duration-200 group-hover:opacity-100`}
                />
              </div>
            ))}
          </div>
        </div>
      </Wrap>
    </Section>
  );
}
