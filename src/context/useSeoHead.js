import { createContext, useContext } from "react";

/**
 * The CMS head strings for the current route — `{ route, global }`, as
 * returned in `seoHead` by `fetchPageSeo()` — handed from _app to <Seo>.
 *
 * <Seo> renders them itself, interleaved with the tags it derives, so the
 * precedence between them is decided in one place (see Seo.jsx).
 */
export const SeoHeadContext = createContext({ route: null, global: null });

export const useSeoHead = () => useContext(SeoHeadContext);
