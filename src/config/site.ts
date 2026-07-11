/**
 * Single source of truth for site identity, used by metadata, JSON-LD,
 * OG images, the sitemap, and robots. Values can be overridden per
 * environment with NEXT_PUBLIC_* vars; the fallbacks match production.
 */
export const siteConfig = {
  name: "AuraCV",
  /** Apex origin of the marketing site (no trailing slash). */
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://auracv.me",
  /** Root domain that portfolios hang off of: <username>.auracv.me */
  domain: "auracv.me",
  title: "AuraCV — Create Stunning Portfolios and CVs That Get You Hired",
  description:
    "Turn your resume into a beautiful, shareable portfolio in seconds. AuraCV gives job seekers, professionals, and students a polished personal site at their own address.",
  tagline: "Turn your résumé into a portfolio that gets you hired.",
  locale: "en_US",
  /** parchment-100 — the app-wide background (see tailwind.config.ts). */
  themeColor: "#F8F7F3",
  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID || "G-3VBBZ01RDS",
    gtmId: process.env.NEXT_PUBLIC_GTM_ID || "GTM-P92GBK9P",
  },
} as const;

/** Canonical origin of a published portfolio. */
export function portfolioOrigin(slug: string): string {
  return `https://${slug}.${siteConfig.domain}`;
}
