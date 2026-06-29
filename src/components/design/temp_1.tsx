import React from "react";
import { HackathonCard } from "@/components/hackathon-card";
import { ProjectCard } from "@/components/project-card";
import { ResumeCard } from "@/components/resume-card";
import { EducationCard } from "@/components/education-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { tailwindColors } from "@/lib/utils";
import { UserProfile } from "@/lib/type";
import { AwardCard } from "@/components/award-card";
import PillNav from "@/components/ui/pill-nav";
import { Reveal } from "@/components/ui/reveal";

const socialMediaImages: { [key: string]: string } = {
  GitHub: "/icon/github.png",
  LinkedIn: "/icon/linkedin.png",
  X: "/icon/twitter.png",
  Youtube: "/icon/youtube.png",
  dribbble: "/icon/dribbble.png",
  default: "/icon/dribbble.png",
};

/* Editorial section heading: serif title + a hairline rule running to the edge. */
function SectionHeading({
  label,
  children,
}: {
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-5">
        <h2 className="shrink-0 font-fraunces text-2xl font-medium tracking-tight sm:text-3xl">
          {label}
        </h2>
        <div className="h-px flex-1 bg-ink/10" />
      </div>
      {children && (
        <p className="mt-4 max-w-xl text-sm/relaxed font-medium text-ink-mute">
          {children}
        </p>
      )}
    </div>
  );
}

