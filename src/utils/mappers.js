import { highlight, mediaUrl } from "./functionUtils";

/**
 * The API returns one flat record per page section (see the `<section>_<field>`
 * naming in the CMS) plus the repeating blocks under `api_*` keys. The page
 * components were built against a nested shape, so the mapping lives here
 * rather than being spread across the components.
 */

// "Define: Establish the strategic objective." -> { label, title }
const splitStep = (value) => {
    const text = value || "";
    const separator = text.indexOf(":");

    if (separator === -1) return { label: "", title: text };

    return {
        label: text.slice(0, separator).trim(),
        title: text.slice(separator + 1).trim(),
    };
};

// Closing CTA band. Every field is optional in the CMS - the component keeps
// its own copy for whatever is left blank.
const mapCta = (record) => ({
    title: record.cta_title || "",
    description: record.cta_description || "",
    highlight: record.cta_highlight || "",
    button_text: record.cta_button_text || "",
    button_link: record.cta_button_link || "/contact",
});

// Expertise Category -> /expertise/[slug]
export const mapExpertiseCategory = (record) => {
    if (!record) return null;

    return {
        slug: record.slug,
        title: record.title,
        banner_description: record.subtitle,
        banner_image: mediaUrl(record.image, "/images/expertise-advisory-bg.webp"),
        sub_title: record.overview_eyebrow,

        intro: {
            title: highlight(record.overview_title),
            description: record.overview_description,
        },

        capabilities: (record.api_expertise || []).map((capability) => ({
            slug: capability.slug,
            title: capability.title,
            description: capability.subtitle,
            // the card has its own image; the banner image stands in when it is unset
            image: mediaUrl(
                capability.card_image || capability.image,
                "/images/delivery.webp",
            ),
        })),

        journey: {
            title: highlight(record.process_title),
            sub_title: record.process_subtitle,
            description: record.process_description,
            steps: (record.api_process || []).map((step) => ({
                title: step.title,
                description: step.description,
                icon: mediaUrl(step.icon, "/icons/advise.svg"),
            })),
        },

        engagement: {
            title: highlight(record.solutions_title),
            description: record.solutions_description,
            models: (record.api_solution || []).map((model) => ({
                title: model.title,
                description: model.description,
                icon: mediaUrl(model.icon, "/icons/strategic-advisory.svg"),
            })),
        },

        partners: record.api_partner || [],

        why: {
            title: "Why <span>Grovanta</span>",
            description: record.why_choose_us_description,
            points: record.api_why_choose_us_point || [],
            image: mediaUrl(record.why_choose_us_image, "/images/governance.webp"),
            cta_text: "Discuss Your Business Needs",
            cta_link: "/contact",
        },

        more_than: {
            title: highlight(record.our_approach_title),
            description: record.our_approach_description,
            image: mediaUrl(record.our_approach_image, "/images/delivery.webp"),
            cta_text: "Build With Us",
            cta_link: "/contact",
        },

        cta: mapCta(record),
    };
};

// Expertise -> /expertise/[slug]/[service]
export const mapExpertise = (record) => {
    if (!record) return null;

    return {
        slug: record.slug,
        category_slug: record.api_category?.slug || "",
        category_title: record.api_category?.title || "",
        title: record.title,
        banner_description: record.subtitle,
        banner_image: mediaUrl(record.image, "/images/expertise-advisory-bg.webp"),

        intro: {
            sub_title: record.overview_eyebrow,
            title: highlight(record.overview_title),
            description: record.overview_description,
        },

        capabilities_description: record.capability_description,
        capabilities: (record.api_capability || []).map((capability) => ({
            title: capability.title,
            description: capability.description,
            icon: mediaUrl(capability.icon, "/icons/strategic-advisory.svg"),
        })),

        pathways: {
            title: record.growth_title,
            description: record.growth_description,
            items: record.api_growth || [],
        },

        approach: {
            title: highlight(record.process_title),
            description: record.process_description,
            steps: (record.api_process || []).map((step) => ({
                ...splitStep(step.title),
                description: step.description,
                icon: mediaUrl(step.icon, "/icons/advise.svg"),
            })),
        },

        partners: record.api_partner || [],

        why: {
            description: record.why_choose_us_description,
            points: record.api_why_choose_us_point || [],
            image: mediaUrl(record.why_choose_us_image, "/images/why-grovanta.webp"),
        },

        closing: {
            title: highlight(record.our_approach_title),
            description: record.our_approach_description,
            image: mediaUrl(record.our_approach_image, "/images/more-than.webp"),
            cta_text: "Speak with Our Team",
            cta_link: "/contact",
        },

        cta: mapCta(record),

        // per-section switches from the CMS; anything not sent stays visible
        show: {
            overview: record.show_overview !== false,
            capability: record.show_capability !== false,
            growth: record.show_growth !== false,
            process: record.show_process !== false,
            partner: record.show_partner !== false,
            why: record.show_why_choose_us !== false,
            our_approach: record.show_our_approach !== false,
            cta: record.show_cta !== false,
        },
    };
};

// Career -> /careers and /careers/[slug]
export const mapCareer = (record) => {
    if (!record) return null;

    return {
        id: record.id,
        slug: record.slug,
        title: record.title,
        image: mediaUrl(record.image, ""),
        is_active: record.is_active !== false,
        category: record.api_category?.name || "",
        location: record.location,
        type: record.job_type,
        description: record.short_description,
        posted: record.created_at,
        about: record.about_role,
        responsibilities: record.api_responsibility || [],
        required_skills: record.api_required_skill || [],
        nice_to_haves: record.api_nice_to_have || [],
    };
};
