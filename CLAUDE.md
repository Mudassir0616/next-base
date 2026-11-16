# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**A reusable base, not a one-off site.** This repo is cloned to start new CMS-driven portfolio/marketing projects. The current content is Grovanta Group's, but treat that as the reference implementation: the prebuilt pages (home, blogs list + detail, careers list + detail + application, FAQs, our team, contact, privacy policy, terms, thank-you, 404) are meant to be reused as-is and rebranded.

That framing decides most judgment calls:

- **Nothing brand-specific or domain-specific gets hardcoded in `src/`.** It belongs in [src/site.config.js](src/site.config.js) or `.env`. If you add a feature that needs a brand name, a country, a default image or a set of routes, add a config key rather than a literal.
- **Generalize before you special-case.** A new CMS-backed section should be a declarative entry (like `site.config.js`'s `sitemap.collections`) wherever the existing code offers that shape.
- Keep [README.md](README.md) and `.env.example` true — they are what the next clone reads. README is written for a developer cloning the base; this file is for Claude.

### Three layers — know which one you are touching

1. **Base infrastructure** (shared by every client site; change deliberately, keep generic): `APIBase` + `fetchApi` + `fetchPageSeo`, `Seo` + `utils/seo.js` + `renderHeadTags`, sitemap/robots routes, `site.config.js`, `GlobalForm`, `CmsImage`, `PageBanner`, `MessagePanel`, `ContactFrame`, `LegalPage`, `PopupForm`, `FaqItem`, `useDialogFocus`, the contexts, `theme.js`.
2. **Prebuilt pages** — the eleven routes above. Structure is reusable; they are rebranded per client, not rewritten.
3. **Reference content** — Grovanta's copy, images, nav links and its live backend. Not a pattern to copy. The fallback `NEXT_PUBLIC_API_BASE_URL` (`https://api.grovantagroup.com`) is a real client CMS; `npm run build` and `npm run dev` hit it when no `.env` exists.

A fix to layer 1 or 2 benefits every future clone — prefer fixing it here over in a clone. Content in layer 3 that is still hardcoded in components is **known debt, not precedent** (see [Reference content still hardcoded](#reference-content-still-hardcoded-in-src)).

Next.js **Pages Router** (not App Router), JavaScript, no TypeScript, no test suite. `@/*` → `./src/*`.

## Commands

Requires **Node 20.9+** (`.nvmrc` pins 20.19.4; `nvm use`). Next 16 refuses to run on 18.

```bash
npm run dev     # Turbopack dev server on :3000
npm run build   # production build — prerenders every blog/career slug, so the CMS must be reachable
npm start       # serve the build
npm run lint    # eslint . — `next build` does NOT lint anymore, this must run separately
```

`npm run build` is the only real check in this repo: no typecheck, no tests. Turbopack fails the build on a bad import (a missing export is an error, not a warning), so a green build is meaningful.

## Framework version constraints

On Next.js 16 / React 19.3. Things that are the way they are on purpose:

- **`eslint` is pinned to `^9`.** `eslint-config-next@16` depends on `typescript-eslint@8`, whose scope manager crashes on ESLint 10 (`scopeManager.addGlobals is not a function`). Do not bump it to 10 until that resolves.
- **`next lint` is gone** (removed in 16). [eslint.config.mjs](eslint.config.mjs) is native flat config from `eslint-config-next/core-web-vitals` — no `FlatCompat`, no `@eslint/eslintrc`.
- **`react-hooks/set-state-in-effect` is downgraded to a warning** in the flat config. `eslint-plugin-react-hooks@7` errors on the fetch-in-`useEffect` convention this whole codebase is built on. It is a real backlog item, not noise — don't silence it further, and don't "fix" it by rewriting a component's data flow as a side quest. (`react-hooks/refs` used to be downgraded too, for a Navbar pattern that has since been removed; it is back at its default — keep it there.)
- **`turbopack.root` is pinned** in [next.config.mjs](next.config.mjs). Without it Turbopack infers the root from the nearest lockfile, which finds a stray one in a parent directory when the base is cloned into a workspace.
- App Router–only Next 16 breaking changes (async `params`/`searchParams`, `middleware`→`proxy`, PPR/`cacheComponents`, parallel-route defaults) don't apply here. There is no middleware and no `app/`.

## Two different data paths — pick the right one

The single most important distinction in the codebase.

1. **Server-side (`getStaticProps` / `getStaticPaths` / `getServerSideProps`)** → `fetchApi(path)` from [src/utils/functionUtils.js](src/utils/functionUtils.js). A bare `fetch` that swallows errors and returns `null` (after one retry on a network error), so an unreachable backend cannot fail a build. Pass the payloads a page can't render without to **`assertCmsData(...)`**: during a build a `null` is tolerated (the page refills on revalidation), but at runtime it throws, which makes Next keep serving the last good page instead of caching an empty list — or a 404 for a post that exists — for everyone. Distinguish "request failed" (`null` payload) from "not found" (empty `results`) before returning `notFound`.
2. **Client-side (in components, inside `useEffect`)** → the `APIBase` instances exported from [src/api/api.js](src/api/api.js) (`FaqApi`, `BlogListApi`, `CareerApi`, `LeadershipApi`, `ContactApi`, …).

**Never call an `APIBase` instance from `getStaticProps` or during render.** It is a browser client: it toasts, and a failed request throws, which would fail a build. (It no longer *crashes* on the server — its `localStorage` read is guarded — but that is not a licence to use it there.) Conversely, a new endpoint belongs in `src/api/api.js` as a named `APIBase` instance, never as an inline `axios`/`fetch` in a component.

Every page has `getStaticProps` with `revalidate: REVALIDATE_SECONDS` (60, in functionUtils) — at minimum to fetch its SEO head data (see [SEO](#seo)). Dynamic routes use `fallback: "blocking"`, so slugs added in the CMS appear without a redeploy. Don't drop the revalidate window to 1 second again: every page view past the window regenerates against the CMS.

### APIBase behaviour worth knowing ([src/utils/apiBase.js](src/utils/apiBase.js))

Developer-facing reference: [src/utils/ApiBase.md](src/utils/ApiBase.md).

- Each instance is pinned to one endpoint via `baseURL`; the first argument to `get(endpoint, headers)` / `post(endpoint, data, headers)` is a *query string or sub-path* appended to it (`FaqApi.get("?order_by=order_by&page_size=200")`). Build query strings with `URLSearchParams` when any value comes from the user or the URL.
- It toasts errors itself (react-toastify) on writes and on 401/403; reads stay silent — HTTP errors *and* network failures — unless the instance sets `notifyOnRead`. Don't add a second toast in the caller.
- `extractErrorMessages` flattens DRF field errors, including `detail` sent as a *stringified Python dict*. That parser exists for a reason — don't simplify it away.
- A `404` on a `GET` is **returned, not thrown**, so callers can treat "not found" as data. Writes always throw. `GlobalForm` awaits and catches `on_Submit`, so a form handler can just `await Api.post(...)`; anything else that posts must catch.
- There is no auth/token support, retry or debounce — it was dead code and was removed. Add it deliberately if a clone needs an authenticated endpoint.

### The CMS API contract (what the reference backend actually returns)

Not DRF's default pagination. Every list endpoint returns:

```json
{ "links": { "first", "last", "previous", "next", "pages": [] },
  "current_page": 1, "last_page": 1, "total_items": 3, "page_size": 20, "results": [] }
```

There is no `count`/`next`/`previous` at the top level. Use `listResults(payload)` (functionUtils) to read `results` defensively. Default page size is 20; `?page_size=` is honoured. Filters the pages rely on: `?slug=` (exact; an unknown slug returns an empty `results`, which is how detail pages 404), `?order_by=` (`-` prefix for descending), `?is_active=true`, `?category=<id>` (repeatable), `?title=` (substring), `?depth=3&nested=True` (inline related records instead of ids). Repeating blocks come back as `api_*` keys (`api_category`, `api_responsibility` as an array of strings, `api_recommended`, …). Record ids are UUID strings.

`/api/site-setting/` has fields no page uses yet — `logo`, `favicon`, `twitter`, `brochure`, `disclaimer`, `return_policy`, `robots`, `sitemap`, and per-page hero fields for sections that don't exist here (`our_expertise_*`, `success_story_*`, `industry_*`, `policy_*`, most `about_us_*`). A new policy page (disclaimer, return policy) is a copy of `pages/privacy-policy` pointed at another field.

CMS dates carry their own UTC offset. Format them with `formatCmsDate()` (functionUtils), which formats in that offset, never `moment(x)` / `new Date(x)` in render — those use the machine's timezone, so the prerendered and hydrated text can differ. Likewise no relative times (`fromNow()`) in prerendered markup.

## Page / component layout

`src/pages/**` files are thin: `getStaticProps` (SEO head data plus the page's content) and `<Seo>`, then one component from `src/components/<Feature>/` that receives the content as props and holds the markup. **CMS records pass through untouched**: `getStaticProps` hands `listResults(payload)` (or `payload.results[0]` for a detail page) straight to the component, and the component reads the CMS's own field names (`job.job_type`, `job.api_category?.name`, `blog.category?.category`, `faq.answer`). There is deliberately no mapping/view-model layer — a developer reading the API response sees the same names in the JSX. Don't reintroduce one; small presentation logic (grouping FAQs by category, joining a label) lives inline in the component that needs it. That's how FAQs, our team, careers, the blog list (first page — filtered views are fetched in the browser), the detail pages and the policy pages (`LegalPage`) work. Follow that shape for new pages. Hero copy reaches a component as a `hero` prop — the `seo` object `fetchPageSeo` returns, with `title`/`description`/`image` mapped to the page's site-setting hero fields. **Still client-fetched** (known debt, not the pattern): the home page sections (`useSiteSetting`, home blogs slider), the contact details, and job-detail's "About" text.

Props must be JSON-serializable. Raw API JSON always is (JSON has no `undefined`); anything you compute in `getStaticProps` must use `null`, not `undefined`. Whole records go into the page's HTML as page data — fine at listing sizes (the reference pages ship 1–14 KB), but don't pass a heavy endpoint (e.g. `depth=3` with every article body) for hundreds of records.

**CMS HTML never goes inside a `<p>`.** The CMS sends rich text as `<p>…</p>`/`<div>…</div>`; injected into a `<p>` via `dangerouslySetInnerHTML`, it's invalid nesting that the browser repairs in server HTML, so React's hydration no longer matches. Use a `<div>` (see `PageBanner`'s `.banner-description`, `JobCard`'s `.description`).

Shared building blocks in `src/components/common/`: `PageBanner`, `ContactFrame` (closing CTA band), `MessagePanel` (thank-you / 404 shells), `LegalPage` (CMS policy pages), `FaqItem`, `CmsImage`, `GlobalForm`, `PopupForm/`, `Seo`.

- **PopupForm**'s styles are the "Popup Enquiry Form" section at the end of `main.scss`, kept **top-level**: MUI's `<Modal>` portals it to `<body>`, so a rule nested under a page class never matches. The Box's `sx` owns the dialog shell (width, max-height, scroll, padding); `.popup-form` is only the layout inside (image column + form). Its name/company pair stacks by a container query on the form column, not a viewport breakpoint. Only the auto-open timer opens it (2 min) — to see it, fast-forward the clock (Playwright `page.clock`) in a fresh browser context, since dismissing it is remembered in `localStorage`.

- **CMS images go through [`CmsImage`](src/components/common/CmsImage.jsx)** (next/image), never a bare `<img>` or `next/image` directly. It optimizes only what Next can: raster files in `public/` and uploads under the CMS's `/media/` (the single `remotePatterns` entry in next.config, derived from `NEXT_PUBLIC_API_BASE_URL` incl. protocol/port). SVGs, other hosts and private-IP backends are served `unoptimized` instead of throwing. Its `width`/`height` only set the reserved aspect ratio — the stylesheet sizes the element — so always pass a `sizes` matching the rendered width. Use `preload` (Next 16 deprecated `priority`) only for the above-the-fold image of a page. Static icons/logos stay plain `<img>`.

- **Navigation lives in `site.config.js`** (`nav` for the header + mobile menu, `footer` for the footer columns and legal links). Never hardcode a link list in Navbar/MobileNavbar/Footer, and only add routes that exist in `src/pages` — the base previously shipped links to `/about-us`, `/case-study` and `/expertise`, which 404.
- **`GlobalForm`** ([GlobalForm.jsx](src/components/common/GlobalForm.jsx); field types and options are in its header comment) builds its Yup schema from the field config — format checks (email, tel, url, file type/size via `accept`/`max_size`) apply even to optional fields. Prefer `required` + `validation_message` over passing `custom_schema`, which replaces the generated schema wholesale and drops those checks. Its theme is layered on the app theme (`createTheme(outerTheme, …)`); keep it that way, or forms lose Poppins and the zIndex scale. Keep `FileUpload`/`ImageUpload` at module scope.
- The career forms share their resume field from [Careers/resumeField.js](src/components/Careers/resumeField.js); its `helper_text` must agree with its `accept` / `max_size`.

### Accessibility conventions

- Anything clickable that isn't a link is a `<button type="button">` — restyled with an `appearance/background/border/padding` reset plus a `:focus-visible` outline (see `.categories-dropdown`, `.faq-question`) — not a `div` with `onClick`. Where a `div role="button"` remains (hamburger, mobile accordion), it handles Enter **and** Space.
- Disclosures carry `aria-expanded` + `aria-controls`; collapsed content that stays in the DOM is `inert` (`FaqItem` puts it on a plain div — `motion.div` may drop unknown props). Filter chips/tabs carry `aria-pressed`.
- Desktop nav dropdowns open on hover *and* click/Enter/Space; Escape closes and returns focus to the button, focus leaving closes, route changes close. A pointer click only ever opens (hover already did) — toggling would shut it under the cursor.
- A hand-built modal uses [`useDialogFocus(ref, open)`](src/hooks/useDialogFocus.js) (focus in, Tab trapped, focus returned to the opener) with `role="dialog"`, `aria-modal`, `aria-labelledby`, `tabIndex={-1}`, and handles Escape itself. MUI `<Modal>` (PopupForm) does all of this already.
- Decorative images get `alt=""`; an icon inside a link that has an `aria-label` is decorative.

## SEO

Brand/domain values come from [src/site.config.js](src/site.config.js); the helpers are in [src/utils/seo.js](src/utils/seo.js) (which re-exports `SITE_NAME`, `SITE_URL`, `DEFAULT_SEO_IMAGE` from it for existing import sites).

**Every page does two things** — a new page must do both:

1. Its `getStaticProps` returns `seoHead` from `fetchPageSeo(path, fields)` — or is simply `export const getStaticProps = seoStaticProps(path, fields)` when content is client-fetched. `fetchPageSeo` reads `/api/head/` (the record whose `target_url` matches `path`) and the site setting (`global_head`, plus the fields named in `fields` — the page's hero description/image — returned as `seo`). `_app` puts `pageProps.seoHead` into `SeoHeadContext`.
2. It renders [`<Seo>`](src/components/common/Seo.jsx) with a fixed page name as `title`, the CMS `seo.description`/`seo.image`, and an explicit `path` (`router.asPath` is unreliable while a `fallback: "blocking"` page generates). `noindex` on pages that must not be indexed (thank-you, 404, closed jobs); it also drops the canonical.

`<Seo>` renders all head tags itself, in precedence order, lowest first: `global_head` → tags derived from its props → the route's `/api/head/` record → the record's own `cmsHead`; `noindex` is re-applied last so no CMS markup can override it. Precedence works because **every head tag carries an identity key** — `title`, `meta:<name|property>`, `canonical` (`metaKey()` / `renderHeadTags()` in [renderHeadTags.js](src/utils/renderHeadTags.js)) — and next/head keeps the last tag per key. Unkeyed, next/head would dedupe only `<title>` and `<meta name>`, never `og:*` or canonical. Any head tag you add anywhere must use the same keys. `renderHeadTags` whitelists head-safe tags and drops inline `<script>`; `cleanHeadHtml` drops the placeholder tags (`content=" "`) CMS records are saved with.

`_app` renders only a keyed fallback `<title>`/description (overridden by every `<Seo>`), favicons and viewport.

Structured data: `websiteSchema()` + `organizationDetailsSchema(setting)` on home, `faqPageSchema()` on `/faqs`, `articleSchema` / `jobPostingSchema` on detail pages, `breadcrumbSchema` on inner pages. Every schema refers to the organization by one `@id` (`${SITE_URL}/#organization`). `organizationDetailsSchema` reads the site-setting record, so call it in `getStaticProps` and pass the result as a prop; its `sameAs` drops placeholder social URLs (bare hosts, `linkedin.com/in/`), which is all the reference CMS holds today.

**Known gap:** the home page's sections are still rendered client-side, so its prerendered HTML has head tags and structured data but little body text (and the hero shows the local fallback image until settings load).

`/sitemap.xml` and `/robots.txt` are `getServerSideProps` routes ([src/pages/sitemap.xml.js](src/pages/sitemap.xml.js), [src/pages/robots.txt.js](src/pages/robots.txt.js)), not files in `public/`, so they track `NEXT_PUBLIC_SITE_URL` and pick up new CMS records without a deploy. **Add a sitemap section by adding a collection to `site.config.js`, not by editing the route.** `robots.txt` serves `Disallow: /` to any host that isn't the one `NEXT_PUBLIC_SITE_URL` names, which de-indexes staging and preview deploys by default.

## Global providers ([src/pages/_app.js](src/pages/_app.js))

`SeoHeadContext` → `ThemeProvider` (MUI) → `SettingsProvider` → `PopupFormProvider` → `LenisContext`, wrapping `Navbar` / page / `Footer`.

- `useSiteSetting()` exposes `{ settings, loading }` for the single `/api/site-setting/` record, fetched in the browser. `settings` is `{}` until it lands; `loading` is true until the request settles — use it to hold space (HeroBanner's skeleton) rather than rendering empty headings. The home sections, contact details, footer and socials read from it, with hardcoded fallbacks in the components; server-rendered pages get their hero copy from `getStaticProps` instead (the `hero` prop) — prefer that for anything new, since `useSiteSetting` content isn't in the prerendered HTML.
- [src/theme.js](src/theme.js) raises MUI's whole `zIndex` scale (modal 10001, …) because the site chrome sits at 9999+. Keep overlay z-indexes consistent with it rather than patching one component. MUI is intentionally held at v6 — v9 is a separate migration.
- Lenis smooth scroll is instantiated once and shared via `LenisContext`; use `useLenisContext()` rather than creating another instance.

## Styles

Global CSS only — no CSS modules, no Tailwind. `_app.js` imports `src/styles/global.css` and `src/styles/main.css`, but the **sources are the `.scss` files beside them**, and `sass` is not a dependency, so Next never compiles them. Edit the `.scss`, compile to the matching `.css` with an external Sass, and commit both — editing only the `.scss` changes nothing in the browser:

```bash
npx sass@1.83.4 --no-source-map src/styles/main.scss src/styles/main.css
npx sass@1.83.4 --no-source-map src/styles/global.scss src/styles/global.css
```

(`main.scss` compiles byte-identical to the committed CSS with that version; it prints pre-existing `darken()`/`lighten()` deprecation warnings.) Class names are plain BEM-ish strings (`.faqs-page`, `.faq-listing`). `global.scss` also carries a small utility kit (`m-*`/`p-*` spacing, `flex-*`, `line-clamp-*`) and the navbar's mega-menu styles — unused today, kept on purpose for clones.

## CMS data conventions

- `mediaUrl(path, fallback)` — prefixes API-relative `/media/...` paths with `BASE_URL`, falling back to a local asset so a blank CMS field never renders a broken image.
- `highlight(value)` — the CMS marks accent text with square brackets (`"From Strategy to [Operational Excellence]"`); this turns them into `<span>` for `dangerouslySetInnerHTML`.
- `stripHtml`, `splitPipeList` — several CMS fields arrive as markup or pipe-separated lists.
- Read CMS fields by their API names in components; `api_*` keys hold the repeating blocks/related records (`api_category`, `api_responsibility`, `api_recommended`, …). A boolean flag that may be missing is tested as `record.is_active !== false` (missing means active).

## Environment

`.env` (gitignored) holds `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_SITE_URL`; `.env.example` is committed and documents both. Their fallbacks live in `site.config.js` — `src/api/api.js` re-exports one as `BASE_URL`. Keep `.env.example` in sync when adding a variable.

**Dangling asset references** (known, left alone deliberately): `public/` ships only `favicon.ico`, `images/logo.png`, `images/popup-frame.jpg` and the icons `ig`, `in`, `wp`, `x`, `yt`. Everything else the code names is missing and a clone is expected to supply it — the `/favicon/*` set `_app.js` links, the default social card `/images/banner-1.webp`, every page-banner fallback (`about-bg`, `blog-bg`, `career-bg`, `career-detail-bg`, `contact-bg`, `faq-bg` `.webp`), `leader1.webp`, `g-logo.png`, `thank-you.svg`, and the icons `tick`, `call`, `facebook`, `instagram` (only `ig.svg` exists), `advise`, `design`, `implement`, `operations`, `improvments`. In the browser these show up as 404s in the console; they are not code bugs.

## Reference content still hardcoded in `src/`

Grovanta-specific (or placeholder) literals that a clone must rewrite by hand. Move them to `site.config.js` or the CMS when you touch the file; don't add more.

- Brand name in copy: [LandingPage.jsx](src/components/LandingPage/LandingPage.jsx) CTA, [Careers/Index.jsx](src/components/Careers/Index.jsx), [JobDetails.jsx](src/components/Careers/JobDetails.jsx) ("About Grovanta"), [BoardMembers/Index.jsx](src/components/BoardMembers/Index.jsx) section copy.
- Fallback contact details (a Mumbai street address, `+91 000000000`, `support@yourdomain.com`) duplicated in `Footer.jsx` and `Contact/Index.jsx`, and the footer tagline.
- The five-step ADVISE…IMPROVE ribbon in [AboutUs.jsx](src/components/LandingPage/AboutUs.jsx), the home blogs-section heading, the blog-detail sidebar CTA, page-banner fallback titles.

## Keep it lean

The base was cleared of dead code inherited from earlier client projects (unused hooks, a 900-line fixtures/utils file, SweetAlert, skeleton loaders, auth endpoints, ~2,600 lines of CSS for pages that don't exist, and six unused npm packages). Don't reintroduce speculative code: add a hook, helper, endpoint or dependency when a page uses it. `testimonialAPI` in `api.js` is the deliberate exception — a real (currently empty) endpoint of the reference backend, declared for the page a clone usually builds next. (The case-study instances that used to sit beside it pointed at endpoints the backend doesn't have — `/api/case-study/` 404s — and were removed.) `@emotion/*` look unused but are MUI peer deps, and `date-fns` backs the date-picker adapter — keep them.
