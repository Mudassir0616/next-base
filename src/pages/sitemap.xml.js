import site from "@/site.config";
import { canonicalUrl } from "@/utils/seo";
import { fetchApi } from "@/utils/functionUtils";

/**
 * /sitemap.xml, built on request from the CMS.
 *
 * It is a getServerSideProps route rather than a file in `public/` because the
 * blog and career listings change without a deploy — a static sitemap would go
 * stale the moment an editor publishes a post. Which routes and collections go
 * in is declared in `site.config.js`, so adding a section to a clone of this
 * base is a config edit, not a change here.
 */

const escapeXml = (value) =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

/** A CMS listing is either a DRF page (`{ results: [] }`) or a bare array. */
const records = (payload) =>
    Array.isArray(payload) ? payload : payload?.results || [];

/** `2026-09-01T16:10:25+05:30` -> `2026-09-01`, dropping anything unparseable. */
const lastmodDate = (value) => {
    if (!value) return null;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
};

const urlEntry = ({ path, lastmod, changefreq, priority }) =>
    [
        "  <url>",
        `    <loc>${escapeXml(canonicalUrl(path))}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
        changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
        priority != null ? `    <priority>${priority.toFixed(1)}</priority>` : null,
        "  </url>",
    ]
        .filter(Boolean)
        .join("\n");

async function collectionEntries(collection) {
    const payload = await fetchApi(collection.endpoint);

    return records(payload)
        .filter((record) => record?.slug)
        .filter((record) => (collection.include ? collection.include(record) : true))
        .map((record) => ({
            path: collection.route(record),
            lastmod: lastmodDate(collection.lastmod?.(record)),
            changefreq: collection.changefreq,
            priority: collection.priority,
        }));
}

export async function getServerSideProps({ res }) {
    const { staticRoutes, collections } = site.sitemap;

    // one listing being down must not cost the whole sitemap its other entries
    const fetched = await Promise.all(
        (collections || []).map((collection) =>
            collectionEntries(collection).catch((error) => {
                console.error("sitemap:", collection.endpoint, error?.message);
                return [];
            }),
        ),
    );

    const entries = [
        ...(staticRoutes || []).map((route) => ({ ...route })),
        ...fetched.flat(),
    ];

    const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...entries.map(urlEntry),
        "</urlset>",
    ].join("\n");

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    // crawlers re-fetch often; an hour of shared cache keeps the CMS quiet
    res.setHeader(
        "Cache-Control",
        "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    );
    res.write(xml);
    res.end();

    return { props: {} };
}

// never rendered — getServerSideProps writes the response itself
export default function Sitemap() {
    return null;
}
