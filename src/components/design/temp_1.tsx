import React from "react";
import { HackathonCard } from "@/components/hackathon-card";
import { ProjectCard } from "@/components/project-card";
import { ResumeCard } from "@/components/resume-card";
import { EducationCard } from "@/components/education-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/lib/type";
import { AwardCard } from "@/components/award-card";

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

export default function page({ user }: { user: UserProfile }) {
  return (
    <div className="relative min-h-svh overflow-x-clip bg-parchment-100 font-outfit text-ink antialiased">
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
            "radial-gradient(closest-side, rgba(139,92,246,0.16), rgba(6,182,212,0.09) 58%, transparent 100%)",
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

      <main className="relative mx-auto w-full max-w-3xl px-5 pb-28 pt-20 sm:px-8 sm:pt-24">
        {/* ---------------- Masthead ---------------- */}
        <header className="animate-fade-up">
          <Avatar className="size-24 border border-ink/10 shadow-[0_18px_50px_-22px_rgba(33,27,18,0.5)] ring-4 ring-white">
            <AvatarImage
              className="h-full w-full object-cover object-top"
              alt={user.basics.name}
              src={user.meta.avatarUrl}
            />
            <AvatarFallback className="bg-parchment-200 font-fraunces text-2xl text-ink">
              {user.basics.name.slice(0, 2)}
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

          {/* Quick contact line */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-ink-soft">
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

          {/* Skill chips */}
          {user.basics.skills?.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {user.basics.skills.map((skill: string) => (
                <span
                  key={skill}
                  className="rounded-full border border-ink/10 bg-white/60 px-3.5 py-1.5 text-xs font-semibold text-ink-soft transition hover:border-ink/20 hover:text-ink"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              target="_blank"
              href="/resume"
              className="rounded-full border border-ink/15 bg-white/50 px-6 py-2.5 text-sm font-semibold text-ink transition duration-300 hover:border-ink/30 hover:bg-white"
            >
              View résumé
            </Link>
            <Link
              href={`mailto:${user.basics.email}`}
              className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-parchment-50 transition duration-300 hover:shadow-[0_0_28px_-6px_rgba(139,92,246,0.65)]"
            >
              {user.meta.buttonText || "Get in touch"}
            </Link>
          </div>
        </header>

        {/* ---------------- Experience ---------------- */}
        {user.work.length > 0 && user.work[0].name !== "" && (
          <section id="work" className="mt-16">
            <SectionHeading label="Experience" />
            <div className="space-y-4">
              {user.work.map((work) => (
                <ResumeCard
                  key={work.name}
                  logoUrl={work.logo}
                  altText={work.name}
                  title={work.name}
                  subtitle={work.position}
                  period={`${work.startDate} - ${work.endDate ?? "Present"}`}
                  description={work.summary}
                  href={work.website}
                />
              ))}
            </div>
          </section>
        )}

        {/* ---------------- Education ---------------- */}
        {user.education.length > 0 && user.education[0].institution !== "" && (
          <section id="education" className="mt-16">
            <SectionHeading label="Education" />
            <div className="space-y-4">
              {user.education.map((education) => (
                <EducationCard
                  key={education.institution}
                  href={education.url}
                  logoUrl={education.logo}
                  altText={education.institution}
                  title={education.institution}
                  period={`${education.startDate} - ${education.endDate}`}
                  subtitle={education.area}
                />
              ))}
            </div>
          </section>
        )}

        {/* ---------------- Projects ---------------- */}
        {user.projects.projects.length > 0 &&
          user.projects.projects[0].title !== "" && (
            <section id="projects" className="mt-16">
              <SectionHeading label="Selected work">
                {user.projects.description !== ""
                  ? user.projects.description
                  : "A few projects I'm proud of — from quick experiments to things people actually use."}
              </SectionHeading>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {user.projects.projects.map((project) => (
                  <ProjectCard
                    key={project.title}
                    title={project.title}
                    description={project.description}
                    duration={project.duration}
                    technologies={project.technologies}
                    image={project.image}
                    highlights={project.highlights}
                    website={project.website}
                    source={project.source}
                  />
                ))}
              </div>
            </section>
          )}

        {/* ---------------- Hackathons ---------------- */}
        {user.hackathons.hackathons.length > 0 &&
          user.hackathons.hackathons[0].title !== "" && (
            <section id="hackathons" className="mt-16">
              <SectionHeading label="Hackathons">
                {user.hackathons.description !== ""
                  ? user.hackathons.description
                  : `${user.hackathons.hackathons.length}+ weekends spent building incredible things with motivated people.`}
              </SectionHeading>
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
            </section>
          )}

        {/* ---------------- Awards ---------------- */}
        {user.awards && user.awards.length > 0 && user.awards[0].title !== "" && (
          <section id="awards" className="mt-16">
            <SectionHeading label="Awards & certifications">
              Recognitions and credentials earned along the way.
            </SectionHeading>
            <div className="grid grid-cols-1 gap-4">
              {user.awards.map((award, index) => (
                <AwardCard
                  key={index}
                  title={award.title}
                  date={award.date}
                  issuer={award.awarder}
                  description={award.summary}
                />
              ))}
            </div>
          </section>
        )}

        {/* ---------------- Contact ---------------- */}
        <section id="contact" className="mt-20">
          <div className="relative overflow-hidden rounded-[2rem] bg-ink px-7 py-14 text-center sm:px-12">
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
              Get in touch
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-sm font-medium text-parchment-300/90">
              Have an opportunity or just want to say hello? I&rsquo;d love to
              hear from you.
            </p>

            <div className="relative mt-8 flex items-center justify-center gap-3">
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

          <p className="mt-8 text-center text-xs font-medium text-ink-mute">
            Built with{" "}
            <Link
              href="https://auracv.me"
              className="font-semibold text-aura-gradient"
            >
              AuraCV
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
