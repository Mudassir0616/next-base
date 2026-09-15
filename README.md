# Portfolio site base

A Next.js starting point for CMS-driven portfolio and marketing sites. Clone it, point it at a new backend, rebrand one config file, and you have a working site with the pages these projects always need already built: home, blogs (list + detail), careers (list + detail + application form), FAQs, our team, contact, privacy policy, terms, thank-you and 404.

The React components own the layout and the fallback copy. The CMS owns the text, the images and the SEO head tags. Adding a blog post or a job opening is an editor's job, not a deploy.

## Requirements

- **Node.js 20.9+** (Next.js 16 will not run on 18). `.nvmrc` pins 20.19.4 — `nvm use` picks it up.
- A backend exposing the endpoints listed under [What the backend must provide](#what-the-backend-must-provide).

## Getting started

```bash
nvm use                  # or make sure node -v is >= 20.9
npm install
cp .env.example .env     # then edit both URLs
npm run dev              # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server (Turbopack). |
| `npm run build` | Production build. Prerenders every blog and career slug from the CMS, so the backend must be reachable. |
| `npm start` | Serve the production build. |
| `npm run lint` | ESLint. **`next build` no longer lints** — run this separately in CI. |

There is no test suite and no TypeScript.

## Rebranding a clone

Four things, in order:

1. **`.env`** — `NEXT_PUBLIC_API_BASE_URL` (the CMS) and `NEXT_PUBLIC_SITE_URL` (the live domain, no trailing slash). Both are `NEXT_PUBLIC_*`, so they are inlined at build time; changing either needs a rebuild.
2. **[`src/site.config.js`](src/site.config.js)** — brand name, default description, logo, default social card, country, and which routes and CMS collections go into the sitemap. Every `<title>` suffix, canonical, JSON-LD id and robots rule derives from this file. Nothing else in `src/` should hardcode a brand or a domain; if you find yourself typing one, put it here instead.
3. **`public/`** — swap the logo, icons and images. The favicon set `_app.js` links (`/favicon/*`) and the default social card `site.config.js` names are **not** in the repo; add them or update the paths, or you will serve 404s on every page and a dead `og:image`.
4. **`src/styles/main.scss` + `global.scss`** — the design. See [Styles](#styles) for the compile step.

`package.json` still says `guinwa_portfolio`; rename it if it matters to your tooling.

## What the backend must provide

Endpoints are declared once in [`src/api/api.js`](src/api/api.js), each as an `APIBase` instance. The prebuilt pages expect a DRF-style API — `{ count, next, previous, results: [] }`, `?page_size=`, `?order_by=` — at:

| Endpoint | Used by |
| --- | --- |
| `/api/site-setting/` | Global settings: hero titles/images per page, contact details, socials, `global_head`. Fetched once and shared via `useSiteSetting()`. |
| `/api/head/` | Per-route SEO head HTML, matched on `target_url`. |
| `/api/blog/`, `/api/blog-category/` | Blog list and detail. |
| `/api/career/`, `/api/career-category/`, `/api/career-application/` | Careers list, detail, and the application form (multipart resume upload). |
| `/api/faq/`, `/api/faq-category/` | FAQs page. |
| `/api/leadership/` | Our team page. |
| `/api/contact/` | Contact and popup enquiry forms. |
| `/api/testimonial/`, `/api/case-study/` | Declared, not yet wired to a page. |

Records that back a detail page need a `slug`. Blogs and careers also need `created_at` / `updated_at` (used for `lastmod` and article dates), and careers an `is_active` flag — inactive jobs are kept out of the sitemap.

Two CMS authoring conventions the components rely on:

- **Highlighted headings** use square brackets: `"From Strategy to [Operational Excellence]"` renders the bracketed half in the accent colour.
- **Multi-value settings fields** (e.g. several phone numbers) are pipe-separated: `"+91 ... | +91 ..."`.

## SEO

Configured in `site.config.js`, assembled in [`src/utils/seo.js`](src/utils/seo.js), rendered by [`src/components/common/Seo.jsx`](src/components/common/Seo.jsx).

- A record's own CMS `head` always wins. `<Seo>` renders it first, then fills in only the tags it did not already define, so a page can never ship without a title, description, canonical and social card.
- `/sitemap.xml` and `/robots.txt` are **routes**, not files in `public/`, so they follow `NEXT_PUBLIC_SITE_URL` and pick up new CMS records without a deploy. Add a section to the sitemap by adding a collection to `site.config.js`.
- `robots.txt` serves `Disallow: /` to any host that is not the one `NEXT_PUBLIC_SITE_URL` names. Staging and preview deploys are therefore de-indexed by default — set the env var to the real domain at launch, or the live site stays blocked.
- JSON-LD builders for Organization, BreadcrumbList, BlogPosting, Service and JobPosting live in `src/utils/seo.js`; pages pass them to `<Seo jsonLd={[...]} />`.

**Known gap:** only `/blogs/[slug]` and `/careers/[slug]` render `<Seo>`. The other nine pages get head tags only from a matching `/api/head/` record or `global_head`. When you add a page, render `<Seo>` in it.

## Styles

Global CSS, no CSS modules and no Tailwind. `_app.js` imports `src/styles/global.css` and `src/styles/main.css`, but the sources are the `.scss` files beside them — and `sass` is deliberately not a dependency, so **Next does not compile them**. Edit the `.scss`, compile it to the matching `.css` with your own Sass, and commit both. If you only edit the `.scss`, nothing changes in the browser.

## Architecture notes

Pages Router (`src/pages`), `@/*` → `./src/*`. Page files are thin — data fetching and `<Seo>` — and delegate to one component under `src/components/<Feature>/`.

The one rule that will bite you: **server-side code uses `fetchApi()`, client-side code uses the `APIBase` instances.** `APIBase` reads `localStorage` in its request interceptor and throws during SSR.

[CLAUDE.md](CLAUDE.md) has the full architecture tour — conventions, the data-fetching split, providers, and the CMS mapping layer.
