import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Next 16 renamed the `middleware` file convention to `proxy`. next-intl
 * still ships its factory from the `next-intl/middleware` module path.
 *
 * Adds the locale prefix to any path that does not already carry one, so
 * every page exists at a real URL under /ar and /en.
 */
export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals, and anything that looks like a file
  // (the `\\.` is a literal dot once the string is parsed).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
