import { headers } from "next/headers";

export type Tenant =
  | { kind: "marketing" }
  | { kind: "portfolio"; slug: string };

const MARKETING_LABELS = new Set(["www", "auracv"]);

/**
 * Resolve which surface this request is for. The proxy middleware stores the
 * host's first label in `x-current-path`; the apex/www host, localhost, and
 * Vercel preview deployments are the marketing site — any other label is a
 * portfolio subdomain slug.
 *
 * This is the single host-detection point for the app: pages, metadata, the
 * favicon, the OG image, robots, and the sitemap all branch on it.
 */
export async function resolveTenant(): Promise<Tenant> {
  const headersList = await headers();
  const host =
    headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "";
  const label = (headersList.get("x-current-path") ?? host).split(".")[0];

  if (
    !label ||
    MARKETING_LABELS.has(label) ||
    label.startsWith("localhost") ||
    host.endsWith(".vercel.app")
  ) {
    return { kind: "marketing" };
  }
  return { kind: "portfolio", slug: label };
}

/**
 * Origin of the apex host for the current request — `https://auracv.me` in
 * production, `http://localhost:3000` in dev — so redirects out of a
 * portfolio subdomain work in both environments.
 */
export async function apexOrigin(): Promise<string> {
  const headersList = await headers();
  const host =
    headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "";

  // Dev: "robinkk.localhost:3000" → "localhost:3000".
  const localhostIndex = host.indexOf("localhost");
  if (localhostIndex >= 0) {
    return `http://${host.slice(localhostIndex)}`;
  }
  const parts = host.split(".");
  const apex = parts.length > 2 ? parts.slice(1).join(".") : host;
  return `https://${apex}`;
}
