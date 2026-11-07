import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // crawlers and old browsers request /favicon.ico directly; the icons live on the main site.
  // Temporary (307) so browsers don't cache it forever if the icon ever moves.
  redirects() {
    const mainSite = process.env.MAIN_SITE_URL;
    if (!mainSite) return [];
    return [
      {
        source: "/favicon.ico",
        destination: `${mainSite}/favicon.ico`,
        permanent: false,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
