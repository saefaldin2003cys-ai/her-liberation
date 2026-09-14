"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "./icon";
import { BrandIcon } from "./brand-icon";

export function ShareRow() {
  const t = useTranslations("cta");
  const ts = useTranslations("share");
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  /**
   * The page URL is read after mount, not during render. Reading
   * `window.location` while rendering gives the server an empty string and the
   * browser the real URL, so React reports a hydration mismatch and discards
   * the server-rendered markup for this subtree.
   */
  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard blocked — the link is in the address bar anyway */
    }
  }

  const text = ts("twitter_text");
  const wa = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`.trim())}`;
  const x = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}${
    url ? `&url=${encodeURIComponent(url)}` : ""
  }`;

  return (
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border-2 border-v-600 px-6 py-3 text-sm font-semibold text-on-ink transition-colors hover:border-v-300 hover:text-v-300"
      >
        <Icon name="share" className="h-4 w-4" />
        {t("share_whatsapp")}
      </a>

      <a
        href={x}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="X"
        className="inline-flex items-center gap-2 rounded-full border-2 border-v-600 px-6 py-3 text-sm font-semibold text-on-ink transition-colors hover:border-v-300 hover:text-v-300"
      >
        <BrandIcon name="x" className="h-4 w-4" />
      </a>

      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-2 rounded-full bg-v-300 px-6 py-3 text-sm font-semibold text-v-900 transition-colors hover:bg-v-200"
      >
        <Icon name="link" className="h-4 w-4" />
        {copied ? t("link_copied") : t("copy_link")}
      </button>
    </div>
  );
}
