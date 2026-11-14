import { cloneElement, isValidElement } from 'react';
import parse from 'html-react-parser';

const ALLOWED = new Set(['title', 'meta', 'link', 'script', 'noscript', 'style', 'base']);

/**
 * The key a head tag is de-duplicated by. next/head drops all but the last
 * tag per key, so every source of head tags — the CMS strings parsed here and
 * the tags <Seo> derives — must key the same tag the same way:
 *
 *   <title>                      -> "title"
 *   <meta name|property="x">     -> "meta:x"   (og:*, twitter:*, description…)
 *   <link rel="canonical">       -> "canonical"
 *
 * Unkeyed, next/head dedupes only <title> and <meta name>, so a CMS og:title
 * and a derived one would both ship.
 */
export const metaKey = (name) => `meta:${String(name).toLowerCase()}`;

const identityKey = (element) => {
    const { type, props } = element;

    if (type === 'title') return 'title';
    if (type === 'meta' && (props.name || props.property)) {
        return metaKey(props.name || props.property);
    }
    if (type === 'link' && String(props.rel).toLowerCase() === 'canonical') {
        return 'canonical';
    }

    return null;
};

/**
 * CMS head html -> keyed React elements for next/head.
 *
 * Only head-safe tags survive, and inline <script> is dropped (external
 * `src` scripts are kept). `prefix` keeps the keys of tags with no identity
 * (a stylesheet link, a verification script) unique between the several CMS
 * strings one page renders.
 */
export function renderHeadTags(html, prefix = 'head') {
    if (!html) return [];

    // Replace non-breaking spaces and invisible characters editors paste in
    const cleanedHtml = String(html)
        .replace(/ /g, ' ')
        .replace(/<(\w+)([^>]*?)>/g, (match, tag, attrs) => {
            const cleanedAttrs = attrs.replace(/[ ​﻿]/g, '');
            return `<${tag}${cleanedAttrs}>`;
        });

    const nodes = [].concat(parse(cleanedHtml));

    return nodes
        .filter((node) => isValidElement(node) && ALLOWED.has(node.type))
        .filter((node) => node.type !== 'script' || node.props?.src)
        .map((node, index) =>
            cloneElement(node, { key: identityKey(node) || `${prefix}-${index}` }),
        );
}
