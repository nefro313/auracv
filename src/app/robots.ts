import type { MetadataRoute } from "next";
import { portfolioOrigin, siteConfig } from "@/config/site";
import { resolveTenant } from "@/lib/seo/host";

// Served at /robots.txt on every host (the marketing root and each
// <username>.auracv.me portfolio subdomain). Public pages — the landing
// site and portfolios — stay crawlable; the auth-gated app surfaces and
// internal API/auth routes are disallowed (and additionally noindexed via
// their page metadata). The sitemap reference points at the current host,
// since each host serves its own sitemap.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const tenant = await resolveTenant();
  const origin =
    tenant.kind === "portfolio" ? portfolioOrigin(tenant.slug) : siteConfig.url;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/", "/create", "/studio", "/profile"],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
