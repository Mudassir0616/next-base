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
2. **[`src/site.config.js`](src/site.config.js)** — brand name, default description, logo, default social card, locale, country, the header/mobile/footer navigation (`nav`, `footer`), and which routes and CMS collections go into the sitemap. Every `<title>` suffix, canonical, JSON-LD id and robots rule derives from this file. Nothing else in `src/` should hardcode a brand or a domain; if you find yourself typing one, put it here instead.
3. **`public/`** — swap the logo, icons and images. Only `images/logo.png`, `images/popup-frame.jpg` (the enquiry popup's side image) and a few icons ship in the repo. The favicon set `_app.js` links (`/favicon/*`), the default social card, the page-banner fallbacks (`/images/*-bg.webp`) and several icons the components name are **not** in the repo; add them or update the paths, or you will serve 404s and a dead `og:image`.
4. **Copy in the components** — some Grovanta-specific copy (CTA bands, the home "process" ribbon, the leadership section text, contact-detail fallbacks) still lives in the components. Search for the old brand name and rewrite it.
5. **`src/styles/main.scss` + `global.scss`** — the design. See [Styles](#styles) for the compile step.

`package.json` still says `guinwa_portfolio`; rename it if it matters to your tooling.

## What the backend must provide

Endpoints are declared once in [`src/api/api.js`](src/api/api.js), each as an `APIBase` instance. The prebuilt pages expect a Django REST API whose list endpoints return

```json
{ "links": { "first": "…", "last": "…", "previous": null, "next": "…", "pages": [] },
  "current_page": 1, "last_page": 3, "total_items": 42, "page_size": 20, "results": [] }
```

and accept `?page=`, `?page_size=`, `?order_by=` (`-` for descending), `?slug=` (exact match — an unknown slug must return empty `results`, which is how detail pages 404) and `?depth=3&nested=True` (inline related records). The endpoints:

| Endpoint | Used by |
| --- | --- |
| `/api/site-setting/` | Global settings: hero copy/images per page (also used for each page's meta description and social card), contact details, socials, privacy policy and terms HTML, `global_head`. Fetched in the browser via `useSiteSetting()`, and server-side for SEO. |
| `/api/head/` | Per-route SEO head HTML, matched on `target_url`. Up to 500 records are read. |
| `/api/blog/`, `/api/blog-category/` | Blog list and detail. |
| `/api/career/`, `/api/career-category/`, `/api/career-application/` | Careers list, detail, and the application form (multipart resume upload). |
| `/api/faq/`, `/api/faq-category/` | FAQs page. |
| `/api/leadership/` | Our team page. |
| `/api/contact/` | Contact and popup enquiry forms. |
| `/api/testimonial/` | Declared, not yet wired to a page. |

Records that back a detail page need a `slug`. Blogs and careers also need `created_at` / `updated_at` (used for `lastmod` and article dates), and careers an `is_active` flag — inactive jobs are kept out of the sitemap.

Two CMS authoring conventions the components rely on:

- **Highlighted headings** use square brackets: `"From Strategy to [Operational Excellence]"` renders the bracketed half in the accent colour.
- **Multi-value settings fields** (e.g. several phone numbers) are pipe-separated: `"+91 ... | +91 ..."`.

## SEO

Configured in `site.config.js`, assembled in [`src/utils/seo.js`](src/utils/seo.js), rendered by [`src/components/common/Seo.jsx`](src/components/common/Seo.jsx).

- **Every page renders `<Seo>`**, and its `getStaticProps` calls `seoStaticProps()` / `fetchPageSeo()` from `src/utils/functionUtils.js` to fetch the CMS head data for its route. A new page must do both.
- Precedence, lowest to highest: the site-wide `global_head` → tags derived from the page (title, description, canonical, Open Graph, Twitter) → the `/api/head/` record for the route → a record's own `head` field. Whatever an editor fills in wins, and a page never ships without a title, description, canonical and social card. Pages that pass `noindex` (thank-you, 404, closed jobs) stay unindexed whatever the CMS says.
- `/sitemap.xml` and `/robots.txt` are **routes**, not files in `public/`, so they follow `NEXT_PUBLIC_SITE_URL` and pick up new CMS records without a deploy. Add a section to the sitemap by adding a collection to `site.config.js`.
- `robots.txt` serves `Disallow: /` to any host that is not the one `NEXT_PUBLIC_SITE_URL` names. Staging and preview deploys are therefore de-indexed by default — set the env var to the real domain at launch, or the live site stays blocked.
- Structured data (JSON-LD) builders live in `src/utils/seo.js` and pages pass them to `<Seo jsonLd={[...]} />`: WebSite + Organization on home (social profiles and contact details come from site settings — placeholder URLs like `https://www.linkedin.com/in/` are ignored), FAQPage on `/faqs`, BlogPosting and JobPosting on detail pages, BreadcrumbList on inner pages.

Content is server-rendered too: FAQs, team, careers, the first page of the blog list, privacy policy and terms are fetched in `getStaticProps` and refreshed every 60 seconds, so search engines see the text, not an empty shell. Blog filters and later pages are fetched in the browser. If the CMS is down when a page regenerates, the last good version keeps being served. **Still client-side:** the home page sections and the contact details.

## Styles

Global CSS, no CSS modules and no Tailwind. `_app.js` imports `src/styles/global.css` and `src/styles/main.css`, but the sources are the `.scss` files beside them — and `sass` is deliberately not a dependency, so **Next does not compile them**. Edit the `.scss`, compile it to the matching `.css` with your own Sass, and commit both. If you only edit the `.scss`, nothing changes in the browser.

## Architecture notes

Pages Router (`src/pages`), `@/*` → `./src/*`. Page files are thin — data fetching and `<Seo>` — and delegate to one component under `src/components/<Feature>/`.

The one rule that will bite you: **server-side code uses `fetchApi()`, client-side code uses the `APIBase` instances.** `fetchApi` returns `null` on any failure so a CMS outage cannot fail a build; `APIBase` is a browser client that toasts errors. See [src/utils/ApiBase.md](src/utils/ApiBase.md).

### Adding a CMS-backed page

The whole data flow is in the page file — fetch in `getStaticProps`, pass the CMS records straight to a component, which reads the API's own field names. No mapping layer to learn. A testimonials page, for example:

```js
// src/pages/testimonials/index.js
import Seo from "@/components/common/Seo";
import Testimonials from "@/components/Testimonials/Index";
import {
    assertCmsData, fetchApi, fetchPageSeo, listResults, REVALIDATE_SECONDS,
} from "@/utils/functionUtils";

export default function Page({ seo, testimonials }) {
    return (
        <>
            <Seo title="Testimonials" description={seo?.description} path="/testimonials" />
            <Testimonials testimonials={testimonials} />
        </>
    );
}

export async function getStaticProps() {
    const [{ seoHead, seo }, res] = await Promise.all([
        fetchPageSeo("/testimonials"),                 // CMS head tags for this route
        fetchApi("/api/testimonial/?order_by=order_by"),
    ]);

    assertCmsData(res); // CMS down at runtime? keep serving the last good page

    return {
        props: { seoHead, seo, testimonials: listResults(res) },
        revalidate: REVALIDATE_SECONDS,                // refresh every 60 s
    };
}
```

```jsx
// src/components/Testimonials/Index.jsx — use the API's field names
// (`message` and `name` are illustrative; check the endpoint's JSON)
const Testimonials = ({ testimonials }) => (
    <section className="container">
        {testimonials.map((item) => (
            <blockquote key={item.id}>{item.message} — {item.name}</blockquote>
        ))}
    </section>
);
export default Testimonials;
```

Then add the route to `site.config.js` (`nav`/`footer`, and `sitemap.staticRoutes`). Look at the endpoint's JSON (`curl <api>/api/testimonial/`) for the real field names.

Forms are built with `GlobalForm` (`src/components/common/GlobalForm.jsx`) from a field config array; its header comment lists the field types and options. It awaits your `on_Submit` and disables the button meanwhile.

CMS images go through `CmsImage` (`src/components/common/CmsImage.jsx`), a `next/image` wrapper: uploads under the CMS's `/media/` and raster files in `public/` are resized and served as modern formats; anything else (SVGs, images on other hosts, a local dev backend) is served as-is instead of erroring. Pass a `sizes` that matches how wide the image renders.

[CLAUDE.md](CLAUDE.md) has the full architecture tour — conventions, the data-fetching split, providers, and the CMS mapping layer.
