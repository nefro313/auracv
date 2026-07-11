import type { MetadataRoute } from "next";

const BASE = "https://auracv.me";

// Marketing/root pages only. Public portfolios live on their own
// <username>.auracv.me hosts — a sitemap may only list URLs on its own host,
// so those pages are surfaced through per-portfolio metadata (see the root
// layout) rather than here. Auth-gated app pages are intentionally omitted.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${BASE}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE}/signup`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/login`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE}/privacy-policy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