export default function page({
  user,
  preview = false,
}: {
  user: UserProfile;
  /** Hide the fixed PillNav when embedded in the editor preview. */
  preview?: boolean;
}) {
  const resumeHref = user.basics.resumeUrl || "/resume";

  // Accent colour chosen in the editor ("Theme Color"). Falls back to the
  // house aura violet; "white" is treated as no-accent so glows stay visible.
  const DEFAULT_ACCENT = "#8b5cf6";
  const picked = tailwindColors.find(
    (c) => c.name === user.meta.portfolioColor,
  )?.value;
  const accentHex =
    picked && picked.toLowerCase() !== "#fff" && picked.toLowerCase() !== "#ffffff"
      ? picked
      : DEFAULT_ACCENT;
  const hexToRgb = (hex: string) => {
    const h = hex.replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const n = parseInt(full, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  };
  const rgba = (hex: string, a: number) => {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };
  const lighten = (hex: string, amt: number) => {
    const { r, g, b } = hexToRgb(hex);
    const f = (c: number) => Math.round(c + (255 - c) * amt);
    return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
  };
  const accentStyle = {
    "--accent": accentHex,
    "--accent-soft": lighten(accentHex, 0.28),
    "--accent-glow": rgba(accentHex, 0.75),
    "--accent-bloom": rgba(accentHex, 0.3),
  } as React.CSSProperties;

  const hasWork = user.work.length > 0 && user.work[0].name !== "";
  const hasProjects =
    user.projects.projects.length > 0 &&
    user.projects.projects[0].title !== "";
  const hasEducation =
    user.education.length > 0 && user.education[0].institution !== "";

  const stripUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "");

  /* Every way to reach out — built from whatever contact data exists. */
  const connectChannels = [
    user.basics.email && {
      label: "Email",
      value: user.basics.email,
      href: `mailto:${user.basics.email}`,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.6}
          stroke="currentColor"
          className="size-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
          />
        </svg>
      ),
    },
    user.basics.phone && {
      label: "Phone",
      value: user.basics.phone,
      href: `tel:${user.basics.phone}`,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.6}
          stroke="currentColor"
          className="size-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
          />
        </svg>
      ),
    },
    user.basics.website && {
      label: "Website",
      value: stripUrl(user.basics.website),
      href: user.basics.website,
      external: true,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.6}
          stroke="currentColor"
          className="size-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
          />
        </svg>
      ),
    },
    ...user.basics.profiles
      .filter((profile) => profile.url)
      .map((profile) => ({
        label: profile.network,
        value: profile.username || stripUrl(profile.url),
        href: profile.url,
        external: true,
        icon: (
          <img
            src={socialMediaImages[profile.network] || socialMediaImages.default}
            alt=""
            className="size-5 object-contain"
          />
        ),
      })),
  ].filter(Boolean) as {
    label: string;
    value: string;
    href: string;
    external?: boolean;
    icon: React.ReactNode;
  }[];

  const navLinks = [
    { href: "#about", label: "About" },
    hasWork && { href: "#work", label: "Experience" },
    hasProjects && { href: "#projects", label: "Work" },
    hasEducation && { href: "#education", label: "Education" },
    connectChannels.length > 0
      ? { href: "#connect", label: "Connect" }
      : { href: "#contact", label: "Contact" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <div
      style={accentStyle}
      className="relative min-h-svh scroll-smooth overflow-x-clip bg-parchment-100 font-outfit text-ink antialiased"
    >
      {/* Paper grain over everything */}
      <div
        aria-hidden
        className="bg-grain pointer-events-none fixed inset-0 z-[60] opacity-[0.05] mix-blend-multiply"
      />

      {/* Aura bloom behind the masthead */}
      <div
        aria-hidden
        className="animate-aura-drift pointer-events-none absolute left-1/2 top-[-16rem] h-[34rem] w-[44rem] max-w-none rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--accent-bloom), rgba(6,182,212,0.09) 58%, transparent 100%)",
        }}
      />

      {/* Liquid colour fields — give the frosted glass something to refract */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-9rem] top-[30rem] h-[26rem] w-[26rem] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--accent-bloom), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-11rem] top-[66rem] h-[30rem] w-[30rem] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(6,182,212,0.20), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-7rem] top-[112rem] h-[26rem] w-[26rem] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--accent-bloom), transparent 70%)",
        }}
      />

      {/* Editorial hairline frame */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-8 hidden w-px bg-ink/[0.06] lg:block"
      />
      <div
        aria-hidden
        className="absolute inset-y-0 right-8 hidden w-px bg-ink/[0.06] lg:block"
      />

      {!preview && (
        <PillNav
          logo={user.meta.avatarUrl}
          logoAlt={user.basics.name}
          logoText={user.basics.name.slice(0, 1)}
          items={navLinks}
          cta={{ label: "Résumé", href: resumeHref }}
        />
      )}

      <main
        className={cn(
          "relative mx-auto w-full max-w-3xl px-5 pb-24 sm:px-8",
          preview ? "pt-14 sm:pt-16" : "pt-36 sm:pt-44"
        )}
      >
        {/* ---------------- Masthead ---------------- */}
        <header
          id="about"
          className="animate-fade-up flex scroll-mt-24 flex-col items-center text-center"
        >
          <Avatar className="size-24 border border-ink/10 shadow-[0_18px_50px_-22px_rgba(33,27,18,0.5)] ring-4 ring-white">
            <AvatarImage
              className="h-full w-full object-cover object-top"
              alt={user.basics.name}
              src={user.meta.avatarUrl}
            />
            <AvatarFallback
              style={{
                backgroundImage:
                  "linear-gradient(135deg, var(--accent), var(--accent-soft))",
              }}
              className="font-fraunces text-4xl font-medium text-white"
            >
              {user.basics.name.trim().charAt(0).toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>

          <h1 className="mt-6 font-fraunces text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
            {user.basics.name}
          </h1>

          {user.basics.label && (
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-ink-mute sm:text-sm">
              {user.basics.label}
            </p>
          )}

          {user.basics.openToWork && (
            <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              Open to work
            </span>
          )}

          {/* Quick contact line */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium text-ink-soft">
            {user.basics.location?.city && (
              <span className="inline-flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.6}
                  stroke="currentColor"
                  className="size-4 text-ink-mute"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
                {user.basics.location.city}
                {user.basics.location.countryCode &&
                  `, ${user.basics.location.countryCode}`}
              </span>
            )}
            {user.basics.email && (
              <a
                href={`mailto:${user.basics.email}`}
                className="inline-flex items-center gap-1.5 transition hover:text-ink"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.6}
                  stroke="currentColor"
                  className="size-4 text-ink-mute"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
                {user.basics.email}
              </a>
            )}
          </div>

          {user.basics.about && (
            <p className="mt-6 max-w-2xl text-base/relaxed font-medium text-ink-soft">
              {user.basics.about}
            </p>
          )}

          {/* Skill chips — a recruiter's first-glance summary of the stack */}
          {user.basics.skills?.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {user.basics.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="glass-chip rounded-full px-3.5 py-1.5 text-xs font-semibold text-ink-soft transition hover:text-ink"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`mailto:${user.basics.email}`}
              className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-parchment-50 transition duration-300 hover:shadow-[0_0_28px_-6px_var(--accent-glow)]"
            >
              {user.meta.buttonText || "Get in touch"}
            </Link>
            <Link
              target="_blank"
              href={resumeHref}
              className="glass-chip rounded-full px-6 py-2.5 text-sm font-semibold text-ink transition duration-300 hover:bg-white/80"
            >
              View résumé
            </Link>
          </div>
        </header>

        {/* ---------------- Experience ---------------- */}
        {hasWork && (
          <section id="work" className="mt-20 scroll-mt-24">
            <Reveal>
              <SectionHeading label="Experience" />
            </Reveal>
            <div className="space-y-4">
              {user.work.map((work, index) => (
                <Reveal key={work.name} delay={index * 70}>
                  <ResumeCard
                    logoUrl={work.logo}
                    altText={work.name}
                    title={work.name}
                    subtitle={work.position}
                    period={`${work.startDate} - ${work.endDate ?? "Present"}`}
                    description={work.summary}
                    href={work.website}
                    highlights={work.highlights}
                  />
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* ---------------- Projects ---------------- */}
        {hasProjects && (
          <section id="projects" className="mt-20 scroll-mt-24">
            <Reveal>
              <SectionHeading label="Selected work">
                {user.projects.description !== ""
                  ? user.projects.description
                  : "A few projects I'm proud of — from quick experiments to things people actually use."}
              </SectionHeading>
            </Reveal>
            {/* Each project gets its own full-width row. */}
            <div className="space-y-5">
              {user.projects.projects.map((project, index) => (
                <Reveal key={project.title} delay={index * 70}>
                  <ProjectCard
                    title={project.title}
                    description={project.description}
                    duration={project.duration}
                    technologies={project.technologies}
                    image={project.image}
                    highlights={project.highlights}
                    website={project.website}
                    source={project.source}
                  />
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* ---------------- Hackathons ---------------- */}
        {user.hackathons.hackathons.length > 0 &&
          user.hackathons.hackathons[0].title !== "" && (
            <section id="hackathons" className="mt-20 scroll-mt-24">
              <Reveal>
                <SectionHeading label="Hackathons">
                  {user.hackathons.description !== ""
                    ? user.hackathons.description
                    : `${user.hackathons.hackathons.length}+ weekends spent building incredible things with motivated people.`}
                </SectionHeading>
              </Reveal>
              <Reveal delay={70}>
                <ul className="ml-4 divide-y divide-dashed divide-ink/10 border-l border-ink/10">
                  {user.hackathons.hackathons.map((hackathon, id) => (
                    <HackathonCard
                      key={id}
                      title={hackathon.title}
                      description={hackathon.description}
                      location={hackathon.location}
                      win={hackathon.win}
                      dates={hackathon.dates}
                      image={hackathon.image}
                      url={hackathon.url}
                    />
                  ))}
                </ul>
              </Reveal>
            </section>
          )}

        {/* ---------------- Awards ---------------- */}
        {user.awards && user.awards.length > 0 && user.awards[0].title !== "" && (
          <section id="awards" className="mt-20 scroll-mt-24">
            <Reveal>
              <SectionHeading label="Awards & certifications">
                Recognitions and credentials earned along the way.
              </SectionHeading>
            </Reveal>
            <div className="grid grid-cols-1 gap-4">
              {user.awards.map((award, index) => (
                <Reveal key={index} delay={index * 70}>
                  <AwardCard
                    title={award.title}
                    date={award.date}
                    issuer={award.awarder}
                    description={award.summary}
                  />
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* ---------------- Education ---------------- */}
        {hasEducation && (
          <section id="education" className="mt-20 scroll-mt-24">
            <Reveal>
              <SectionHeading label="Education" />
            </Reveal>
            <div className="space-y-4">
              {user.education.map((education, index) => (
                <Reveal key={education.institution} delay={index * 70}>
                  <EducationCard
                    href={education.url}
                    logoUrl={education.logo}
                    altText={education.institution}
                    title={education.institution}
                    period={`${education.startDate} - ${education.endDate}`}
                    subtitle={education.area}
                  />
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* ---------------- Connect ---------------- */}
        {connectChannels.length > 0 && (
          <section id="connect" className="mt-20 scroll-mt-24">
            <Reveal>
              <SectionHeading label="Connect Me">
                The best ways to reach me — pick whichever suits you. I usually
                reply within a day.
              </SectionHeading>
            </Reveal>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {connectChannels.map((channel, index) => (
                <Reveal key={`${channel.label}-${index}`} delay={index * 70}>
                  <Link
                    href={channel.href}
                    target={channel.external ? "_blank" : undefined}
                    rel={channel.external ? "noopener noreferrer" : undefined}
                    className="glass-card group flex items-center gap-4 rounded-2xl p-4 transition duration-300 hover:-translate-y-1 hover:bg-white/80"
                  >
                    <span className="glass-tile flex size-11 shrink-0 items-center justify-center rounded-xl text-ink">
                      {channel.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-ink-mute">
                        {channel.label}
                      </span>
                      <span className="block truncate text-sm font-semibold text-ink">
                        {channel.value}
                      </span>
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                      className="size-4 shrink-0 text-ink-mute transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 19.5 19.5 4.5m0 0H8.25m11.25 0v11.25"
                      />
                    </svg>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* ---------------- Contact ---------------- */}
        <section id="contact" className="mt-24 scroll-mt-24">
          <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-ink px-7 py-16 text-center sm:px-12">
            <div
              aria-hidden
              className="absolute -bottom-24 -right-16 h-64 w-80 rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(139,92,246,0.45), rgba(6,182,212,0.25) 60%, transparent)",
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/10"
            />
            <h2 className="relative font-fraunces text-3xl font-medium tracking-tight text-parchment-50 sm:text-4xl">
              Let&rsquo;s build something together.
            </h2>
            <p className="relative mx-auto mt-4 max-w-md text-sm font-medium text-parchment-300/90">
              Currently open to new opportunities. Have a role in mind or just
              want to say hello? I&rsquo;d love to hear from you.
            </p>

            <div className="relative mt-8 flex justify-center">
              <Link
                href={"mailto:" + user.basics.email}
                className="rounded-full bg-parchment-50 px-7 py-3 text-sm font-semibold text-ink transition duration-300 hover:shadow-[0_0_30px_-4px_rgba(139,92,246,0.7)]"
              >
                Say hello
              </Link>
            </div>

            <div className="relative mt-9 flex items-center justify-center gap-3">
              <Link
                href={"mailto:" + user.basics.email}
                target="_blank"
                aria-label="Email"
                className={cn(
                  "flex size-11 items-center justify-center rounded-full bg-white/10 text-parchment-50 ring-1 ring-inset ring-white/15 transition hover:bg-white/20"
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
              </Link>
              {user.basics.profiles.map(
                (profile) =>
                  profile.url && (
                    <Link
                      href={profile.url}
                      target="_blank"
                      aria-label={profile.network}
                      key={profile.network}
                      className="flex size-11 items-center justify-center rounded-full bg-white/10 ring-1 ring-inset ring-white/15 transition hover:bg-white/20"
                    >
                      <img
                        src={
                          socialMediaImages[profile.network] ||
                          socialMediaImages.default
                        }
                        alt={`${profile.network} icon`}
                        className="size-5 brightness-0 invert"
                      />
                    </Link>
                  )
              )}
            </div>
          </div>
          </Reveal>
        </section>
      </main>

      {/* ---------------- Footer ---------------- */}
      <footer className="relative border-t border-ink/10 bg-parchment-50/40">
        <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
          {/* AuraCV call-to-action */}
          <div className="flex flex-col items-center gap-3 rounded-[1.75rem] border border-ink/10 bg-white/60 px-6 py-9 text-center shadow-[0_18px_50px_-30px_rgba(33,27,18,0.45)] backdrop-blur">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-aura-violet/20 bg-gradient-to-r from-aura-violet/10 to-aura-cyan/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-aura-gradient">
              Made with AuraCV
            </span>
            <p className="font-fraunces text-2xl font-medium tracking-tight text-ink">
              Like what you see?
            </p>
            <p className="max-w-md text-sm leading-relaxed text-ink-soft">
              Turn your resume into a beautiful, shareable portfolio like this
              one — in minutes, no design skills needed.
            </p>
            <Link
              href="https://auracv.me"
              target="_blank"
              className="group mt-2 inline-flex items-center gap-1.5 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-parchment-50 transition duration-300 hover:shadow-[0_0_28px_-6px_var(--accent-glow)]"
            >
              Create your portfolio
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>

          {/* Quick nav + socials */}
          <div className="mt-10 flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-ink-mute">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2.5">
              {user.basics.email && (
                <a
                  href={`mailto:${user.basics.email}`}
                  aria-label="Email"
                  className="flex size-9 items-center justify-center rounded-full border border-ink/10 bg-white text-ink-mute transition hover:-translate-y-0.5 hover:border-ink/25 hover:text-ink"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.6}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                    />
                  </svg>
                </a>
              )}
              {user.basics.profiles.map(
                (profile) =>
                  profile.url && (
                    <Link
                      key={profile.network}
                      href={profile.url}
                      target="_blank"
                      aria-label={profile.network}
                      className="flex size-9 items-center justify-center rounded-full border border-ink/10 bg-white transition hover:-translate-y-0.5 hover:border-ink/25"
                    >
                      <img
                        src={
                          socialMediaImages[profile.network] ||
                          socialMediaImages.default
                        }
                        alt={`${profile.network} icon`}
                        className="size-4 object-contain opacity-70"
                      />
                    </Link>
                  )
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-ink/10 pt-6 sm:flex-row">
            <p className="text-xs font-medium text-ink-mute">
              Built with{" "}
              <Link
                href="https://auracv.me"
                target="_blank"
                className="font-semibold text-aura-gradient"
              >
                AuraCV
              </Link>{" "}
              · © {new Date().getFullYear()}
            </p>
            <a
              href="#about"
              className="group inline-flex items-center gap-1 text-xs font-semibold text-ink-mute transition hover:text-ink"
            >
              Back to top
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 15.75 7.5-7.5 7.5 7.5"
                />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
