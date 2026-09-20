import type { ReactNode } from "react";

/**
 * Vertical rhythm between page sections.
 *
 * Deliberately tighter than it first was: at `py-28` two adjacent sections
 * put 224px of empty space between them, which on pages with short copy read
 * as the page having failed to load rather than as breathing room.
 */
export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-12 sm:py-16 lg:py-20 ${className}`}>
      {children}
    </section>
  );
}

/** The single content column width used across the site. */
export function Wrap({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-14 ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * The header of an inner page: eyebrow, title, one line of standfirst.
 *
 * This is not a `Section` — it sits directly above the page's first section
 * and carries only the padding it needs, so a two-line heading does not open
 * a screen-height gap before the content it introduces.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: ReactNode;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <div className="pb-2 pt-10 sm:pt-14">
      <Wrap>
        <div className="max-w-[62ch]">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className={`text-h1 ${eyebrow ? "mt-4" : ""}`}>{title}</h1>
          {lead && (
            <p className="mt-4 text-lead leading-relaxed text-ink-2">{lead}</p>
          )}
          {children}
        </div>
      </Wrap>
    </div>
  );
}

/** Small label above a heading, with a rule that reads in both directions. */
export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.14em] text-accent ${className}`}
    >
      <span
        aria-hidden="true"
        className="inline-block h-0.5 w-[22px] flex-none bg-current"
      />
      {children}
    </p>
  );
}

/** A figure with its label and the source it came from. */
export function Figure({
  value,
  label,
  source,
}: {
  value: string;
  label: string;
  source: string;
}) {
  return (
    <div className="border-s-[3px] border-v-600 ps-4">
      <p className="num text-[clamp(2.2rem,4.5vw,3.2rem)] font-bold leading-none tracking-tight text-data">
        {value}
      </p>
      <h3 className="mt-3 font-display text-base font-semibold text-ink">
        {label}
      </h3>
      <p className="mt-1 max-w-[34ch] text-sm leading-snug text-ink-3">
        {source}
      </p>
    </div>
  );
}
