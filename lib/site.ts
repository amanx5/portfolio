// This site's public URL. SITE_URL wins; on Vercel, VERCEL_PROJECT_PRODUCTION_URL (the production
// domain, without https://) is set automatically, so production needs no setup.
export function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

// The owner's main site, which hosts the images this site shares (favicon.ico, icon.png,
// apple-touch-icon.png at its root). Unset: no icons or avatar. No trailing slash.
export const mainSiteUrl = process.env.MAIN_SITE_URL;

// The largest shared image (180px), used for the header avatar and the link-preview image.
export const avatarUrl = mainSiteUrl
  ? `${mainSiteUrl}/apple-touch-icon.png`
  : undefined;
