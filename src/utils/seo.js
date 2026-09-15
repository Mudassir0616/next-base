import { BASE_URL } from "@/api/api";
import site, { SITE_URL } from "@/site.config";
import { normalizePath } from "./functionUtils";

/**
 * SEO helpers for the CMS-driven pages.
 *
 * Copy comes out of the CMS as HTML, with the heading highlight wrapped in
 * [square brackets], so every value has to be flattened to plain text before it
 * can be used in a <title>, a description or a JSON-LD field.
 *
 * Nothing brand-specific is defined here — it all comes from `site.config.js`,
 * which is the one file a clone of this base edits. The three re-exports below
 * keep the existing import sites working.
 */

export const SITE_NAME = site.name;

export { SITE_URL };

// Social card used when a record has no image of its own yet.
export const DEFAULT_SEO_IMAGE = site.defaultImage;

const ENTITIES = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
    "#39": "'",
    "#x27": "'",
    "#8217": "’",
    lsquo: "‘",
    rsquo: "’",
    ldquo: "“",
    rdquo: "”",
    ndash: "–",
    mdash: "—",
    hellip: "…",
};

/** CMS html -> one line of plain text. */
export const plainText = (value) => {
    if (!value) return "";

    return String(value)
        .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(
            /&([a-z]+|#x?[0-9a-f]+);/gi,
            (match, entity) => ENTITIES[entity.toLowerCase()] ?? " ",
        )
        .replace(/[[\]]/g, "") // headings carry their highlight in [brackets]
        .replace(/\s+/g, " ")
        .trim();
};

/** First of the candidates that still has text once the markup is stripped. */
export const firstText = (...values) => {
    for (const value of values) {
        const text = plainText(value);
        if (text) return text;
    }

    return "";
};

/** Trim to `max` characters, on a word boundary where there is one. */
export const truncate = (value, max) => {
    const text = plainText(value);
    if (text.length <= max) return text;

    const clipped = text.slice(0, max - 1);
    const lastSpace = clipped.lastIndexOf(" ");
    const kept = lastSpace > max * 0.6 ? clipped.slice(0, lastSpace) : clipped;

    return `${kept.replace(/[\s,.;:–—-]+$/, "")}…`;
};

/** "<title>" text: the record title, brand-suffixed unless it says it already. */
export const metaTitle = (value) => {
    const text = truncate(value, 60);
    if (!text) return SITE_NAME;

    return text.toLowerCase().includes(SITE_NAME.toLowerCase())
        ? text
        : `${text} | ${SITE_NAME}`;
};

/** Description from the first candidate that has copy, clipped to ~160 chars. */
export const metaDescription = (...values) => truncate(firstText(...values), 160);

/**
 * Absolute url for anything that goes in a head tag. Uploads are served by the
 * CMS host, everything else ships with the site.
 */
export const absoluteUrl = (path) => {
    if (!path || typeof path !== "string") return "";
    if (/^https?:\/\//i.test(path)) return path;

    const suffix = path.startsWith("/") ? path : `/${path}`;

    return suffix.startsWith("/media/")
        ? `${BASE_URL}${suffix}`
        : `${SITE_URL}${suffix}`;
};

/** Canonical url for a route path, without query string or trailing slash. */
export const canonicalUrl = (path) => {
    const route = normalizePath(path);

    return route === "/" ? SITE_URL : `${SITE_URL}${route}`;
};

const attribute = (tag, name) => {
    const match = tag.match(
        new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i"),
    );

    if (!match) return "";

    return (match[2] ?? match[3] ?? match[4] ?? "").trim();
};

/**
 * Drop the placeholder tags CMS records are usually saved with
 * (`<meta name="description" content=" ">`, an empty `<title>`), so they cannot
 * shadow or duplicate the tags derived from the record.
 */
export const cleanHeadHtml = (html) => {
    if (!html) return "";

    return String(html)
        .replace(/<title[^>]*>\s*<\/title>/gi, "")
        .replace(/<meta\b[^>]*>/gi, (tag) => {
            const key = attribute(tag, "name") || attribute(tag, "property");
            if (!key) return tag; // charset and friends carry no content

            return attribute(tag, "content") ? tag : "";
        })
        .replace(/<link\b[^>]*>/gi, (tag) => (attribute(tag, "href") ? tag : ""))
        .trim();
};

/**
 * Which tags a CMS `head` string already fills in, as lowercase keys
 * ("title", "description", "og:image", "canonical", ...).
 *
 * Records are routinely saved with placeholder tags (`content=" "`), so a blank
 * value does not count as defined — the derived tag is used instead.
 */
export const definedHeadTags = (html) => {
    const defined = new Set();
    if (!html) return defined;

    const source = String(html);

    if (/<title[^>]*>\s*[^<\s][\s\S]*?<\/title>/i.test(source)) {
        defined.add("title");
    }

    for (const tag of source.match(/<meta\b[^>]*>/gi) || []) {
        const key = attribute(tag, "name") || attribute(tag, "property");
        if (key && attribute(tag, "content")) defined.add(key.toLowerCase());
    }

    for (const tag of source.match(/<link\b[^>]*>/gi) || []) {
        if (
            attribute(tag, "rel").toLowerCase() === "canonical" &&
            attribute(tag, "href")
        ) {
            defined.add("canonical");
        }
    }

    return defined;
};

/* ------------------------------------------------------------------ */
/* JSON-LD                                                             */
/* ------------------------------------------------------------------ */

export const organizationSchema = () => ({
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl(site.logo),
});

export const breadcrumbSchema = (items) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: (items || [])
        .filter((item) => item?.name && item?.path)
        .map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: plainText(item.name),
            item: canonicalUrl(item.path),
        })),
});

