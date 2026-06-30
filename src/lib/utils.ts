import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ThemeColor, UserProfile } from "./type";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalize a user-entered link to an absolute URL so it opens the real site.
 * A bare domain like "linkedin.com" is otherwise treated as a relative path and
 * resolves to "<our-domain>/linkedin.com". Internal paths ("/resume"),
 * mailto:/tel:, and links that already carry a protocol are left untouched.
 * Empty input returns "" so existing `href || "#"` fallbacks still apply.
 */
export function externalHref(url?: string | null): string {
  const trimmed = (url ?? "").trim();
  if (!trimmed) return "";
  if (/^(https?:\/\/|mailto:|tel:|\/)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return `https://${trimmed}`;
}

export const tailwindColors = [
  { name: "red", value: "#ef4444" },
  { name: "green", value: "#10b981" },
  { name: "white", value: "#fff" },
  { name: "blue", value: "#3b82f6" },
  { name: "yellow", value: "#f59e0b" },
  { name: "purple", value: "#8b5cf6" },
  { name: "pink", value: "#ec4899" },
  { name: "indigo", value: "#6366f1" },
  { name: "gray", value: "#6b7280" },
  { name: "orange", value: "#f97316" },
  { name: "teal", value: "#14b8a6" },
  { name: "cyan", value: "#06b6d4" },
  { name: "lime", value: "#84cc16" },
  { name: "emerald", value: "#10b981" },
  { name: "fuchsia", value: "#d946ef" },
  { name: "rose", value: "#f43f5e" },
  { name: "violet", value: "#8b5cf6" },
  { name: "sky", value: "#0ea5e9" },
];
export const tailwindColors100: Record<ThemeColor, string> = {
  red: "#fee2e2",
  green: "#d1fae5",
  white: "#ffffff",
  blue: "#dbeafe",
  yellow: "#fef9c3",
  purple: "#f3e8ff",
  pink: "#fce7f3",
  indigo: "#e0e7ff",
  gray: "#f3f4f6",
  orange: "#ffedd5",
  teal: "#ccfbf1",
  cyan: "#cffafe",
  lime: "#ecfccb",
  emerald: "#d1fae5",
  fuchsia: "#fae8ff",
  rose: "#ffe4e6",
  violet: "#f3e8ff",
  sky: "#e0f2fe",
};

export const initialUserState: UserProfile =
{
  meta: {
    resumeTheme: "",
    portfolioTheme: "",
    portfolioColor: "",
    userName: "",
    buttonText: "",
    avatarUrl: "",
  },
  basics: {
    name: "",
    phone: "",
    label: "",
    avatarUrl: "",
    about: "",
    website: "",
    resumeUrl: "",
    email: "",
    openToWork: false,
    skills: [],
    location: {
      city: "",
      countryCode: "",
    },
    profiles: [
      {
        username: "",
        url: "",
        network: "LinkedIn",
      },
      {
        username: "",
        url: "",
        network: "X",
      },
      {
        username: "",
        url: "",
        network: "GitHub",
      },
      {
        username: "",
        url: "",
        network: "Youtube",
      },
      {
        username: "",
        url: "",
        network: "Dribbble",
      },
      {
        username: "",
        url: "",
        network: "Medium",
      },
    ],
  },
  certificates: [
    {
      name: "",
      date: "",
      issuer: "",
      url: "",
    },
  ],
  education: [
    {
      endDate: "",
      startDate: "",
      area: "",
      studyType: "",
      summary: "",
      institution: "",
      url: "",
      logo: "",
      score: "",
      courses: [""],
    },
  ],
  skills: [
    {
      name: "",
      keywords: [""],
    },
  ],
  awards: [
    {
      title: "",
      awarder: "",
      date: "",
      summary: "",
    },
  ],
  hackathons: {
    description: "",
    hackathons: [
      {
        title: "",
        dates: "",
        location: "",
        description: "",
        image: "",
        win: "",
        url: "",
      },
    ],
  },
  publications: [
    {
      name: "",
      publisher: "",
      releaseDate: "",
      url: "",
      summary: "",
    },
  ],
  volunteer: [
    {
      organization: "",
      position: "",
      url: "",
      startDate: "",
      summary: "",
      highlights: [""],
    },
  ],
  work: [
    {
      summary: "",
      website: "",
      name: "",
      location: "",
      position: "",
      startDate: "",
      endDate: "",
      logo: "",
      highlights: [""],
    },
  ],
  projects: {
    description: "",
    projects: [
      {
        title: "",
        description: "",
        website: "",
        duration: "",
        technologies: [""],
        highlights: [""],
        image: "",
        source: "",
      },
    ],
  },
  languages: [
    {
      language: "",
      fluency: "",
    },
  ],
  interests: [
    {
      name: "",
      keywords: [""],
    },
  ],
  references: [
    {
      reference: "",
      name: "",
    },
  ],
};

/**
 * Portfolio "completeness" — a friendly 0–100 signal for how filled-out a
 * profile is. Shared by the Profile page and the post-login Welcome screen so
 * both always show the same number. `avatarUrl` lets callers fold in an avatar
 * that lives outside resumeJson (e.g. the OAuth session photo).
 */
export function profileCompleteness(
  profile?: UserProfile | null,
  avatarUrl?: string,
): number {
  if (!profile) return 0;

  const b = profile.basics;
  const hasText = (v?: string) => Boolean(v && v.trim());

  // Count a section "done" only when it has real content — array length alone
  // is misleading because new profiles seed empty placeholder rows (e.g. five
  // blank social links, a blank work/education/project row), which would
  // otherwise read as 100% complete on a near-empty profile.
  const checks = [
    hasText(b?.name),
    hasText(b?.about),
    hasText(avatarUrl) || hasText(b?.avatarUrl),
    skillCount(profile) > 0,
    (profile.work ?? []).some((w) => hasText(w?.name) || hasText(w?.position)),
    (profile.projects?.projects ?? []).some(
      (p) => hasText(p?.title) || hasText(p?.description),
    ),
    (profile.education ?? []).some(
      (e) => hasText(e?.institution) || hasText(e?.area),
    ),
    (b?.profiles ?? []).some((p) => hasText(p?.url)),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

/**
 * A friendly "how many skills" count, taken from the General Info tag list
 * (`basics.skills`). Empty tags are ignored, so a profile with none reads as 0.
 */
export function skillCount(profile?: UserProfile | null): number {
  if (!profile) return 0;
  return (profile.basics?.skills ?? []).filter(
    (s) => typeof s === "string" && s.trim(),
  ).length;
}
