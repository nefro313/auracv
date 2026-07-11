import type { Metadata } from "next";
import Hero from "@/components/landingpage/Hero";
import UnclaimedSlug from "@/components/landingpage/UnclaimedSlug";
import PortfolioTemplate from "@/components/design/PortfolioTemplate";
import { reservedWords } from "@/lib/user.types";
import { getPublicProfile } from "@/lib/public-profile";
import { resolveTenant } from "@/lib/seo/host";
import {
  marketingHomeMetadata,
  portfolioMetadata,
  unclaimedMetadata,
} from "@/lib/seo/metadata";
import {
  organizationJsonLd,
  profilePageJsonLd,
  webApplicationJsonLd,
  webSiteJsonLd,
} from "@/lib/seo/jsonld";
import { JsonLd } from "@/components/seo/JsonLd";
import { portfolioOrigin } from "@/config/site";

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await resolveTenant();
  if (tenant.kind === "marketing") return marketingHomeMetadata();

  const user = await getPublicProfile(tenant.slug);
  if (!user) return unclaimedMetadata(tenant.slug);
  return portfolioMetadata(user, "home");
}

export default async function IndexPage() {
  const tenant = await resolveTenant();

  if (tenant.kind === "marketing") {
    return (
      <>
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={webSiteJsonLd()} />
        <JsonLd data={webApplicationJsonLd()} />
        <Hero />
      </>
    );
  }

  const user = await getPublicProfile(tenant.slug);

  if (!user) {
    // The subdomain resolves to no portfolio. Rather than dumping the visitor
    // on the landing page, invite them to claim this exact address. Reserved
    // slugs (a valid AuraCV subdomain always matches `^[a-z0-9-]+$`) can't be
    // registered, so we flag those as unavailable. generateMetadata marks
    // these pages noindex — the space of unclaimed subdomains is unbounded.
    const claimable = !reservedWords.includes(tenant.slug);
    return <UnclaimedSlug slug={tenant.slug} claimable={claimable} />;
  }

  return (
    <>
      <JsonLd data={profilePageJsonLd(user, portfolioOrigin(user.meta.userName))} />
      <PortfolioTemplate user={user} />
    </>
  );
}
