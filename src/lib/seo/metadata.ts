import type { Metadata } from "next";
import { portfolioOrigin, siteConfig } from "@/config/site";
import type { UserProfile } from "@/lib/type";

const INDEX_ROBOTS: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
};

const NOINDEX_ROBOTS: Metadata["robots"] = { index: false, follow: false };

/** Trim copy to a search-snippet-friendly length on a word boundary. */
function snippet(text: string | undefined | null, max = 160): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 0)) || cut}…`;
}

/**
 * Site-wide defaults, exported statically from the root layout. Pages refine
 * these — the layout deliberately stays host-agnostic so routes that don't
 * need request headers can render statically.
 */
export function rootMetadata(): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: siteConfig.title,
      template: `%s — ${siteConfig.name}`,
    },
    description: siteConfig.description,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    category: "technology",
    robots: INDEX_ROBOTS,
    openGraph: {
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

/** The marketing homepage (`auracv.me/`). */
export function marketingHomeMetadata(): Metadata {
  return {
    alternates: { canonical: "/" },
    openGraph: {
      title: siteConfig.title,
      description: siteConfig.description,
      url: "/",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.title,
      description: siteConfig.description,
    },
  };
}

/**
 * Static marketing/app pages (login, signup, privacy, studio, …). The
 * canonical always points at the apex host, so copies of these routes
 * reachable on portfolio subdomains consolidate to one URL.
 */
export function staticPageMetadata(options: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  const { title, description, path, noindex } = options;
  const fullTitle = `${title} — ${siteConfig.name}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    ...(noindex ? { robots: NOINDEX_ROBOTS } : {}),
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

/** A published portfolio (`<slug>.auracv.me/` or `/resume`). */
export function portfolioMetadata(
  user: UserProfile,
  page: "home" | "resume",
): Metadata {
  const slug = user.meta.userName;
  const origin = portfolioOrigin(slug);
  const name = user.basics.name;
  const role = user.basics.label || user.work?.[0]?.position || "Portfolio";
  const title =
    page === "resume"
      ? `${name} — Résumé | ${siteConfig.name}`
      : `${name} — ${role} | ${siteConfig.name}`;
  const description =
    snippet(user.basics.about) ||
    `${name}'s portfolio on ${siteConfig.name} — experience, projects, skills, and education.`;
  const path = page === "resume" ? "/resume" : "/";

  return {
    metadataBase: new URL(origin),
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/**
 * A subdomain nobody has claimed. The claim invitation stays useful to the
 * visitor, but an unbounded space of these must never enter search indexes.
 */
export function unclaimedMetadata(slug: string): Metadata {
  return {
    title: { absolute: `${slug}.${siteConfig.domain} is available — ${siteConfig.name}` },
    description: `The address ${slug}.${siteConfig.domain} hasn't been claimed yet. Build your portfolio with ${siteConfig.name} and make it yours.`,
    robots: NOINDEX_ROBOTS,
  };
}
