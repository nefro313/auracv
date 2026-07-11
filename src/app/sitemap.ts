import type { MetadataRoute } from "next";
import { portfolioOrigin, siteConfig } from "@/config/site";
import { resolveTenant } from "@/lib/seo/host";
import { getPublicProfileTimestamp } from "@/lib/public-profile";

/**
 * Host-aware: a sitemap may only list URLs on its own host, so the marketing
 * host lists its indexable pages while each <username>.auracv.me host lists
 * that portfolio's two pages (with a real lastModified from the user row).
 * Auth-gated app pages are noindexed and intentionally omitted.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tenant = await resolveTenant();

  if (tenant.kind === "portfolio") {
    const row = await getPublicProfileTimestamp(tenant.slug);
    // Unclaimed subdomain — nothing to index here.
    if (!row) return [];

    const origin = portfolioOrigin(tenant.slug);
    const lastModified = row.updatedAt ? new Date(row.updatedAt) : undefined;
    return [
      {
        url: `${origin}/`,
        lastModified,
        changeFrequency: "weekly",
        priority: 1,
      },
      {
        url: `${origin}/resume`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.8,
      },
    ];
  }

  return [
    {
      url: `${siteConfig.url}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/signup`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteConfig.url}/privacy-policy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
