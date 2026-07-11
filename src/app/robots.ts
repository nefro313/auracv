import type { MetadataRoute } from "next";

// Served at /robots.txt on every host (the marketing root and each
// <username>.auracv.me portfolio subdomain). Public pages — the landing
// site and portfolios — stay crawlable; the auth-gated app surfaces and
// internal API/auth routes are disallowed.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/", "/create", "/studio", "/profile"],
    },
    sitemap: "https://auracv.me/sitemap.xml",
  };
}
