/**
 * Where this deployment thinks it lives, and whether search engines are
 * allowed to index it.
 *
 * Indexing is opt-in, not opt-out, and that direction is deliberate. While the
 * old site is still the live one, a second copy of the same Arabic text on a
 * `*.vercel.app` address is duplicate content competing with it in search
 * results. The two failure modes are not symmetrical: forgetting to switch
 * indexing ON costs nothing but a later redeploy, while forgetting to switch
 * it OFF puts a staging copy into the index, where it can outrank the real
 * site and takes weeks to clear. So the default is the recoverable one.
 *
 * Flip it only on the deployment serving the real domain:
 *
 *   NEXT_PUBLIC_ALLOW_INDEXING=1
 *
 * Both values must be inlined at build time, hence NEXT_PUBLIC_: `robots.ts`
 * and `generateMetadata` need them while rendering.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.her-liberation.org";

export const INDEXABLE = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "1";
