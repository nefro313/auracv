import { permanentRedirect } from "next/navigation";
import { apexOrigin, resolveTenant } from "@/lib/seo/host";

/**
 * Historical alias for the landing page: on portfolio subdomains "/" is the
 * portfolio itself, so header links reach the marketing site via /auracv.
 * Serving the full landing page here created an indexable duplicate of the
 * homepage — permanently redirect to the canonical URL instead. On a
 * portfolio subdomain that means hopping to the apex host.
 */
export default async function AuracvRedirect() {
  const tenant = await resolveTenant();
  if (tenant.kind === "marketing") permanentRedirect("/");
  permanentRedirect(await apexOrigin());
}
