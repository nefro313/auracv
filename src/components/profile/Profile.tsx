"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCommonContext } from "@/Common_context";
import { supabase } from "@/utils/supabase/client";
import { UserProfile } from "@/lib/type";
import {
  externalHref,
  faviconUrl,
  profileCompleteness,
  skillCount,
} from "@/lib/utils";
import { ProfileSkeleton } from "@/components/ui/skeletons";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

type Row = {
  userName: string;
  userEmail: string;
  resumeJson: UserProfile;
};

// Match the built-in networks to the brand icons used by the editor's Social
// Links section (public/icon/*). Keyed case-insensitively by network name.
const NETWORK_ICONS: Record<string, string> = {
  linkedin: "/icon/linkedin.png",
  github: "/icon/github.png",
  x: "/icon/twitter.png",
  twitter: "/icon/twitter.png",
  youtube: "/icon/youtube.png",
  dribbble: "/icon/dribbble.png",
  medium: "/icon/medium.svg",
};

/** Icon for a connected profile: a known brand icon, else the destination
 *  site's own favicon, else a generic link glyph. */
const networkIcon = (network: string, url: string) =>
  NETWORK_ICONS[(network || "").trim().toLowerCase()] ||
  faviconUrl(url) ||
  "/icon/link.svg";

export default function Profile() {
  const { userData, logout } = useCommonContext();
  const router = useRouter();

  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!userData?.user?.id) return;
    let active = true;

    (async () => {
      const { data, error } = await supabase
        .from("users")
        .select("userName,userEmail,resumeJson")
        .eq("userId", userData.user.id);

      if (!active) return;

      if (error || !data || data.length === 0) {
        router.push("/create");
        return;
      }
      setRow(data[0] as Row);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [userData, router]);

  const profileUrl = row ? `${row.userName}.auracv.me` : "";

  const handleCopy = async () => {
    if (!profileUrl) return;
    try {
      await navigator.clipboard.writeText(`https://${profileUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  const basics = row?.resumeJson?.basics;
  const avatar =
    basics?.avatarUrl || userData?.user?.user_metadata?.avatar_url || "";
  const displayName =
    basics?.name || userData?.user?.user_metadata?.full_name || "Your name";

  const stats = useMemo(() => {
    const r = row?.resumeJson;
    return [
      { label: "Experience", value: r?.work?.length ?? 0 },
      { label: "Projects", value: r?.projects?.projects?.length ?? 0 },
      { label: "Skills", value: skillCount(r) },
      { label: "Education", value: r?.education?.length ?? 0 },
    ];
  }, [row]);

  // Portfolio completeness — a friendly "how filled-out is this" signal.
  const completeness = useMemo(
    () => profileCompleteness(row?.resumeJson, avatar),
    [row, avatar],
  );

  const memberSince = userData?.user?.created_at
    ? new Date(userData.user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="relative w-full overflow-x-clip pb-20">
      {/* Paper grain + aura bloom */}
      <div
        aria-hidden
        className="bg-grain pointer-events-none absolute inset-0 z-0 opacity-[0.05] mix-blend-multiply"
      />
      <div
        aria-hidden
        className="animate-aura-drift pointer-events-none absolute left-1/2 top-[-12rem] z-0 h-[30rem] w-[42rem] max-w-none rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(139,92,246,0.16), rgba(6,182,212,0.08) 60%, transparent 100%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        {/* ---------------- Hero ---------------- */}
        <header className="animate-fade-up flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
          {/* Phones: avatar (left) + Edit (right) share the top row; name sits below. */}
          <div className="flex w-full items-center justify-between sm:block sm:w-auto">
            <div className="relative shrink-0">
              <div
                aria-hidden
                className="absolute -inset-1 rounded-full bg-gradient-to-tr from-aura-violet to-aura-cyan opacity-70 blur-[2px]"
              />
              <ImageWithFallback
                src={avatar}
                alt={displayName}
                fallback={displayName.charAt(0).toUpperCase()}
                wrapperClassName="relative h-20 w-20 rounded-full ring-4 ring-parchment-50 sm:h-24 sm:w-24"
                imgClassName="rounded-full object-cover"
                fallbackClassName="rounded-full bg-ink font-fraunces text-3xl text-parchment-50"
              />
            </div>
            <Link href="/studio" className="shrink-0 sm:hidden">
              <span className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-parchment-50 transition duration-300 hover:shadow-[0_0_28px_-6px_rgba(139,92,246,0.65)]">
                <PencilIcon />
                Edit Portfolio
              </span>
            </Link>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-ink-mute">
              Your account
            </p>
            <h1 className="mt-1.5 truncate font-fraunces text-3xl font-medium tracking-tight sm:text-4xl">
              {displayName}
            </h1>
            {basics?.label && (
              <p className="mt-1 text-sm font-medium text-ink-soft">
                {basics.label}
              </p>
            )}
          </div>

          <Link href="/studio" className="hidden shrink-0 sm:block">
            <span className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-parchment-50 transition duration-300 hover:shadow-[0_0_28px_-6px_rgba(139,92,246,0.65)]">
              <PencilIcon />
              Edit Portfolio
            </span>
          </Link>
        </header>

        {/* ---------------- Stats ---------------- */}
        <div className="animate-fade-up mt-10 grid grid-cols-2 gap-4 [animation-delay:120ms] sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-ink/10 bg-white/60 p-5 backdrop-blur-sm"
            >
              <p className="font-fraunces text-3xl font-medium text-ink">
                {s.value}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink-mute">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* ---------------- Two-up: portfolio + completeness ---------------- */}
        <div className="animate-fade-up mt-6 grid gap-6 [animation-delay:220ms] lg:grid-cols-5">
          {/* Live address */}
          <section className="lg:col-span-3 overflow-hidden rounded-3xl border border-ink/10 bg-white/60 p-7 backdrop-blur-sm">
            <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-ink-mute">
              Your live address
            </h2>
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-ink/10 bg-parchment-100/70 px-4 py-3">
              <span className="select-none text-ink-mute">https://</span>
              <span className="min-w-0 flex-1 truncate font-fraunces text-lg font-medium text-ink">
                {profileUrl}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white/70 px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:border-ink/25 hover:text-ink"
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
                {copied ? "Copied!" : "Copy link"}
              </button>
              <a
                href={`https://${profileUrl}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-parchment-50 transition duration-300 hover:shadow-[0_0_24px_-6px_rgba(139,92,246,0.65)]"
              >
                Visit site
                <ArrowUpRightIcon />
              </a>
              {basics?.resumeUrl && (
                <a
                  href={basics.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white/70 px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:border-ink/25 hover:text-ink"
                >
                  <DocIcon />
                  Résumé
                </a>
              )}
            </div>
          </section>

          {/* Completeness ring */}
          <section className="lg:col-span-2 flex flex-col items-center justify-center rounded-3xl border border-ink/10 bg-white/60 p-7 text-center backdrop-blur-sm">
            <CompletenessRing value={completeness} />
            <h2 className="mt-4 font-fraunces text-lg font-medium tracking-tight">
              Profile completeness
            </h2>
            <p className="mt-1 text-sm font-medium text-ink-soft">
              {completeness === 100
                ? "Beautifully complete."
                : "Add more to stand out."}
            </p>
          </section>
        </div>

        {/* ---------------- Account details ---------------- */}
        <section className="animate-fade-up mt-6 rounded-3xl border border-ink/10 bg-white/60 p-7 backdrop-blur-sm [animation-delay:320ms]">
          <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-ink-mute">
            Account details
          </h2>
          <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <DetailRow label="Email" value={row?.userEmail || "—"} />
            <DetailRow label="Username" value={`@${row?.userName}`} />
            <DetailRow
              label="Location"
              value={
                basics?.location?.city
                  ? [basics.location.city, basics.location.countryCode]
                      .filter(Boolean)
                      .join(", ")
                  : "—"
              }
            />
            <DetailRow label="Member since" value={memberSince} />
          </dl>

          {!!basics?.profiles?.length && (
            <div className="mt-7 border-t border-ink/10 pt-6">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-ink-mute">
                Connected profiles
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {basics.profiles
                  .filter((p) => p.url)
                  .map((p) => (
                    <a
                      key={p.url}
                      href={externalHref(p.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-2 rounded-full border border-ink/10 bg-parchment-100/70 py-1.5 pl-1.5 pr-4 text-sm font-medium text-ink-soft transition hover:border-ink/20 hover:text-ink"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white border border-ink/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={networkIcon(p.network, p.url)}
                          alt={p.network || "Link"}
                          className="h-4 w-4 object-contain"
                        />
                      </span>
                      {p.network || p.username || "Link"}
                    </a>
                  ))}
              </div>
            </div>
          )}
        </section>

        {/* ---------------- Sign out ---------------- */}
        <div className="animate-fade-up mt-6 flex items-center justify-between rounded-3xl border border-ink/10 bg-white/40 px-7 py-5 backdrop-blur-sm [animation-delay:420ms]">
          <div>
            <p className="font-fraunces text-base font-medium text-ink">
              Sign out
            </p>
            <p className="text-sm font-medium text-ink-mute">
              End your session on this device.
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="inline-flex items-center gap-2 rounded-full border border-[#B3402A]/30 bg-[#B3402A]/[0.06] px-5 py-2.5 text-sm font-semibold text-[#B3402A] transition hover:bg-[#B3402A]/10"
          >
            <LogoutIcon />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- small pieces ---------------- */

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-mute">
        {label}
      </dt>
      <dd className="mt-1 truncate font-medium text-ink">{value}</dd>
    </div>
  );
}

function CompletenessRing({ value }: { value: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const gid = "auraRing";

  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="rgba(33,27,18,0.08)"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-fraunces text-2xl font-medium text-ink">
          {value}
          <span className="text-base text-ink-mute">%</span>
        </span>
      </div>
    </div>
  );
}

/* ---------------- icons ---------------- */

const iconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.8,
  stroke: "currentColor",
  className: "size-4",
} as const;

const PencilIcon = () => (
  <svg {...iconProps}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"
    />
  </svg>
);

const CopyIcon = () => (
  <svg {...iconProps}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
    />
  </svg>
);

const CheckIcon = () => (
  <svg {...iconProps} className="size-4 text-aura-cyan">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m4.5 12.75 6 6 9-13.5"
    />
  </svg>
);

const ArrowUpRightIcon = () => (
  <svg {...iconProps}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 19.5 19.5 4.5m0 0H8.25m11.25 0v11.25"
    />
  </svg>
);

const DocIcon = () => (
  <svg {...iconProps}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg {...iconProps}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
    />
  </svg>
);
