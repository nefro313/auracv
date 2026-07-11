import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ResumeTemplate from "@/components/design/resume_template";
import { getPublicProfile } from "@/lib/public-profile";
import { resolveTenant } from "@/lib/seo/host";
import { portfolioMetadata } from "@/lib/seo/metadata";
import { profilePageJsonLd } from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
import { portfolioOrigin } from "@/config/site";

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await resolveTenant();
  if (tenant.kind === "marketing") return {};

  const user = await getPublicProfile(tenant.slug);
  if (!user) return {};
  return portfolioMetadata(user, "resume");
}

export default async function ResumePage() {
  const tenant = await resolveTenant();

  // /resume only exists on a published portfolio. On the marketing host (and
  // on unclaimed subdomains) this page used to render a full copy of the
  // landing page — an indexable duplicate. Send those visitors home instead.
  if (tenant.kind === "marketing") redirect("/");

  const user = await getPublicProfile(tenant.slug);
  if (!user) redirect("/");

  return (
    <>
      <JsonLd
        data={profilePageJsonLd(
          user,
          portfolioOrigin(user.meta.userName),
          "/resume",
        )}
      />
      <ResumeTemplate profile={user} />
    </>
  );
}
