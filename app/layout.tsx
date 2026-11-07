import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { avatarUrl, mainSiteUrl, siteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // makes relative metadata URLs (og:url, og:image) absolute for link previews
  metadataBase: new URL(siteUrl()),
  title: "Portfolio",
  description: "Portfolio website",
  // the icons live on the main site so both sites share one copy (see /favicon.ico in next.config.ts)
  icons: mainSiteUrl
    ? {
        icon: [
          { url: `${mainSiteUrl}/favicon.ico`, sizes: "32x32" },
          { url: `${mainSiteUrl}/icon.png`, type: "image/png", sizes: "96x96" },
        ],
        apple: avatarUrl,
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
        {/* Vercel Web Analytics: page views only, no cookies; sends nothing in development */}
        <Analytics />
      </body>
    </html>
  );
}
