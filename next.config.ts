import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the project root here, explicitly.
    //
    // Turbopack finds the root by walking up the tree for a lockfile. It stops
    // at the git boundary, so the stray package-lock.json in the user's home
    // directory is ignored — but it says so on every build, and "inferred"
    // is still a guess. Naming the root costs nothing and makes the answer
    // the same on every machine, including one where that stray file is not
    // outside the repository.
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
