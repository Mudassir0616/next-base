import moment from "moment";
import { BASE_URL } from "@/api/api";

export const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Several CMS fields (short_description, address, ...) come back wrapped in
 * markup. Flatten them to text where the layout needs plain text — e.g. a
 * line-clamped card excerpt, which a nested <p> would break.
 */
export const stripHtml = (value) =>
    typeof value === "string"
        ? value
            .replace(/<[^>]*>/g, " ")
            .replace(/&nbsp;/g, " ")
            .replace(/\s+/g, " ")
            .trim()
        : "";

/**
 * Some CMS fields (e.g. site-setting contact_number) can hold multiple
 * values separated by a pipe ("|"). Split into a clean array of strings.
 */
export const splitPipeList = (value) =>
    typeof value === "string"
        ? value.split("|").map((item) => item.trim()).filter(Boolean)
        : [];

/**
 * Absolute url for a media file returned by the API (`/media/...`), with a
 * local fallback so a section never renders a broken image while the CMS
 * record is still empty.
 */
export const mediaUrl = (path, fallback = "") => {
    if (!path) return fallback;
    if (typeof path !== "string") return fallback;
    if (path.startsWith("http") || path.startsWith("/images") || path.startsWith("/icons")) {
        return path;
    }
    return `${BASE_URL}${path}`;
};

/**
 * The CMS marks the highlighted part of a heading with square brackets, e.g.
 * "From Strategy to [Operational Excellence]". The design paints that part in
 * the accent colour, which the markup does with a <span>.
 */
export const highlight = (value) => {
    if (!value) return "";
    return String(value).replace(/\[([^\]]+)\]/g, "<span>$1</span>");
};

/**
 * CMS dates carry their own offset (`2026-09-01T16:10:25+05:30`). Formatting
 * them in that offset rather than the machine's timezone keeps the server and
 * the browser rendering the same day, so a prerendered date never causes a
 * hydration mismatch.
 */
export const formatCmsDate = (value, pattern = "MMM DD, YYYY") => {
    if (!value) return "";
    const date = moment.parseZone(value);
    return date.isValid() ? date.format(pattern) : "";
};

/**
 * Server-side fetch used by getStaticProps/getStaticPaths. APIBase is a
 * browser client (it toasts, and reads the visitor's language preference), and
 * a backend that is unreachable at build time must not fail the build.
 */
export async function fetchApi(path, { retries = 1 } = {}) {
    for (let attempt = 0; ; attempt++) {
        try {
            const res = await fetch(`${BASE_URL}${path}`);

            // an HTTP error is the backend's answer — retrying won't change it
            if (!res.ok) {
                console.error("API failed:", path, res.status);
                return null;
            }

            return await res.json();
        } catch (error) {
            // A network failure often is transient: the reference CMS refuses
            // bursts of new connections (a build prerenders pages in parallel).
            if (attempt >= retries) {
                console.error("fetchApi:", path, error?.cause?.code || error?.message);
                return null;
            }
            await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        }
    }
}

// Every page's getStaticProps needs the same site-setting and head records.
// Sharing one in-flight/recent response per server process turns a build's
// two-requests-per-page into two per worker, and keeps ISR revalidations of
// several pages from each refetching them. Failures are not kept.
const SHARED_TTL_MS = 30 * 1000;
const shared = new Map();

const fetchApiShared = (path) => {
    const hit = shared.get(path);
    if (hit && Date.now() - hit.at < SHARED_TTL_MS) return hit.promise;

    const promise = fetchApi(path).then((data) => {
        if (data === null && shared.get(path)?.promise === promise) {
            shared.delete(path);
        }
        return data;
    });

    shared.set(path, { at: Date.now(), promise });
    return promise;
};

/** A CMS listing is either a paginated envelope (`{ results: [] }`) or a bare array. */
export const listResults = (payload) =>
    Array.isArray(payload) ? payload : Array.isArray(payload?.results) ? payload.results : [];

export function normalizePath(input) {
    if (!input) return "/";

    try {
        // If backend gives full URL
        if (input.startsWith("http")) {
            const url = new URL(input);
            return url.pathname.replace(/\/$/, "") || "/";
        }

        // If frontend path
        return input.split(/[?#]/)[0].replace(/\/$/, "") || "/";
    } catch {
        return "/";
    }
}

/**
 * Everything <Seo> needs from the CMS for one route, fetched in a page's
 * getStaticProps:
 *
 *  - `seoHead.route`  — the `/api/head/` record whose `target_url` is this path
 *  - `seoHead.global` — the site-setting `global_head`
 *  - `seo`            — the page's own copy, read from the site-setting fields
 *                       named in `fields` (e.g. its hero title/description)
 *  - `setting`        — the whole site-setting record, for pages that render
 *                       a field of it server-side (privacy policy, terms)
 *
 * `seoHead` is picked up by _app and handed to <Seo> through context; the page
 * spreads `seo` into its own <Seo>. Only `seoHead` and `seo` should go into
 * props — the setting record is large.
 */
/** ISR window for CMS-backed pages: edits show up within a minute. */
export const REVALIDATE_SECONDS = 60;

/**
 * Call in getStaticProps with the `fetchApi` payloads a page cannot render
 * without (`null` means the request failed).
 *
 *  - During `next build` (and `next dev`) a failure is tolerated: the page is
 *    generated with what it has and refills on its first revalidation, so a
 *    CMS outage can never fail a build.
 *  - At runtime it throws. Next keeps serving the last successfully generated
 *    page when a regeneration throws — far better than caching an empty list,
 *    or a 404 for a post that exists, for everyone until the next window.
 */
export const assertCmsData = (...payloads) => {
    if (payloads.every((payload) => payload !== null)) return;

    const isBuild = process.env.NEXT_PHASE === "phase-production-build";
    if (isBuild || process.env.NODE_ENV !== "production") return;

    throw new Error("CMS unavailable — keeping the previously generated page");
};

/**
 * `export const getStaticProps = seoStaticProps("/faqs", { title: "..." })` —
 * the whole getStaticProps of a page whose content is fetched client-side.
 */
export const seoStaticProps = (path, fields) => async () => {
    const { seoHead, seo } = await fetchPageSeo(path, fields);

    return { props: { seoHead, seo }, revalidate: REVALIDATE_SECONDS };
};

export async function fetchPageSeo(path, fields = {}) {
    const [heads, settingPayload] = await Promise.all([
        fetchApiShared("/api/head/?page_size=500"),
        fetchApiShared("/api/site-setting/"),
    ]);

    const setting = listResults(settingPayload)[0] || {};
    const route = listResults(heads).find(
        (record) => normalizePath(record?.target_url) === normalizePath(path),
    );

    return {
        seoHead: {
            route: route?.head ?? null,
            global: setting.global_head ?? null,
        },
        seo: {
            title: (fields.title && setting[fields.title]) || null,
            description: (fields.description && setting[fields.description]) || null,
            image: (fields.image && setting[fields.image]) || null,
        },
        setting,
    };
}
