import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DM_Sans, Outfit, Quattrocento, Fraunces } from "next/font/google";
import { Providers } from "./providers";
import { CommonContextProvider } from "@/CommonContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { siteConfig } from "@/config/site";
import { rootMetadata } from "@/lib/seo/metadata";

// Only the weights actually used in the codebase (300–600 in classes, 700
// for bold text in rendered markdown) — loading all eight per family was
// pure LCP cost.
const DM_SansFont = DM_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

const OutfitFont = Outfit({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

const QuattrocentoFont = Quattrocento({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-quattrocento",
});

const FrauncesFont = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz"],
});

// Host-agnostic defaults. Host-specific metadata (marketing vs portfolio vs
// unclaimed subdomain) lives in each page's generateMetadata, so routes that
// never read request headers can stay statically renderable.
export const metadata: Metadata = rootMetadata();

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVariables = ` ${DM_SansFont.variable} ${OutfitFont.variable} ${QuattrocentoFont.variable} ${FrauncesFont.variable}`;
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className="font-dmSans bg-parchment-100">
        <GoogleAnalytics gaId={siteConfig.analytics.gaId} />{" "}
        <GoogleTagManager gtmId={siteConfig.analytics.gtmId} />
        <CommonContextProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            <TooltipProvider delayDuration={0}>
              <Providers>
                {children} <Analytics />
                <SpeedInsights />
              </Providers>
            </TooltipProvider>
          </ThemeProvider>
        </CommonContextProvider>
      </body>
    </html>
  );
}
