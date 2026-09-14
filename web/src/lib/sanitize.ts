import sanitizeHtml from "sanitize-html";

/**
 * Editor output is sanitised on the way IN, once, on the server.
 *
 * The old site escaped everything in middleware and then un-escaped it in the
 * browser before rendering, which meant the only real defence was a
 * client-side library. Sanitising on write keeps the stored document already
 * safe, so rendering is a plain `dangerouslySetInnerHTML` over known-good
 * markup, and a bypass in the browser cannot introduce script.
 */
export function sanitizeArticleHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "p", "br", "strong", "em", "u", "s",
      "h2", "h3", "h4",
      "ul", "ol", "li",
      "blockquote", "hr",
      "a", "img", "figure", "figcaption",
      "code", "pre",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      "*": ["style"],
    },
    // Only text alignment survives from inline styles — everything else in a
    // pasted style attribute is a vector or a visual accident.
    allowedStyles: {
      "*": { "text-align": [/^left$|^right$|^center$|^justify$/] },
    },
    allowedSchemes: ["https", "mailto"],
    allowedSchemesByTag: { img: ["https", "data"] },
    transformTags: {
      // Any external link opens safely, whatever the editor produced.
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, loading: "lazy" },
      }),
    },
  });
}

/** Plain text for excerpts and meta descriptions. */
export function htmlToText(html: string, max = 180): string {
  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}
