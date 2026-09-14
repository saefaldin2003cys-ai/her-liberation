"use client";

import { useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { IRAQ_MAP, type Governorate } from "@/data/iraq-map";
import { PROVINCE_DATA, RATE_BINS, binFor } from "@/data/provinces";
import type { Locale } from "@/i18n/routing";

/**
 * Choropleth of Iraq's 18 governorates.
 *
 * Governorates with a sourced rate are shaded on a single-hue scale.
 * Everything else gets the "no data" treatment — a diagonal hatch, which is
 * the cartographic convention — rather than being handed an invented number.
 * A flat pale fill was tried first and read as an empty page, because it sat
 * a hair away from the canvas colour.
 *
 * Each governorate is a button, so the map works from the keyboard and is
 * announced to screen readers.
 */
export function IraqMap() {
  const t = useTranslations("map");
  const locale = useLocale() as Locale;
  const ar = locale === "ar";
  const titleId = useId();
  const hatchId = useId();
  const [selected, setSelected] = useState<Governorate | null>(null);

  const record = selected ? PROVINCE_DATA[selected.name] : undefined;
  const label = (g: Governorate) => (ar ? g.ar : g.en);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
      <figure className="m-0">
        <svg
          viewBox={`0 0 ${IRAQ_MAP.width} ${IRAQ_MAP.height}`}
          className="h-auto w-full overflow-visible"
          role="group"
          aria-labelledby={titleId}
        >
          <title id={titleId}>
            {ar
              ? "خريطة المحافظات العراقية ونسب زواج القاصرات"
              : "Map of Iraqi governorates and child marriage rates"}
          </title>

          <defs>
            <pattern
              id={hatchId}
              width="8"
              height="8"
              patternTransform="rotate(45)"
              patternUnits="userSpaceOnUse"
            >
              <rect width="8" height="8" fill="var(--color-surface-alt)" />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="8"
                stroke="var(--color-line-strong)"
                strokeWidth="2.5"
              />
            </pattern>
          </defs>

          {IRAQ_MAP.regions.map((g) => {
            const rec = PROVINCE_DATA[g.name];
            const active = selected?.id === g.id;
            return (
              <path
                key={g.id}
                d={g.d}
                fill={rec ? binFor(rec.rate).token : `url(#${hatchId})`}
                stroke={
                  active ? "var(--color-ink)" : "var(--color-line-strong)"
                }
                strokeWidth={active ? 5 : 1.8}
                strokeLinejoin="round"
                tabIndex={0}
                role="button"
                aria-pressed={active}
                aria-label={
                  rec
                    ? `${label(g)} — ${rec.rate}%`
                    : `${label(g)} — ${t("no_data")}`
                }
                className="cursor-pointer outline-none transition-[stroke-width,stroke] duration-150 hover:[stroke:var(--color-ink)] hover:[stroke-width:4] focus-visible:[stroke:var(--color-ink)] focus-visible:[stroke-width:5]"
                onClick={() => setSelected(active ? null : g)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(active ? null : g);
                  }
                }}
              />
            );
          })}
        </svg>

        <figcaption className="mt-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {RATE_BINS.map((b) => (
              <span
                key={b.min}
                className="inline-flex items-center gap-2 font-mono text-xs text-ink-3"
              >
                <span
                  className="inline-block h-3 w-6 rounded-[2px] border border-line-strong"
                  style={{ background: b.token }}
                />
                {b.max === 100 ? `${b.min}%+` : `${b.min}–${b.max}%`}
              </span>
            ))}
            <span className="inline-flex items-center gap-2 font-mono text-xs text-ink-3">
              <span
                className="inline-block h-3 w-6 rounded-[2px] border border-line-strong"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, var(--color-line-strong) 0 2px, var(--color-surface-alt) 2px 5px)",
                }}
              />
              {t("no_data")}
            </span>
          </div>
          <p className="mt-4 max-w-[56ch] font-mono text-xs leading-relaxed text-ink-3">
            {t("source_note")}
          </p>
        </figcaption>
      </figure>

      <aside className="lg:sticky lg:top-28">
        <div className="rounded-lg border border-line bg-surface p-6">
          {!selected && <p className="text-ink-3">{t("select_province")}</p>}

          {selected && (
            <>
              <h3 className="text-h3">{label(selected)}</h3>

              {record ? (
                <>
                  <p className="num mt-3 text-[3rem] font-bold leading-none text-data">
                    {record.rate}%
                  </p>
                  <dl className="mt-5 flex flex-col gap-3 text-sm">
                    <Row label={t("rate_label")} value={`${record.rate}%`} />
                    <Row
                      label={t("type_label")}
                      value={ar ? record.pattern.ar : record.pattern.en}
                    />
                    <Row
                      label={ar ? "المصدر:" : "Source:"}
                      value={ar ? record.source.ar : record.source.en}
                    />
                  </dl>
                  {record.story && (
                    <p className="mt-5 border-t border-line pt-5 leading-relaxed text-ink-2">
                      {ar ? record.story.ar : record.story.en}
                    </p>
                  )}
                </>
              ) : (
                <div className="mt-4">
                  <p className="font-semibold text-ink-2">{t("no_data")}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-3">
                    {t("no_data_note")}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="min-w-[7ch] flex-none text-ink-3">{label}</dt>
      <dd className="m-0 font-semibold text-ink">{value}</dd>
    </div>
  );
}
