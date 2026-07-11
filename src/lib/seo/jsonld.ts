import { siteConfig } from "@/config/site";
import type { UserProfile } from "@/lib/type";

type JsonLd = Record<string, unknown>;

/**
 * Serialize JSON-LD for embedding in a <script> tag. `<` is escaped so
 * user-supplied strings (resume text) can never close the script element
 * and inject markup into the page.
 */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** The AuraCV brand entity — rendered on the marketing homepage. */
export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo-mark.svg`,
    description: siteConfig.description,
  };
}

/** The marketing site itself — rendered on the marketing homepage. */
export function webSiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    publisher: { "@id": `${siteConfig.url}/#organization` },
  };
}

/** The product as an application — rendered on the marketing homepage. */
export function webApplicationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteConfig.name,
    url: siteConfig.url,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: siteConfig.description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}

/**
 * A published portfolio as a ProfilePage whose mainEntity is the Person.
 * Only valid schema.org/Person properties are emitted, so the markup passes
 * rich-result validation (the previous generator used invented properties
 * like `experience` and `project`, which validators reject wholesale).
 */
export function profilePageJsonLd(
  user: UserProfile,
  origin: string,
  path: "/" | "/resume" = "/",
): JsonLd {
  const { basics, work, education, skills } = user;
  const jobTitle = basics.label || work?.[0]?.position;
  const sameAs = (basics.profiles ?? [])
    .map((profile) => profile.url)
    .filter(Boolean);

  const person: JsonLd = {
    "@type": "Person",
    "@id": `${origin}/#person`,
    name: basics.name,
    url: origin,
    ...(basics.avatarUrl ? { image: basics.avatarUrl } : {}),
    ...(basics.about ? { description: basics.about } : {}),
    ...(jobTitle ? { jobTitle } : {}),
    ...(work?.[0]?.name
      ? { worksFor: { "@type": "Organization", name: work[0].name } }
      : {}),
    ...(education?.length
      ? {
          alumniOf: education.map((edu) => ({
            "@type": "EducationalOrganization",
            name: edu.institution,
          })),
        }
      : {}),
    ...(skills?.length
      ? { knowsAbout: skills.map((skill) => skill.name).filter(Boolean) }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${origin}${path === "/" ? "/" : path}`,
    url: `${origin}${path === "/" ? "/" : path}`,
    name: basics.name,
    mainEntity: person,
  };
}
