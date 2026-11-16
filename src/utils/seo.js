import { BASE_URL } from "@/api/api";
import site, { SITE_URL } from "@/site.config";
import { normalizePath, splitPipeList } from "./functionUtils";

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

/* ------------------------------------------------------------------ */
/* JSON-LD                                                             */
/* ------------------------------------------------------------------ */

// One id per entity, so every schema on the site that mentions the
// organization (home, article publisher, job hiringOrganization) is read as
// the same node.
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export const organizationSchema = () => ({
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl(site.logo),
});

// A social field only counts as a profile when it names one. CMS records hold
// placeholders — "https://www.instagram.com/", "https://www.linkedin.com/in/"
// — so a bare host, or a host plus only a section prefix, is rejected.
const SECTION_PREFIXES = new Set(["in", "company", "channel", "c", "user", "pages", "groups"]);

const profileUrl = (value) => {
    try {
        const url = new URL(value);
        const segments = url.pathname.split("/").filter(Boolean);
        const named =
            segments.length > 1 ||
            (segments.length === 1 && !SECTION_PREFIXES.has(segments[0].toLowerCase()));

        return /^https?:$/.test(url.protocol) && named ? url.href : null;
    } catch {
        return null;
    }
};

const SOCIAL_FIELDS = ["linkedin", "instagram", "youtube", "facebook", "twitter"];

/**
 * The full Organization node for the home page, enriched from the
 * site-setting record (social profiles, contact email/phone). Build it in
 * getStaticProps — the setting record is too large to ship as props.
 */
export const organizationDetailsSchema = (setting = {}) => {
    const sameAs = [...new Set(SOCIAL_FIELDS.map((field) => profileUrl(setting[field])).filter(Boolean))];
    const telephone =
        setting.api_contact_number?.[0] || splitPipeList(setting.contact_number)[0];
    const email = setting.email;

    return {
        "@context": "https://schema.org",
        ...organizationSchema(),
        ...(sameAs.length ? { sameAs } : {}),
        ...(telephone || email
            ? {
                contactPoint: {
                    "@type": "ContactPoint",
                    contactType: "customer support",
                    ...(telephone ? { telephone } : {}),
                    ...(email ? { email } : {}),
                },
            }
            : {}),
    };
};

export const websiteSchema = () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: site.locale,
    publisher: { "@id": ORGANIZATION_ID },
});

/**
 * FAQPage from the `/api/faq/` records. Answers are flattened to text. Null
 * when there are no questions, so <Seo> skips it.
 */
export const faqPageSchema = (faqs = []) => {
    const questions = faqs
        .map((faq) => ({ name: plainText(faq.question), text: plainText(faq.answer) }))
        .filter((faq) => faq.name && faq.text);

    if (!questions.length) return null;

    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: questions.map((faq) => ({
            "@type": "Question",
            name: faq.name,
            acceptedAnswer: { "@type": "Answer", text: faq.text },
        })),
    };
};

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

// "Full-time" -> "FULL_TIME"; schema.org spells a contract role CONTRACTOR.
const EMPLOYMENT_TYPES = {
    CONTRACT: "CONTRACTOR",
    FREELANCE: "CONTRACTOR",
    INTERNSHIP: "INTERN",
};

export const jobPostingSchema = (job, path) => {
    const employment = plainText(job?.job_type)
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
        description: job?.about_role || job?.short_description || "",
        url: canonicalUrl(path),
        ...(job?.id ? { identifier: { "@type": "PropertyValue", name: SITE_NAME, value: String(job.id) } } : {}),
        ...(job?.created_at ? { datePosted: job.created_at } : {}),
        ...(employment
            ? { employmentType: EMPLOYMENT_TYPES[employment] || employment }
            : {}),
        ...(job?.api_category?.name
            ? { occupationalCategory: plainText(job.api_category.name) }
            : {}),
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
