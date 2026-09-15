import site, { SITE_URL } from "@/site.config";

/**
 * /robots.txt, served from a route rather than `public/` so the Sitemap line
 * follows NEXT_PUBLIC_SITE_URL instead of being baked in.
 *
 * Only the host NEXT_PUBLIC_SITE_URL names is allowed to be indexed; every
 * other host serving the same build — preview deploys, a staging domain, the
 * raw server IP — gets `Disallow: /`. A clone of this base usually lives on a
 * staging domain long before it launches, and staging getting indexed is the
 * expensive kind of mistake. `NODE_ENV` cannot tell those apart: staging is a
 * production build too.
 */

const canonicalHost = (() => {
    try {
        return new URL(SITE_URL).host;
    } catch {
        return "";
    }
})();

const robots = (isCanonicalHost) => {
    if (!isCanonicalHost) {
        return ["User-agent: *", "Disallow: /", ""].join("\n");
    }

    return [
        "User-agent: *",
        "Allow: /",
        ...site.disallow.map((path) => `Disallow: ${path}`),
        "",
        `Sitemap: ${SITE_URL}/sitemap.xml`,
        "",
    ].join("\n");
};

export async function getServerSideProps({ req, res }) {
    // x-forwarded-host is what a proxy/CDN in front of the app sets
    const host = (req.headers["x-forwarded-host"] || req.headers.host || "")
        .toString()
        .split(",")[0]
        .trim()
        .toLowerCase();

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600");
    res.write(robots(Boolean(canonicalHost) && host === canonicalHost.toLowerCase()));
    res.end();

    return { props: {} };
}

// never rendered — getServerSideProps writes the response itself
export default function Robots() {
    return null;
}
