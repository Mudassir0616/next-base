import React from "react";
import Head from "next/head";
import { renderHeadTags } from "@/utils/renderHeadTags";
import {
    absoluteUrl,
    canonicalUrl,
    cleanHeadHtml,
    DEFAULT_SEO_IMAGE,
    definedHeadTags,
    metaDescription,
    metaTitle,
    plainText,
    SITE_NAME,
} from "@/utils/seo";

/**
 * Head tags for a CMS-driven page.
 *
 * Whatever the record's own `head` field fills in wins — it is rendered first,
 * and every tag it already defines is skipped below. The rest is derived from
 * the record itself, so a page is never published without a title, a
 * description, a canonical and a social card.
 *
 * The derived tags carry no `key`, on purpose: next/head only de-duplicates
 * `<meta name>` when the tag is unkeyed, and rendering last is what lets a page
 * override the site-wide `global_head` from _app.
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
    const head = cleanHeadHtml(cmsHead);
    const defined = definedHeadTags(head);
    const missing = (key) => !defined.has(key);

    const pageTitle = metaTitle(title);
    const pageDescription = metaDescription(description);
    const pageUrl = canonicalUrl(path);
    const pageImage = absoluteUrl(image) || absoluteUrl(DEFAULT_SEO_IMAGE);
    const imageAlt = plainText(title) || SITE_NAME;

    const schemas = (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(Boolean);

    return (
        <Head>
            {/* the record's own head first, so the derived tags only fill gaps */}
            {head ? renderHeadTags(head) : null}

            {missing("title") && <title>{pageTitle}</title>}

            {missing("description") && pageDescription && (
                <meta name="description" content={pageDescription} />
            )}

            {missing("robots") && (
                <meta
                    name="robots"
                    content={noindex ? "noindex, nofollow" : "index, follow"}
                />
            )}

            {missing("canonical") && pageUrl && (
                <link rel="canonical" href={pageUrl} />
            )}

            {/* Open Graph */}
            {missing("og:type") && <meta property="og:type" content={type} />}
            {missing("og:site_name") && (
                <meta property="og:site_name" content={SITE_NAME} />
            )}
            {missing("og:title") && <meta property="og:title" content={pageTitle} />}
            {missing("og:description") && pageDescription && (
                <meta property="og:description" content={pageDescription} />
            )}
            {missing("og:url") && pageUrl && (
                <meta property="og:url" content={pageUrl} />
            )}
            {missing("og:image") && pageImage && (
                <meta property="og:image" content={pageImage} />
            )}
            {missing("og:image:alt") && pageImage && (
                <meta property="og:image:alt" content={imageAlt} />
            )}

            {type === "article" &&
                publishedTime &&
                missing("article:published_time") && (
                    <meta property="article:published_time" content={publishedTime} />
                )}
            {type === "article" &&
                (modifiedTime || publishedTime) &&
                missing("article:modified_time") && (
                    <meta
                        property="article:modified_time"
                        content={modifiedTime || publishedTime}
                    />
                )}

            {/* Twitter / X card */}
            {missing("twitter:card") && (
                <meta name="twitter:card" content="summary_large_image" />
            )}
            {missing("twitter:title") && (
                <meta name="twitter:title" content={pageTitle} />
            )}
            {missing("twitter:description") && pageDescription && (
                <meta name="twitter:description" content={pageDescription} />
            )}
            {missing("twitter:image") && pageImage && (
                <meta name="twitter:image" content={pageImage} />
            )}

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
