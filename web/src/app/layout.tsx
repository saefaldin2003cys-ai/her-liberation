import type { ReactNode } from "react";

/**
 * The real document shell lives in `[locale]/layout.tsx`, because `lang` and
 * `dir` depend on the locale segment. This root only exists to satisfy the
 * App Router's requirement that a root layout is present.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
