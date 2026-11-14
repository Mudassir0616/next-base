import React from "react";
import Head from "next/head";
import { metaKey, renderHeadTags } from "@/utils/renderHeadTags";
import { useSeoHead } from "@/context/useSeoHead";
import {
    absoluteUrl,
    canonicalUrl,
    cleanHeadHtml,
    DEFAULT_SEO_IMAGE,
    metaDescription,
    metaTitle,
    plainText,
    SITE_NAME,
} from "@/utils/seo";

/**
 * Every head tag a page ships, from four sources. All of them key their tags
 * the same way (see `renderHeadTags`), and next/head keeps the last tag per
 * key, so render order is precedence — lowest first:
 *
 *   1. site-wide `global_head` from site settings (via SeoHeadContext)
 *   2. tags derived from this component's props — title, description,
 *      canonical, Open Graph, Twitter card
 *   3. the `/api/head/` record whose target_url is this route (via context)
 *   4. the record's own `head` field (`cmsHead`)
 *
 * so whatever an editor filled in wins, and a page never ships without a
 * title, a description, a canonical and a social card. Placeholder tags CMS
 * records are saved with (`content=" "`) are dropped first, so they never
 * win. `noindex` is applied after all four: no CMS markup can make a page
 * that asked not to be indexed indexable.
 *
 * Pass `path` explicitly — `router.asPath` is not reliable while a
 * `fallback: "blocking"` page is being generated.
 */
const Seo = ({
    title,
    description,
    image,
    path,
    type = "website",
    publishedTime,
    modifiedTime,
    noindex = false,
    cmsHead = null,
    jsonLd = [],
}) => {
    const { route, global } = useSeoHead();

    const pageTitle = metaTitle(title);
    const pageDescription = metaDescription(description);
    const pageUrl = canonicalUrl(path);
    const pageImage = absoluteUrl(image) || absoluteUrl(DEFAULT_SEO_IMAGE);
    const imageAlt = plainText(title) || SITE_NAME;
    const robots = noindex ? "noindex, nofollow" : "index, follow";

    const schemas = (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(Boolean);

    const meta = (name, content) =>
        content ? <meta key={metaKey(name)} name={name} content={content} /> : null;
    const property = (name, content) =>
        content ? (
            <meta key={metaKey(name)} property={name} content={content} />
        ) : null;

    const derived = [
        <title key="title">{pageTitle}</title>,
        meta("description", pageDescription),
        meta("robots", robots),
        // a canonical on a noindex page sends search engines mixed signals
        pageUrl && !noindex ? (
            <link key="canonical" rel="canonical" href={pageUrl} />
        ) : null,

        // Open Graph
        property("og:type", type),
        property("og:site_name", SITE_NAME),
        property("og:title", pageTitle),
        property("og:description", pageDescription),
        property("og:url", pageUrl),
        property("og:image", pageImage),
        property("og:image:alt", pageImage && imageAlt),
        type === "article" && property("article:published_time", publishedTime),
        type === "article" &&
            property("article:modified_time", modifiedTime || publishedTime),

        // Twitter / X card
        meta("twitter:card", "summary_large_image"),
        meta("twitter:title", pageTitle),
        meta("twitter:description", pageDescription),
        meta("twitter:image", pageImage),
    ].filter(Boolean);

    return (
        <Head>
            {renderHeadTags(cleanHeadHtml(global), "global")}
            {derived}
            {renderHeadTags(cleanHeadHtml(route), "route")}
            {renderHeadTags(cleanHeadHtml(cmsHead), "record")}

            {noindex && meta("robots", robots)}

            {schemas.map((schema, index) => (
                <script
                    key={`ld-json-${index}`}
                    type="application/ld+json"
                    // `<` is escaped so html inside a description cannot close the tag
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
                    }}
                />
            ))}
        </Head>
    );
};

export default Seo;
