/**
 * The rights dashboard.
 *
 * Only the *structure* lives here — which rights exist at which age, and what
 * status each one carries. Every string comes from `messages/*.json` under
 * `rights_data.<age>.<key>`, so the dashboard is translated like the rest of
 * the site rather than carrying its own copy of the text.
 *
 * The law recognises three thresholds, not ten: under 15, 15–17, and 18+.
 * The slider moves year by year but resolves to the bracket the law actually
 * uses — that mismatch is the argument the page is making.
 */

export type RightStatus = "forbidden" | "conditional" | "allowed" | "danger";

export type RightKey =
  | "legalCapacity"
  | "economicRights"
  | "civilRights"
  | "marriage";

export type AgeBracket = 9 | 15 | 18;

export const AGE_MIN = 9;
export const AGE_MAX = 18;

export const BRACKETS: AgeBracket[] = [9, 15, 18];

/** The bracket the law applies to a given age. */
export function bracketFor(age: number): AgeBracket {
  if (age < 15) return 9;
  if (age < 18) return 15;
  return 18;
}

export const RIGHTS: Record<
  AgeBracket,
  { key: RightKey; status: RightStatus; icon: RightIcon }[]
> = {
  9: [
    { key: "legalCapacity", status: "forbidden", icon: "scales" },
    { key: "economicRights", status: "forbidden", icon: "coins" },
    { key: "civilRights", status: "forbidden", icon: "passport" },
    // Marriage at this age is not "forbidden" in the same neutral sense as
    // the others — it happens, and it is the harm the campaign is about.
    { key: "marriage", status: "danger", icon: "heart" },
  ],
  15: [
    { key: "legalCapacity", status: "conditional", icon: "scales" },
    { key: "economicRights", status: "conditional", icon: "coins" },
    { key: "civilRights", status: "forbidden", icon: "passport" },
    { key: "marriage", status: "conditional", icon: "heart" },
  ],
  18: [
    { key: "legalCapacity", status: "allowed", icon: "scales" },
    { key: "economicRights", status: "allowed", icon: "coins" },
    { key: "civilRights", status: "allowed", icon: "school" },
    { key: "marriage", status: "allowed", icon: "ring" },
  ],
};

export type RightIcon =
  | "scales"
  | "coins"
  | "passport"
  | "heart"
  | "school"
  | "ring";

export const STATUS_STYLE: Record<
  RightStatus,
  { dot: string; text: string; ring: string }
> = {
  forbidden: {
    dot: "bg-bad",
    text: "text-bad",
    ring: "border-bad/30",
  },
  danger: {
    dot: "bg-bad",
    text: "text-bad",
    ring: "border-bad/40",
  },
  conditional: {
    dot: "bg-warn",
    text: "text-warn",
    ring: "border-warn/30",
  },
  allowed: {
    dot: "bg-ok",
    text: "text-ok",
    ring: "border-ok/30",
  },
};

/** Impacts listed per bracket; text comes from `impact_data.<age>[i].text`. */
export const IMPACT_TONE: Record<AgeBracket, "bad" | "warn" | "ok"> = {
  9: "bad",
  15: "warn",
  18: "ok",
};
