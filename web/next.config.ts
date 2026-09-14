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
  experimental: {
    // Size the build's worker pool from available memory instead of CPU count.
    //
    // `next build` otherwise spawns one worker per core — seven on this
    // laptop — and each holds its own React renderer. The deploy target is a
    // 512MB container, where that many workers exhaust the heap and the build
    // dies with "JavaScript heap out of memory": a failure that looks like a
    // code error but is only a wrong assumption about the machine.
    memoryBasedWorkersCount: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default withNextIntl(nextConfig);
