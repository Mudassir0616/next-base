# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**A reusable base, not a one-off site.** This repo is cloned to start new CMS-driven portfolio/marketing projects. The current content is Grovanta Group's, but treat that as the reference implementation: the prebuilt pages (home, blogs list + detail, careers list + detail + application, FAQs, our team, contact, privacy policy, terms, thank-you, 404) are meant to be reused as-is and rebranded.

That framing decides most judgment calls:

- **Nothing brand-specific or domain-specific gets hardcoded in `src/`.** It belongs in [src/site.config.js](src/site.config.js) or `.env`. If you add a feature that needs a brand name, a country, a default image or a set of routes, add a config key rather than a literal.
- **Generalize before you special-case.** A new CMS-backed section should be a declarative entry (like `site.config.js`'s `sitemap.collections`) wherever the existing code offers that shape.
- Keep [README.md](README.md) and `.env.example` true — they are what the next clone reads. README is written for a developer cloning the base; this file is for Claude.

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
- **`react-hooks/set-state-in-effect` and `react-hooks/refs` are downgraded to warnings** in the flat config. `eslint-plugin-react-hooks@7` errors on the fetch-in-`useEffect` convention this whole codebase is built on, and on Navbar's GSAP ref reset. They are a real backlog item, not noise — don't silence them further, and don't "fix" them by rewriting a component's data flow as a side quest.
- **`turbopack.root` is pinned** in [next.config.mjs](next.config.mjs). Without it Turbopack infers the root from the nearest lockfile, which finds a stray one in a parent directory when the base is cloned into a workspace.
- App Router–only Next 16 breaking changes (async `params`/`searchParams`, `middleware`→`proxy`, PPR/`cacheComponents`, parallel-route defaults) don't apply here. There is no middleware and no `app/`.

## Two different data paths — pick the right one

The single most important distinction in the codebase.

1. **Server-side (`getStaticProps` / `getStaticPaths` / `getServerSideProps`)** → `fetchApi(path)` from [src/utils/functionUtils.js](src/utils/functionUtils.js). A bare `fetch` that swallows errors and returns `null`, so an unreachable backend cannot fail a build.
2. **Client-side (in components, inside `useEffect`)** → the `APIBase` instances exported from [src/api/api.js](src/api/api.js) (`FaqApi`, `BlogListApi`, `CareerApi`, `LeadershipApi`, `ContactApi`, …).

**Never call an `APIBase` instance from `getStaticProps` or during render** — its request interceptor reads `localStorage` unconditionally and throws during SSR. Conversely, a new endpoint belongs in `src/api/api.js` as a named `APIBase` instance, never as an inline `axios`/`fetch` in a component.

Static pages use `revalidate` (ISR); dynamic routes use `fallback: "blocking"`, so slugs added in the CMS appear without a redeploy.

### APIBase behaviour worth knowing ([src/utils/apiBase.js](src/utils/apiBase.js))

- Each instance is pinned to one endpoint via `baseURL`; the first argument to `get`/`post` is a *query string or sub-path* appended to it (`FaqApi.get("?order_by=order_by&page_size=200")`).
- It toasts errors itself (react-toastify) on writes and on 401/403; reads stay silent unless the instance sets `notifyOnRead`. Don't add a second toast in the caller.
- `extractErrorMessages` flattens DRF field errors, including `detail` sent as a *stringified Python dict*. That parser exists for a reason — don't simplify it away.
- A `404` on a `GET` is **returned, not thrown**, so callers can treat "not found" as data. Writes always throw.

## Page / component layout

`src/pages/**` files are thin: data fetching and `<Seo>`, then one component from `src/components/<Feature>/`. Feature components (`Faqs/Index.jsx`, `Careers/Index.jsx`, `BoardMembers/Index.jsx`, …) fetch their own content client-side and hold the markup. Follow that split for new pages.

Shared building blocks in `src/components/common/`: `PageBanner`, `ContactFrame` (closing CTA band), `MessagePanel` (thank-you / 404 shells), `GlobalForm` (schema-driven Formik + Yup + MUI form), `PopupForm/`, `Seo`.

## SEO

Brand/domain values come from [src/site.config.js](src/site.config.js); the helpers are in [src/utils/seo.js](src/utils/seo.js) (which re-exports `SITE_NAME`, `SITE_URL`, `DEFAULT_SEO_IMAGE` from it for existing import sites).

Two layers of head tags, both CMS-driven:

- `_app.js` fetches `/api/head/` + the site-setting `global_head` in a page's `getStaticProps`, matches the route with `normalizePath`, and renders the winner through `renderHeadTags` (whitelists head-safe tags, drops inline `<script>`).
- Per-record pages render [`<Seo>`](src/components/common/Seo.jsx), which puts the record's own `head` **first** and then fills in only the tags it did not define. Its derived tags are deliberately unkeyed — that is what makes next/head dedupe them against `global_head`. Always pass `path` explicitly; `router.asPath` is unreliable while a `fallback: "blocking"` page generates.

**Known gap:** only `/blogs/[slug]` and `/careers/[slug]` render `<Seo>`. The other nine pages rely on a matching `/api/head/` record existing. Render `<Seo>` in any page you add. (Backfilling the existing nine was considered and deliberately deferred.)

`/sitemap.xml` and `/robots.txt` are `getServerSideProps` routes ([src/pages/sitemap.xml.js](src/pages/sitemap.xml.js), [src/pages/robots.txt.js](src/pages/robots.txt.js)), not files in `public/`, so they track `NEXT_PUBLIC_SITE_URL` and pick up new CMS records without a deploy. **Add a sitemap section by adding a collection to `site.config.js`, not by editing the route.** `robots.txt` serves `Disallow: /` to any host that isn't the one `NEXT_PUBLIC_SITE_URL` names, which de-indexes staging and preview deploys by default.

## Global providers ([src/pages/_app.js](src/pages/_app.js))

`ThemeProvider` (MUI) → `SettingsProvider` → `PopupFormProvider` → `LenisContext`, wrapping `Navbar` / page / `Footer`.

- `useSiteSetting()` exposes the single `/api/site-setting/` record. Most hero titles, images, contact details and socials read from it, with hardcoded fallbacks in the components.
- [src/theme.js](src/theme.js) raises MUI's whole `zIndex` scale (modal 10001, …) because the site chrome sits at 9999+. Keep overlay z-indexes consistent with it rather than patching one component. MUI is intentionally held at v6 — v9 is a separate migration.
- Lenis smooth scroll is instantiated once and shared via `LenisContext`; use `useLenisContext()` rather than creating another instance.

## Styles

Global CSS only — no CSS modules, no Tailwind. `_app.js` imports `src/styles/global.css` and `src/styles/main.css`, but the **sources are the `.scss` files beside them**, and `sass` is not a dependency, so Next never compiles them. Edit the `.scss`, compile to the matching `.css` with an external Sass, and commit both — editing only the `.scss` changes nothing in the browser. Class names are plain BEM-ish strings (`.faqs-page`, `.faq-listing`).

## CMS data conventions

- `mediaUrl(path, fallback)` — prefixes API-relative `/media/...` paths with `BASE_URL`, falling back to a local asset so a blank CMS field never renders a broken image.
- `highlight(value)` — the CMS marks accent text with square brackets (`"From Strategy to [Operational Excellence]"`); this turns them into `<span>` for `dangerouslySetInnerHTML`.
- `stripHtml`, `splitPipeList` — several CMS fields arrive as markup or pipe-separated lists.
- [src/utils/mappers.js](src/utils/mappers.js) reshapes the flat `<section>_<field>` + `api_*` CMS records into the nested shape components expect. Mapping goes there, not in components.

## Environment

`.env` (gitignored) holds `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_SITE_URL`; `.env.example` is committed and documents both. Their fallbacks live in `site.config.js` — `src/api/api.js` re-exports one as `BASE_URL`. Keep `.env.example` in sync when adding a variable.

**Dangling asset references** (known, left alone deliberately): `_app.js` links `/favicon/apple-touch-icon.png`, `/favicon/favicon-32x32.png`, `/favicon/favicon-16x16.png` and `/favicon/site.webmanifest`, and `site.config.js` names `/images/banner-1.webp` as the default social card. None exist in `public/`. A clone is expected to supply them.
