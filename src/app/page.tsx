import Hero from "@/components/landingpage/Hero";
import UnclaimedSlug from "@/components/landingpage/UnclaimedSlug";
import Temp_1 from "@/components/design/temp_1";
import { headers } from "next/headers";
import { UserProfile, reservedWords } from "@/lib/type";
import { getPublicProfile } from "@/lib/public-profile";

const LANDING_PAGES = ["www", "auracv", "localhost:3000"] as const;

function generateJsonLd(user: UserProfile) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: user.basics.name,
    url: user.basics.website,
    image: user.basics.avatarUrl,
    description: user.basics.about,
    sameAs: user.basics.profiles.map((profile) => profile.url).filter(Boolean),
    worksFor:
      user.work.length > 0
        ? {
            "@type": "Organization",
            name: user.work[0].name,
          }
        : undefined,
    jobTitle: user.work.length > 0 ? user.work[0].position : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": user.basics.website,
    },
    education: user.education.map((edu) => ({
      "@type": "EducationalOrganization",
      name: edu.institution,
      degree: edu.studyType,
      startDate: edu.startDate,
      endDate: edu.endDate,
    })),
    experience: user.work.map((work) => ({
      "@type": "Organization",
      name: work.name,
      jobTitle: work.position,
      startDate: work.startDate,
      endDate: work.endDate,
    })),
    project: user.projects.projects.map((project) => ({
      "@type": "CreativeWork",
      name: project.title,
      description: project.description,
      url: project.website,
    })),
    award: user.hackathons.hackathons.map((hackathon) => ({
      "@type": "Award",
      name: hackathon.title,
      description: hackathon.description,
    })),
  };
}

export default async function IndexPage() {
  const headersList = await headers();
  const pathname = headersList.get("x-current-path")?.split(".")[0] || "";
  if (LANDING_PAGES.includes(pathname as (typeof LANDING_PAGES)[number])) {
    return <Hero />;
  }

  const data = await getPublicProfile(pathname);

  if (!data) {
    // The subdomain resolves to no portfolio. Rather than dumping the visitor
    // on the landing page, invite them to claim this exact address. Reserved
    // slugs (a valid AuraCV subdomain always matches `^[a-z0-9-]+$`) can't be
    // registered, so we flag those as unavailable.
    const claimable = !reservedWords.includes(pathname);
    return <UnclaimedSlug slug={pathname} claimable={claimable} />;
  }
  const jsonLd = generateJsonLd(data);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Temp_1 user={data} />
    </>
  );
}
