import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Turbopack is the default bundler from Next.js 16 on. It infers the project
 * root from the nearest lockfile, which picks up a stray lockfile in a parent
 * directory when this base is cloned into one — pin it to this folder.
 */
const projectRoot = dirname(fileURLToPath(import.meta.url));

// keep the fallback in step with API_BASE_URL in src/site.config.js
const cmsUrl = new URL(
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.grovantagroup.com",
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  turbopack: {
    root: projectRoot,
  },

  images: {
    // CMS uploads are served from the API host, so next/image has to be told
    // it may optimize them. Derived from NEXT_PUBLIC_API_BASE_URL (protocol
    // and port included, so an http://localhost:8000 backend matches too);
    // CmsImage serves anything outside this pattern unoptimized.
    remotePatterns: [
      {
        protocol: cmsUrl.protocol.replace(":", ""),
        hostname: cmsUrl.hostname,
        ...(cmsUrl.port ? { port: cmsUrl.port } : {}),
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
