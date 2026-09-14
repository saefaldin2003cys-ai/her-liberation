"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "تعذّر تسجيل الدخول");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm" dir="rtl">
      <form
        onSubmit={submit}
        className="rounded-lg border border-line bg-surface p-8"
      >
        <Icon name="lock" className="mb-4 h-7 w-7 text-accent" />
        <h1 className="text-h2">لوحة الإدارة</h1>
        <p className="mt-2 text-sm text-ink-3">
          أدخل كلمة المرور للمتابعة.
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          aria-label="كلمة المرور"
          className="mt-6 w-full rounded-xs border border-line bg-canvas px-3 py-3 transition-colors focus:border-accent focus:outline-none"
        />

        {error && (
          <p role="alert" className="mt-3 text-sm text-bad">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-surface transition-colors hover:bg-accent-deep disabled:opacity-50"
        >
          {busy ? "جارٍ التحقق…" : "دخول"}
        </button>
      </form>
    </div>
  );
}
