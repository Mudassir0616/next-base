import { BASE_URL } from "@/api/api";

export const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePhone = (phone) => {
    return /^[0-9]{7,15}$/.test(phone);
    // 7–15 digits → works globally, not just India
};

/**
 * Absolute url for a media file returned by the API (`/media/...`), with a
 * local fallback so a section never renders a broken image while the CMS
 * record is still empty.
 */
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

// export const highlight = (value) => {
//     if (!value) return "";

//     return String(value)
//         .replace(/\[([^\]]+)\]/g, "<span>$1</span>")
//         .replace(/<br\s*\/?>/gi, "\n");
// };

/**
 * Server-side fetch used by getStaticProps/getStaticPaths. APIBase touches
 * localStorage in its request interceptor, so it cannot run during SSR — and a
 * backend that is unreachable at build time must not fail the build.
 */
export async function fetchApi(path) {
    try {
        const res = await fetch(`${BASE_URL}${path}`);

        if (!res.ok) {
            console.error("API failed:", path, res.status);
            return null;
        }

        return await res.json();
    } catch (error) {
        console.error("fetchApi:", path, error?.message);
        return null;
    }
}

export async function fetchSeoHeads(locale) {
    const data = await fetchApi("/api/head/");
    return data?.results || [];
}

export async function fetchGlobalHead(locale) {
    const data = await fetchApi("/api/site-setting/");
    return data?.results?.[0]?.global_head || null;
}

export function normalizePath(input) {
    if (!input) return "/";

    try {
        // If backend gives full URL
        if (input.startsWith("http")) {
            const url = new URL(input);
            return url.pathname.replace(/\/$/, "") || "/";
        }

        // If frontend path
        return input.split("?")[0].replace(/\/$/, "") || "/";
    } catch {
        return "/";
    }
}