import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the project root to this folder.
    //
    // Turbopack infers the root by walking up for a lockfile, and the
    // repository has two: one here and one at the top level, left by the old
    // Express site. Left to guess, it picks the top-level one, treats the whole
    // repository as the project, and warns about it on every start. Worse, on a
    // host that serves files from outside this directory the inferred root can
    // differ from the local one, so module resolution differs between a build
    // that works here and one that fails there.
    root: import.meta.dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