export const articleSchema = ({
    title,
    description,
    image,
    path,
    published,
    modified,
    section,
}) => ({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl(path) },
    headline: truncate(title, 110),
    description: metaDescription(description),
    image: [absoluteUrl(image || DEFAULT_SEO_IMAGE)],
    ...(section ? { articleSection: plainText(section) } : {}),
    ...(published ? { datePublished: published } : {}),
    ...(modified || published ? { dateModified: modified || published } : {}),
    author: organizationSchema(),
    publisher: organizationSchema(),
});

export const serviceSchema = ({ name, description, image, path }) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": canonicalUrl(path),
    name: plainText(name),
    serviceType: plainText(name),
    description: metaDescription(description),
    ...(image ? { image: absoluteUrl(image) } : {}),
    url: canonicalUrl(path),
    provider: organizationSchema(),
    areaServed: { "@type": "Country", name: site.country.name },
});

// "Full-time" -> "FULL_TIME"; schema.org spells a contract role CONTRACTOR.
const EMPLOYMENT_TYPES = {
    CONTRACT: "CONTRACTOR",
    FREELANCE: "CONTRACTOR",
    INTERNSHIP: "INTERN",
};

export const jobPostingSchema = (job, path) => {
    const employment = plainText(job?.type)
        .toUpperCase()
        .replace(/[\s-]+/g, "_");
    // the CMS writes the work mode into the location ("Mumbai / On-site")
    const location = plainText(job?.location);
    const remote = /remote|anywhere/i.test(location);
    const locality = location.split(/[/|]/)[0].trim();

    return {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: plainText(job?.title),
        description: job?.about || job?.description || "",
        url: canonicalUrl(path),
        ...(job?.id ? { identifier: { "@type": "PropertyValue", name: SITE_NAME, value: String(job.id) } } : {}),
        ...(job?.posted ? { datePosted: job.posted } : {}),
        ...(employment
            ? { employmentType: EMPLOYMENT_TYPES[employment] || employment }
            : {}),
        ...(job?.category ? { occupationalCategory: plainText(job.category) } : {}),
        hiringOrganization: organizationSchema(),
        ...(remote
            ? {
                jobLocationType: "TELECOMMUTE",
                applicantLocationRequirements: {
                    "@type": "Country",
                    name: site.country.name,
                },
            }
            : {}),
        ...(locality && !remote
            ? {
                jobLocation: {
                    "@type": "Place",
                    address: {
                        "@type": "PostalAddress",
                        addressLocality: locality,
                        addressCountry: site.country.code,
                    },
                },
            }
            : {}),
        directApply: true,
    };
};
