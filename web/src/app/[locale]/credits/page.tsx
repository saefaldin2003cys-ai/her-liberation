import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Section, Wrap, PageHeader } from "@/components/primitives";
import { ALL_CREDITS } from "@/data/photo-credits";
import { IRAQ_MAP } from "@/data/iraq-map";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "المصادر والحقوق" : "Credits and sources",
    robots: { index: true, follow: true },
  };
}

/**
 * Attribution page.
 *
 * The photographs are CC BY-SA, which requires naming the author and the
 * licence. Collecting that here — rather than only in a caption — also lets
 * the site state plainly where its map data comes from and that none of its
 * imagery is AI-generated.
 */
export default async function CreditsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await getTranslations();
  const ar = locale === "ar";

  return (
    <>
      <PageHeader
        title={ar ? "المصادر والحقوق" : "Credits and sources"}
        lead={
          ar
            ? "كل صورة على هذا الموقع فوتوغرافية وموثّقة ومرخّصة ترخيصاً مفتوحاً. لا نستخدم صوراً مولّدة بالذكاء الاصطناعي، ولا صوراً يظهر فيها أطفال يمكن التعرّف عليهم."
            : "Every photograph on this site is documentary and openly licensed. We do not use AI-generated imagery, and we do not use pictures in which children are identifiable."
        }
      />

      <Section className="pt-4">
        <Wrap>
          <h2 className="mb-6 text-h3">{ar ? "الصور" : "Photographs"}</h2>
          <ul className="grid gap-6 sm:grid-cols-2">
            {ALL_CREDITS.map((c) => (
              <li
                key={c.src}
                className="flex gap-4 rounded-lg border border-line bg-surface p-4"
              >
                <div className="relative h-24 w-24 flex-none overflow-hidden rounded-sm bg-v-100">
                  <Image
                    src={c.src}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-ink">
                    {c.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-2">
                    {ar ? c.note.ar : c.note.en}
                  </p>
                  <p className="mt-2 font-mono text-xs text-ink-3">
                    {c.author} ·{" "}
                    <a
                      href={c.licenseUrl}
                      target="_blank"
                      rel="noopener noreferrer license"
                      className="text-accent underline underline-offset-2"
                    >
                      {c.license}
                    </a>{" "}
                    ·{" "}
                    <a
                      href={c.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline underline-offset-2"
                    >
                      {ar ? "المصدر" : "source"}
                    </a>
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <h2 className="mb-4 mt-12 text-h3">{ar ? "البيانات" : "Data"}</h2>
          <div className="max-w-[68ch] rounded-lg border border-line bg-surface p-5">
            <p className="font-display font-semibold text-ink">
              {ar ? "حدود المحافظات" : "Governorate boundaries"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">
              {ar
                ? `${IRAQ_MAP.source} — مرسومة بإسقاط ${IRAQ_MAP.projection.name} متساوي المساحة، بمتوازيين قياسيين ${IRAQ_MAP.projection.lat1.toFixed(2)}° و${IRAQ_MAP.projection.lat2.toFixed(2)}° شمالاً. تساوي المساحات ضروري هنا لأن الخريطة تقارن نسباً بين المحافظات، فلا يصح تشويه أحجامها النسبية.`
                : `${IRAQ_MAP.source} — drawn on an ${IRAQ_MAP.projection.name} projection with standard parallels ${IRAQ_MAP.projection.lat1.toFixed(2)}°N and ${IRAQ_MAP.projection.lat2.toFixed(2)}°N. Equal-area matters here: the map compares rates between governorates, so their relative sizes must not be distorted.`}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-2">
              {ar
                ? "تُظلَّل المحافظات التي لدينا لها نسبة ومصدر فقط. الباقي يظهر بحالة «لا تتوفر بيانات» بدل أرقام غير موثّقة."
                : "Only governorates for which we hold both a rate and a source are shaded. The rest render as “no data” rather than as unsourced numbers."}
            </p>
          </div>
        </Wrap>
      </Section>
    </>
  );
}
