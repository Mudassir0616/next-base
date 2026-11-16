import Image from "next/image";
import { API_BASE_URL } from "@/site.config";

const apiUrl = (() => {
    try {
        return new URL(API_BASE_URL);
    } catch {
        return null;
    }
})();

// Next 16 refuses to optimize images whose host resolves to a private
// address, which is where a clone's local backend lives during development.
const PRIVATE_HOST = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$)/;

/**
 * Whether next/image may optimize `src`: a raster file shipped in `public/`,
 * or an upload under the CMS's `/media/` (the one remote pattern next.config
 * allows). Anything else — an SVG, an absolute URL an editor pasted from
 * another site, a local dev backend — is served as-is, because asking the
 * optimizer for it would throw instead of rendering.
 */
const canOptimize = (src) => {
    if (typeof src !== "string" || /\.svg($|\?)/i.test(src)) return false;
    if (src.startsWith("/")) return true;

    try {
        const url = new URL(src);
        return (
            Boolean(apiUrl) &&
            url.origin === apiUrl.origin &&
            url.pathname.startsWith("/media/") &&
            !PRIVATE_HOST.test(url.hostname)
        );
    } catch {
        return false;
    }
};

/**
 * next/image for CMS content: resized, lazy-loaded and served as WebP/AVIF
 * where the source allows it, with a safe fallback where it doesn't.
 *
 * `width`/`height` only set the aspect ratio reserved before load and the
 * candidate sizes; the stylesheet still sizes the element (most containers
 * force `width/height: 100%` + `object-fit`). Always pass `sizes` matching
 * how wide the image renders, or the browser downloads the largest variant.
 */
const CmsImage = ({ src, alt = "", width = 1200, height = 800, sizes = "100vw", ...rest }) => {
    if (!src) return null;

    return (
        <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            unoptimized={!canOptimize(src)}
            {...rest}
        />
    );
};

export default CmsImage;
