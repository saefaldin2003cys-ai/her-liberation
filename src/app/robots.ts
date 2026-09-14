import type { MetadataRoute } from "next";
import { INDEXABLE, SITE_URL } from "@/lib/site";

/**
 * Serves /robots.txt.
 *
 * The `noindex` meta tag in the page head is not enough on its own: it only
 * works once a crawler has fetched the page, and some crawlers cache an old
 * copy or ignore it. robots.txt stops the fetch. Both are set, from the same
 * flag, so they cannot disagree.
 */
export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/ar/admin", "/en/admin"] }],
    host: SITE_URL,
  };
}
