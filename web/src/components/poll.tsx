"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "./icon";

type Results = {
  agree18: number;
  disagree: number;
  total: number;
  alreadyVoted: boolean;
};

export function Poll() {
  const t = useTranslations("poll");
  const [results, setResults] = useState<Results | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/poll")
      .then((r) => r.json())
      .then(setResults)
      .catch(() => setResults(null));
  }, []);

  async function vote(choice: "agree18" | "disagree") {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Vote failed");
      setResults({ ...data, alreadyVoted: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const voted = results?.alreadyVoted ?? false;
  const total = results?.total ?? 0;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return (
    <div className="rounded-lg border border-line bg-surface p-6 sm:p-8">
      <h3 className="text-h3">{t("title")}</h3>
      <p className="mt-2 max-w-[56ch] text-ink-2">{t("question")}</p>

      {!voted && (
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => vote("agree18")}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-surface transition-colors hover:bg-accent-deep disabled:opacity-50"
          >
            <Icon name="check" className="h-4 w-4" />
            {t("agree")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => vote("disagree")}
            className="inline-flex items-center gap-2 rounded-full border-2 border-line-strong px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {t("disagree")}
          </button>
        </div>
      )}

      {voted && results && (
        <div className="mt-6">
          <p className="mb-5 text-sm font-semibold text-ok">{t("thanks")}</p>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.12em] text-ink-3">
            {t("results_title")}
          </p>

          <Bar
            label={t("agree_label")}
            value={results.agree18}
            pct={pct(results.agree18)}
            tone="accent"
          />
          <Bar
            label={t("disagree_label")}
            value={results.disagree}
            pct={pct(results.disagree)}
            tone="muted"
          />

          <p className="mt-4 font-mono text-xs text-ink-3">
            {total} {t("title_short")}
          </p>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm text-bad">
          {error}
        </p>
      )}
    </div>
  );
}

function Bar({
  label,
  value,
  pct,
  tone,
}: {
  label: string;
  value: number;
  pct: number;
  tone: "accent" | "muted";
}) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="num text-sm font-semibold text-ink-2">
          {pct}% <span className="text-ink-3">({value})</span>
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-surface-alt">
        <div
          className={`h-full rounded-full ${
            tone === "accent" ? "bg-accent" : "bg-v-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
