import APIBase from "../utils/apiBase";
import { API_BASE_URL } from "@/site.config";

// Set NEXT_PUBLIC_API_BASE_URL in .env to point a clone at its own CMS —
// the fallback lives in site.config.js, not here.
export const BASE_URL = API_BASE_URL;

export const SiteSettingApi = new APIBase({
    baseURL: `${BASE_URL}/api/site-setting/`,
});

///////////////////////////////// Forms ////////////////////////////

// contact api
export const ContactApi = new APIBase({
    baseURL: `${BASE_URL}/api/contact/`,
});

// Faqs API
export const FaqApi = new APIBase({
    baseURL: `${BASE_URL}/api/faq/`,
});

export const FaqCategoryApi = new APIBase({
    baseURL: `${BASE_URL}/api/faq-category/`,
});

////////////////////// Career //////////////////////

export const CareerApi = new APIBase({
    baseURL: `${BASE_URL}/api/career/`,
});

export const CareerCategoryApi = new APIBase({
    baseURL: `${BASE_URL}/api/career-category/`,
});

// Resume upload, so the Content-Type is left to axios to set the multipart
// boundary itself.
export const CareerApplicationApi = new APIBase({
    baseURL: `${BASE_URL}/api/career-application/`,
    defaultHeaders: { "ngrok-skip-browser-warning": "true" },
});

////////////////////// Leadership / Our team //////////////////////

export const LeadershipApi = new APIBase({
    baseURL: `${BASE_URL}/api/leadership/`,
});

////////////// Blogs ////////////////////////

export const BlogListApi = new APIBase({
    baseURL: `${BASE_URL}/api/blog/`,
});

export const BlogCategoryApi = new APIBase({
    baseURL: `${BASE_URL}/api/blog-category/`,
});

////////////////////// Declared, no page yet //////////////////////
// Endpoints the reference backend serves that a clone usually wants next.

export const CaseStudyListApi = new APIBase({
    baseURL: `${BASE_URL}/api/case-study/`,
});

export const CaseStudyCategoryApi = new APIBase({
    baseURL: `${BASE_URL}/api/case-study-category/`,
});

export const testimonialAPI = new APIBase({
    baseURL: `${BASE_URL}/api/testimonial/`,
});