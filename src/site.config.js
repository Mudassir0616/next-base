/**
 * Everything a clone of this base has to rebrand, in one place.
 *
 * This repo is a starting point for portfolio/marketing sites: clone it, point
 * the two env vars at the new CMS and domain, edit this file, and the title
 * suffix, canonicals, social cards, JSON-LD and sitemap all follow. Nothing
 * else in `src/` should hardcode a brand name, a domain or an endpoint.
 */

/** Public origin of this site — canonicals, og:url and JSON-LD ids. */
export const SITE_URL = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://uat.grovantagroup.com"
).replace(/\/+$/, "");

/** CMS / API origin. Uploads (`/media/...`) are served from here too. */
export const API_BASE_URL = (
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.grovantagroup.com"
).replace(/\/+$/, "");

export const site = {
    /** Brand name. Suffixes every <title> and names the JSON-LD Organization. */
    name: "Grovanta",

    /** Falls back into meta descriptions when a record has no copy of its own. */
    description:
        "Grovanta helps businesses strengthen operations, transform technology, access capital and expand into India.",

    /** Shipped with the site, under `public/`. */
    logo: "/images/logo.png",

    /** Social card used when a record has no image of its own yet. */
    defaultImage: "/images/banner-1.webp",

    /** `<html lang>` and the og:locale JSON-LD pick this up. */
    locale: "en",

    /** Where the business operates — JSON-LD areaServed and job locations. */
    country: { name: "India", code: "IN" },

    /**
     * How /sitemap.xml is built. Routes that should never be indexed (404,
     * thank-you, anything behind a form) simply stay out of this list.
     */
    sitemap: {
        staticRoutes: [
            { path: "/", changefreq: "weekly", priority: 1.0 },
            { path: "/blogs", changefreq: "weekly", priority: 0.8 },
            { path: "/careers", changefreq: "weekly", priority: 0.8 },
            { path: "/our-team", changefreq: "monthly", priority: 0.6 },
            { path: "/faqs", changefreq: "monthly", priority: 0.6 },
            { path: "/contact", changefreq: "monthly", priority: 0.7 },
            { path: "/privacy-policy", changefreq: "yearly", priority: 0.3 },
            { path: "/terms-and-conditions", changefreq: "yearly", priority: 0.3 },
        ],

        /**
         * CMS-backed detail pages. Add a collection here and its records show
         * up in the sitemap without touching the sitemap route itself.
         *
         * `endpoint` is fetched with `fetchApi`, so a listing that is down or
         * empty drops out silently rather than breaking the whole sitemap.
         */
        collections: [
            {
                endpoint: "/api/blog/?page_size=500",
                route: (record) => `/blogs/${record.slug}`,
                lastmod: (record) => record.updated_at || record.created_at,
                changefreq: "monthly",
                priority: 0.7,
            },
            {
                endpoint: "/api/career/?page_size=500",
                route: (record) => `/careers/${record.slug}`,
                lastmod: (record) => record.updated_at || record.created_at,
                // jobs that have been closed in the CMS should not be indexed
                include: (record) => record.is_active !== false,
                changefreq: "weekly",
                priority: 0.6,
            },
        ],
    },

    /**
     * Paths robots.txt keeps crawlers out of. These are real routes that are
     * pointless or harmful in an index (form landings, error pages).
     */
    disallow: ["/thank-you", "/404"],
};

export default site;
