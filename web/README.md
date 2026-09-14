# تحريرها — HerLiberation

Next.js rebuild of the campaign site.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4, tokens derived from the brand mark |
| i18n | `next-intl` — Arabic and English each have real URLs (`/ar`, `/en`) |
| Database | MongoDB Atlas (free M0) via the official driver, Node runtime |
| Images | Cloudinary (free tier) |
| Editor | Tiptap, bilingual with per-language text direction |
| Hosting | Render web service; Cloudflare proxies the domain in front of it |

MongoDB cannot be reached from the Cloudflare Workers runtime — the driver
needs `net.Socket`/`tls.TLSSocket`, and the Atlas Data API was retired in
September 2025. Route handlers therefore run on Node (`export const runtime =
"nodejs"`), which rules out Cloudflare Pages and calls for an ordinary Node
host. The site already had one: Render, where the previous version ran, so the
new app replaces it in the same service and the domain never moves.

## Running locally

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Open <http://localhost:3000> — `/` redirects to `/ar`.

### Environment

All values are documented in `.env.example`. The two you must generate:

```bash
# session signing key
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"

# admin password hash — store the hash, never the password
node -e "console.log(require('bcryptjs').hashSync('YOUR-PASSWORD', 12))"
```

The site degrades gracefully without a database: pages render, and the blog
and API report that no database is configured rather than crashing.

## Admin

`/ar/admin` — password only, no user accounts. The session is a signed,
httpOnly cookie; nothing about the credential is readable from JavaScript.

The editor writes HTML, which is sanitised **on the server, on save**
(`src/lib/sanitize.ts`). Rendering therefore reads already-safe markup.

## The map

`src/data/iraq-map.ts` is generated, not hand-written.

- **Source**: geoBoundaries gbOpen IRQ ADM1 (2022), CC0 1.0 public domain.
- **Projection**: Albers Equal Area Conic, standard parallels 30.39°N and
  35.94°N, central meridian 43.70°E.

Equal-area is deliberate: the map asks the reader to compare rates between
governorates, so their relative sizes must not be distorted.

Only governorates with **both a rate and a source** are shaded
(`src/data/provinces.ts`). Everything else renders hatched as "no data". The
previous dataset carried invented rates for 13 of the 18 governorates, tagged
`[وهمي]` in its own source file while being shown to visitors as findings.

## Project layout

```
src/
  app/[locale]/         pages — home, blog, blog/[slug], admin
  app/api/              route handlers (Node runtime)
  components/           UI, including admin/ for the editor
  data/                 generated map + province figures
  i18n/                 routing, navigation, request config
  lib/                  mongodb, articles, auth, sanitize
messages/               ar.json, en.json — one key set, kept in sync
```
