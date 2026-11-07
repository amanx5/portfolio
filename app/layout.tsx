import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The owner's main site, which hosts the shared icons. Unset: no icon tags.
const mainSite = process.env.MAIN_SITE_URL;

// SITE_URL wins; on Vercel, VERCEL_PROJECT_PRODUCTION_URL (the production domain, without https://)
// is set automatically, so production needs no setup.
function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

export const metadata: Metadata = {
  // makes relative metadata URLs (og:url, og:image) absolute for link previews
  metadataBase: new URL(siteUrl()),
  title: "Portfolio",
  description: "Portfolio website",
  // the icons live on the main site so both sites share one copy (see /favicon.ico in next.config.ts)
  icons: mainSite
    ? {
        icon: [
          { url: `${mainSite}/favicon.ico`, sizes: "32x32" },
          { url: `${mainSite}/icon.png`, type: "image/png", sizes: "96x96" },
        ],
        apple: `${mainSite}/apple-touch-icon.png`,
      }
    : undefined,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased font-sans",
        geistSans.variable,
        geistMono.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
