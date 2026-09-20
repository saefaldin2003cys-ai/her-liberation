"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Icon } from "./icon";
import {
  AGE_MAX,
  AGE_MIN,
  BRACKETS,
  IMPACT_TONE,
  RIGHTS,
  STATUS_STYLE,
  bracketFor,
  type RightKey,
} from "@/data/rights";

/**
 * Move the age, watch the rights change.
 *
 * Details open in a panel beside the cards rather than inside them. Expanding
 * in place made one card grow to three times its neighbours' height, and the
 * long entries (marriage at 9) pushed the rest of the section off screen.
 *
 * The dashboard also renders its initial state on mount rather than waiting
 * for the visitor to touch the slider — the previous site left this section
 * blank until the first interaction.
 */
export function RightsDashboard() {
  const t = useTranslations();
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [age, setAge] = useState(9);
  const [selected, setSelected] = useState<RightKey | null>(null);

  const bracket = bracketFor(age);
  const rights = RIGHTS[bracket];
  const impacts = (t.raw(`impact_data.${bracket}`) ?? []) as { text: string }[];
  const tone = IMPACT_TONE[bracket];
  const pct = ((age - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100;

  // The selected right may not exist in the new bracket after the age moves.
  const active = rights.find((r) => r.key === selected) ?? null;

  function setAgeAndKeep(next: number) {
    setAge(next);
  }

  return (
    <div>
      {/* ---- age control ---- */}
      <div className="rounded-lg border border-line bg-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="text-h3">{t("age_selector.title")}</h3>
            <p className="mt-1 max-w-[48ch] text-sm text-ink-3">
              {t("age_selector_extra.description")}
            </p>
          </div>
          <p className="num text-[3.5rem] font-bold leading-none text-accent">
            {age}
            <span className="ms-2 align-middle text-base font-medium text-ink-3">
              {t("age_selector.years")}
            </span>
          </p>
        </div>

        <label className="mt-6 block">
          <span className="sr-only">{t("age_selector.title")}</span>
          <input
            type="range"
            min={AGE_MIN}
            max={AGE_MAX}
            step={1}
            value={age}
            onChange={(e) => setAgeAndKeep(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full outline-none py-1 [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-surface [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:shadow-md [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-surface [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-md"
            style={{
              background: isRtl
                ? `linear-gradient(to left, var(--color-accent) ${pct}%, var(--color-line) ${pct}%)`
                : `linear-gradient(to right, var(--color-accent) ${pct}%, var(--color-line) ${pct}%)`,
            }}
          />
        </label>

        {/* Scale Ticks / Key Milestones */}
        <div className="relative mt-2 h-5 select-none font-mono text-xs font-medium text-ink-3">
          <span className={`absolute ${isRtl ? "right-0" : "left-0"}`}>
            {t("age_selector_extra.years_9")}
          </span>
          <span
            className="absolute -translate-x-1/2 rtl:translate-x-1/2"
            style={{ [isRtl ? "right" : "left"]: "66.67%" }}
          >
            {t("age_selector_extra.years_15")}
          </span>
          <span className={`absolute ${isRtl ? "left-0" : "right-0"}`}>
            {t("age_selector_extra.years_18")}
          </span>
        </div>

        {/* The three brackets the law actually recognises. */}
        <div className="mt-5 flex flex-wrap gap-2">
          {BRACKETS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setAgeAndKeep(b)}
              aria-pressed={bracket === b}
              className={[
                "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                bracket === b
                  ? "border-accent bg-accent text-surface"
                  : "border-line text-ink-2 hover:border-accent hover:text-accent",
              ].join(" ")}
            >
              {t(`age_selector_extra.years_${b}` as never)}
            </button>
          ))}
        </div>
      </div>

      {/* ---- cards + detail panel ---- */}
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid items-start gap-5 sm:grid-cols-2">
          {rights.map(({ key, status, icon }) => {
            const style = STATUS_STYLE[status];
            const isActive = selected === key;
            return (
              <article
                key={key}
                className={[
                  "flex flex-col rounded-lg border bg-surface p-5 transition-colors",
                  isActive ? "border-accent" : style.ring,
                ].join(" ")}
              >
                <Icon name={icon} className="mb-3 h-6 w-6 text-accent" />
                <h4 className="font-display text-base font-semibold text-ink">
                  {t(`rights_data.${bracket}.${key}.title` as never)}
                </h4>

                <p
                  className={`mt-2 inline-flex items-center gap-2 text-sm font-semibold ${style.text}`}
                >
                  <span
                    aria-hidden
                    className={`inline-block h-2 w-2 rounded-full ${style.dot}`}
                  />
                  {t(`rights_data.${bracket}.${key}.statusLabel` as never)}
                </p>

                <p className="mt-3 text-sm leading-relaxed text-ink-2">
                  {t(`rights_data.${bracket}.${key}.description` as never)}
                </p>

                <button
                  type="button"
                  onClick={() => setSelected(isActive ? null : key)}
                  aria-pressed={isActive}
                  aria-controls="right-detail"
                  className={[
                    "mt-4 self-start border-b-2 pb-0.5 text-sm font-semibold transition-colors",
                    isActive
                      ? "border-ink text-ink"
                      : "border-accent text-accent hover:border-ink hover:text-ink",
                  ].join(" ")}
                >
                  {isActive ? (
                    <>
                      <Icon name="close" className="me-1 inline h-3 w-3" />
                      {locale === "ar" ? "إخفاء التفاصيل" : "Hide details"}
                    </>
                  ) : (
                    t("rights.view_details")
                  )}
                </button>

                {/* Mobile Inline Accordion: expands directly below the card on mobile */}
                {isActive && (
                  <div className="mt-4 border-t border-line pt-4 lg:hidden">
                    <p className="text-sm leading-relaxed text-ink-2">
                      {t(`rights_data.${bracket}.${key}.details` as never)}
                    </p>
                    <p className="mt-4 font-mono text-xs uppercase tracking-[0.12em] text-ink-3">
                      {t("rights.legal_reference")}
                    </p>
                    <div
                      className="mt-1 border-t border-line pt-2 text-sm leading-relaxed text-ink-2 [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2"
                      dangerouslySetInnerHTML={{
                        __html: t.raw(
                          `rights_data.${bracket}.${key}.law`,
                        ) as string,
                      }}
                    />
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <aside
          id="right-detail"
          aria-live="polite"
          className="hidden rounded-lg border border-line bg-surface p-6 lg:block lg:sticky lg:top-28"
        >
          {!active && (
            <p className="text-ink-3">{t("rights.select_prompt")}</p>
          )}

          {active && (
            <>
              <Icon name={active.icon} className="mb-3 h-7 w-7 text-accent" />
              <h4 className="text-h3">
                {t(`rights_data.${bracket}.${active.key}.title` as never)}
              </h4>

              <p
                className={`mt-2 inline-flex items-center gap-2 text-sm font-semibold ${STATUS_STYLE[active.status].text}`}
              >
                <span
                  aria-hidden
                  className={`inline-block h-2 w-2 rounded-full ${STATUS_STYLE[active.status].dot}`}
                />
                {t(
                  `rights_data.${bracket}.${active.key}.statusLabel` as never,
                )}
              </p>

              <p className="mt-4 text-sm leading-relaxed text-ink-2">
                {t(`rights_data.${bracket}.${active.key}.details` as never)}
              </p>

              <p className="mt-5 font-mono text-xs uppercase tracking-[0.12em] text-ink-3">
                {t("rights.legal_reference")}
              </p>
              {/* A fixed, reviewed string in the message catalogue — not user input. */}
              <div
                className="mt-1 border-t border-line pt-3 text-sm leading-relaxed text-ink-2 [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2"
                dangerouslySetInnerHTML={{
                  __html: t.raw(
                    `rights_data.${bracket}.${active.key}.law`,
                  ) as string,
                }}
              />

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="mt-5 text-sm font-semibold text-ink-3 transition-colors hover:text-ink"
              >
                <Icon name="close" className="me-1 inline h-3.5 w-3.5" />
                {t("campaigns_page.back")}
              </button>
            </>
          )}
        </aside>
      </div>

      {/* ---- impacts ---- */}
      <div className="mt-10">
        <h3 className="text-h3">{t("impact_section.title")}</h3>
        <ul className="mt-4 flex flex-wrap gap-3">
          {impacts.map((im, i) => (
            <li
              key={i}
              className={[
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm",
                tone === "bad"
                  ? "border-bad/30 text-bad"
                  : tone === "warn"
                    ? "border-warn/30 text-warn"
                    : "border-ok/30 text-ok",
              ].join(" ")}
            >
              <span
                aria-hidden
                className={`inline-block h-2 w-2 rounded-full ${
                  tone === "bad"
                    ? "bg-bad"
                    : tone === "warn"
                      ? "bg-warn"
                      : "bg-ok"
                }`}
              />
              {im.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
