import React from 'react';
import parse from 'html-react-parser';

// const ALLOWED = new Set(['title', 'meta', 'link', 'script', 'noscript', 'style', 'base']);

// export function renderHeadTags(html) {
//     if (!html) return null;

//     return parse(html, {
//         replace: (node) => {
//             // only allow real head tags
//             if ((node).type !== 'tag') return;
//             const el = node;

//             // allow only head-safe tags
//             if (!ALLOWED.has(el.name)) return <></>;

//             // (optional) block inline scripts for safety; allow only external script src
//             if (el.name === 'script' && (!el.attribs || !el.attribs.src)) return <></>;

//             // otherwise keep the node as-is
//             return;
//         },
//     });
// }

const ALLOWED = new Set(['title', 'meta', 'link', 'script', 'noscript', 'style', 'base']);

export function renderHeadTags(html) {
    if (!html) return null;

    // Replace non-breaking spaces and weird invisible chars in attributes
    const cleanedHtml = html
        .replace(/\u00A0/g, ' ') // replace non-breaking space
        .replace(/<(\w+)([^>]*?)>/g, (match, tag, attrs) => {
            // clean invalid characters in attribute names
            const cleanedAttrs = attrs.replace(/[\u00A0\u200B\uFEFF]/g, '');
            return `<${tag}${cleanedAttrs}>`;
        });

    return parse(cleanedHtml, {
        replace: (node) => {
            if (node.type !== 'tag') return;
            const el = node;
            if (!ALLOWED.has(el?.name)) return <></>;
            if (el?.name === 'script' && (!el?.attribs || !el?.attribs.src)) return <></>;
            return;
        },
    });
}


