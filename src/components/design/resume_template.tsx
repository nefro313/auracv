import React from "react";
import { UserProfile } from "@/lib/type";
import { externalHref } from "@/lib/utils";
import ResumeActions from "./ResumeActions";

/* Contact-bar social networks that have a glyph in this template. Anything else
   (YouTube, Dribbble, Medium…) is omitted so the bar shows no empty entries. */
const ICON_NETWORKS = ["LinkedIn", "GitHub", "Twitter", "X"] as const;

/* Prefer an explicit username; otherwise derive a handle from the profile URL's
   last path segment (e.g. github.com/nefro313 → "nefro313",
   linkedin.com/in/robinkphilip → "robinkphilip"). */
function socialHandle(profile: { url: string; username?: string }): string {
  if (profile.username && profile.username.trim() !== "") {
    return profile.username.trim();
  }
  try {
    const { pathname } = new URL(externalHref(profile.url));
    const segment = pathname.split("/").filter(Boolean).pop() ?? "";
    return decodeURIComponent(segment).replace(/^@/, "");
  } catch {
    return "";
  }
}

type ResumeTemplateProps = {
  profile: UserProfile;
  /** Hide the download bar (and full-page height) when embedded in the
      studio editor's live preview. The published resume page omits it. */
  preview?: boolean;
};

/* Editorial section heading — small-caps serif over a hairline rule. Kept with
   its content (`break-after-avoid`) so a heading never strands at a page foot. */
const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="mb-3 break-after-avoid border-b border-ink/15 pb-1.5 font-fraunces text-[0.95rem] font-semibold uppercase tracking-[0.16em] text-ink">
    {children}
  </h2>
);

/* One resume record (a job, project, degree…). `break-inside-avoid` keeps the
   whole entry on a single printed page rather than splitting it mid-way. */
const Entry: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "mb-4",
}) => <div className={`break-inside-avoid ${className}`}>{children}</div>;

/* Small violet link with a leading icon — used for project Live / Source. */
const InlineLink: React.FC<{
  href: string;
  label: string;
  icon: React.ReactNode;
}> = ({ href, label, icon }) => (
  <a
    href={externalHref(href)}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1 font-semibold text-aura-violet transition hover:underline"
  >
    {icon}
    {label}
  </a>
);

const GlobeIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.7}
    stroke="currentColor"
    className="size-3.5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247"
    />
  </svg>
);

const CodeIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.7}
    stroke="currentColor"
    className="size-3.5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z"
    />
  </svg>
);

const ResumeTemplate: React.FC<ResumeTemplateProps> = ({
  profile,
  preview = false,
}) => {
  // "Has experience" gates section order: with work, Experience leads; without,
  // Skills/Projects lead and the Experience block is hidden.
  const hasExperience = profile.work.length > 0 && profile.work[0].name !== "";

  const aboutSection = profile.basics.about && (
    <section className="mb-6 break-inside-avoid">
      <p className="text-sm/relaxed">{profile.basics.about}</p>
    </section>
  );

  const skillsSection = profile.skills.length > 0 &&
    profile.skills[0].name !== "" && (
      <section className="mb-6">
        <SectionTitle>Skills</SectionTitle>
        <div className="grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
          {profile.skills.map((skill, index) => (
            <Entry key={`skillResume-${index}`} className="">
              <h3 className="text-sm font-semibold text-ink">{skill.name}</h3>
              <p className="text-sm">{skill.keywords.join(", ")}</p>
            </Entry>
          ))}
        </div>
      </section>
    );

  const experienceSection = hasExperience && (
    <section className="mb-6">
      <SectionTitle>Experience</SectionTitle>
      {profile.work.map((work, index) => (
        <Entry key={`workResume-${index}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <h3 className="text-base font-semibold text-ink">{work.position}</h3>
            {(work.startDate || work.endDate) && (
              <p className="text-xs tabular-nums text-ink-mute">
                {work.startDate}
                {work.endDate && ` – ${work.endDate}`}
              </p>
            )}
          </div>
          <p className="mb-1 text-sm italic text-ink-mute">
            {work.name}
            {work.location && `, ${work.location}`}
          </p>
          {work.summary && <p className="text-sm">{work.summary}</p>}
          {work.highlights &&
            work.highlights.length > 0 &&
            work.highlights[0] !== "" &&
            work.highlights[0] !== "•" && (
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm marker:text-ink-mute">
                {work.highlights
                  .filter((h) => h && h.trim() !== "" && h !== "•")
                  .map((highlight, idx) => (
                    <li key={`highlightWork-${idx}`}>{highlight}</li>
                  ))}
              </ul>
            )}
        </Entry>
      ))}
    </section>
  );

  const projectsSection = profile.projects.projects.length > 0 &&
    profile.projects.projects[0].title !== "" && (
      <section className="mb-6">
        <SectionTitle>Projects</SectionTitle>
        {profile.projects.projects.map((project, index) => (
          <Entry key={`projectResume-${index}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <h3 className="text-base font-semibold text-ink">
                {project.title}
              </h3>
              {project.duration && (
                <p className="text-xs tabular-nums text-ink-mute">
                  {project.duration}
                </p>
              )}
            </div>
            {project.description && (
              <p className="text-sm">{project.description}</p>
            )}
            {/* Order: bullet highlights → technologies → links. */}
            {project.highlights &&
              project.highlights.length > 0 &&
              project.highlights[0] !== "" &&
              project.highlights[0] !== "•" && (
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm marker:text-ink-mute">
                  {project.highlights
                    .filter((h) => h && h.trim() !== "" && h !== "•")
                    .map((highlight, idx) => (
                      <li key={`highlight-${idx}`}>{highlight}</li>
                    ))}
                </ul>
              )}
            {project.technologies && project.technologies.length > 0 && (
              <p className="mt-2 text-sm">
                <span className="font-semibold text-ink">Technologies:</span>{" "}
                {project.technologies.join(", ")}
              </p>
            )}
            {/* Project links — website + source, beneath the technologies. */}
            {(project.website || project.source) && (
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                {project.website && (
                  <InlineLink
                    href={project.website}
                    label="Live"
                    icon={GlobeIcon}
                  />
                )}
                {project.source && (
                  <InlineLink
                    href={project.source}
                    label="Source"
                    icon={CodeIcon}
                  />
                )}
              </div>
            )}
          </Entry>
        ))}
      </section>
    );

  const educationSection = profile.education.length > 0 &&
    profile.education[0].institution !== "" && (
      <section className="mb-6">
        <SectionTitle>Education</SectionTitle>
        {profile.education.map((edu, index) => (
          <Entry key={`educationResume-${index}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <h3 className="text-base font-semibold text-ink">
                {edu.institution}
              </h3>
              {(edu.startDate || edu.endDate) && (
                <p className="text-xs tabular-nums text-ink-mute">
                  {edu.startDate}
                  {edu.endDate && ` – ${edu.endDate}`}
                </p>
              )}
            </div>
            {(edu.studyType || edu.area) && (
              <p className="text-sm italic text-ink-mute">
                {edu.studyType}
                {edu.area && ` in ${edu.area}`}
              </p>
            )}
            {edu.summary && <p className="mt-1 text-sm">{edu.summary}</p>}
            {edu.score && <p className="mt-0.5 text-sm">Score: {edu.score}</p>}
            {edu.courses &&
              edu.courses.length > 0 &&
              edu.courses[0] !== "" &&
              edu.courses[0] !== "•" && (
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm marker:text-ink-mute">
                  {edu.courses
                    .filter((c) => c && c.trim() !== "" && c !== "•")
                    .map((course, idx) => (
                      <li key={`courseResume-${idx}`}>{course}</li>
                    ))}
                </ul>
              )}
          </Entry>
        ))}
      </section>
    );

  const certificatesSection = profile.certificates &&
    profile.certificates.length > 0 &&
    profile.certificates[0].name !== "" && (
      <section className="mb-6">
        <SectionTitle>Certificates</SectionTitle>
        {profile.certificates.map((cert, index) => (
          <Entry key={`certificateResume-${index}`} className="mb-3">
            <h3 className="text-base font-semibold text-ink">{cert.name}</h3>
            {cert.issuer && <p className="text-sm">Issuer: {cert.issuer}</p>}
            {cert.date && <p className="text-sm">Date: {cert.date}</p>}
            {cert.url && (
              <a
                href={externalHref(cert.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-aura-violet hover:underline"
              >
                View certificate
              </a>
            )}
          </Entry>
        ))}
      </section>
    );

  const interestsSection = profile.interests.length > 0 &&
    profile.interests[0].name !== "" && (
      <section className="mb-6">
        <SectionTitle>Interests</SectionTitle>
        <div className="grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
          {profile.interests.map((interest, index) => (
            <Entry key={`interestResume-${index}`} className="">
              <h3 className="text-sm font-semibold text-ink">
                {interest.name}
              </h3>
              <p className="text-sm">{interest.keywords.join(", ")}</p>
            </Entry>
          ))}
        </div>
      </section>
    );

  const awardsSection = profile.awards &&
    profile.awards.length > 0 &&
    profile.awards[0].title !== "" && (
      <section className="mb-6">
        <SectionTitle>Awards</SectionTitle>
        {profile.awards.map((award, index) => (
          <Entry key={`awardResume-${index}`} className="mb-3">
            <h3 className="text-base font-semibold text-ink">{award.title}</h3>
            {award.awarder && <p className="text-sm">Awarder: {award.awarder}</p>}
            {award.date && <p className="text-sm">Date: {award.date}</p>}
            {award.summary && <p className="text-sm">{award.summary}</p>}
          </Entry>
        ))}
      </section>
    );

  const languagesSection = profile.languages &&
    profile.languages.length > 0 &&
    profile.languages[0].language !== "" && (
      <section className="mb-6 break-inside-avoid">
        <SectionTitle>Languages</SectionTitle>
        <div className="flex flex-wrap gap-x-8 gap-y-1.5">
          {profile.languages.map((lang, index) => (
            <p key={`languageResume-${index}`} className="text-sm">
              <span className="font-semibold text-ink">{lang.language}:</span>{" "}
              {lang.fluency}
            </p>
          ))}
        </div>
      </section>
    );

  const referencesSection = profile.references.length > 0 &&
    profile.references[0].name !== "" && (
      <section>
        <SectionTitle>References</SectionTitle>
        {profile.references.map((ref, index) => (
          <blockquote
            key={`referenceResume-${index}`}
            className="mb-3 break-inside-avoid border-l-2 border-ink/15 pl-4 italic"
          >
            <p className="text-sm">{ref.reference}</p>
            <footer className="mt-1 text-right text-sm not-italic text-ink-mute">
              — {ref.name}
            </footer>
          </blockquote>
        ))}
      </section>
    );

  return (
    <div
      className={`${
        preview ? "min-h-full" : "min-h-svh"
      } bg-parchment-200/60 py-8 font-outfit sm:py-12 print:bg-white print:py-0`}
    >
      <div className="mx-auto w-full max-w-[820px] px-4 sm:px-6 print:max-w-none print:px-0">
        {!preview && <ResumeActions profile={profile} />}

        <div
          id="resume-template"
          className="resume-sheet rounded-2xl border border-ink/10 bg-white p-6 leading-relaxed text-ink-soft shadow-[0_24px_60px_-32px_rgba(33,27,18,0.35)] sm:p-10 md:p-12 print:rounded-none print:border-0 print:p-0 print:shadow-none"
        >
          <header className="mb-6 break-inside-avoid text-center">
            <h1 className="font-fraunces text-4xl font-medium tracking-tight text-ink">
              {profile.basics.name}
            </h1>
            {profile.basics.label && (
              <p className="mt-1 font-fraunces text-lg text-ink-soft">
                {profile.basics.label}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-sm text-ink">
              {[
                profile.basics.location.city &&
                  profile.basics.location.countryCode && (
                    <p className="flex items-center gap-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-4"
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
                      {profile.basics.location.city},{" "}
                      {profile.basics.location.countryCode}
                    </p>
                  ),

                profile.basics.email && (
                  <a
                    href={`mailto:${profile.basics.email}`}
                    className="flex items-center gap-1.5 transition hover:underline"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                      />
                    </svg>
                    {profile.basics.email}
                  </a>
                ),

                profile.basics.phone && (
                  <p className="flex items-center gap-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                      />
                    </svg>
                    {profile.basics.phone}
                  </p>
                ),

                profile.basics.website && (
                  <a
                    href={externalHref(profile.basics.website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 transition hover:underline"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                      />
                    </svg>
                    {profile.basics.website.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                ),

                ...profile.basics.profiles
                  .filter(
                    (social) =>
                      social.url &&
                      social.url.trim() !== "" &&
                      social.network &&
                      ICON_NETWORKS.includes(
                        social.network as (typeof ICON_NETWORKS)[number],
                      ),
                  )
                  .map((social, socialIndex) => (
                    <a
                      key={`profileResume-${socialIndex}`}
                      href={externalHref(social.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 transition hover:underline"
                    >
                      {social.network === "LinkedIn" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          x="0px"
                          y="0px"
                          viewBox="0 0 50 50"
                          className="size-4"
                        >
                          <path d="M41,4H9C6.24,4,4,6.24,4,9v32c0,2.76,2.24,5,5,5h32c2.76,0,5-2.24,5-5V9C46,6.24,43.76,4,41,4z M17,20v19h-6V20H17z M11,14.47c0-1.4,1.2-2.47,3-2.47s2.93,1.07,3,2.47c0,1.4-1.12,2.53-3,2.53C12.2,17,11,15.87,11,14.47z M39,39h-6c0,0,0-9.26,0-10 c0-2-1-4-3.5-4.04h-0.08C27,24.96,26,27.02,26,29c0,0.91,0,10,0,10h-6V20h6v2.56c0,0,1.93-2.56,5.81-2.56 c3.97,0,7.19,2.73,7.19,8.26V39z"></path>
                        </svg>
                      )}
                      {social.network === "GitHub" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          x="0px"
                          y="0px"
                          className="size-4"
                          viewBox="0 0 30 30"
                        >
                          <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"></path>
                        </svg>
                      )}
                      {(social.network === "Twitter" ||
                        social.network === "X") && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          x="0px"
                          y="0px"
                          className="size-4"
                          viewBox="0 0 50 50"
                        >
                          <path d="M 5.9199219 6 L 20.582031 27.375 L 6.2304688 44 L 9.4101562 44 L 21.986328 29.421875 L 31.986328 44 L 44 44 L 28.681641 21.669922 L 42.199219 6 L 39.029297 6 L 27.275391 19.617188 L 17.933594 6 L 5.9199219 6 z M 9.7167969 8 L 16.880859 8 L 40.203125 42 L 33.039062 42 L 9.7167969 8 z"></path>
                        </svg>
                      )}
                      {socialHandle(social)}
                    </a>
                  )),
              ]
                .filter(Boolean)
                .map((contactNode, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <span className="text-ink/40">|</span>}
                    {contactNode}
                  </React.Fragment>
                ))}
            </div>
          </header>

          {/*
            Section order depends on whether the user has work experience:
            - With experience:  About → Experience → Projects → Skills → Education
            - Without:          About → Skills → Projects → (Experience hidden) → Education
            Followed by Certificates → Interests, then the remaining optional sections.
          */}
          {aboutSection}
          {hasExperience ? (
            <>
              {experienceSection}
              {projectsSection}
              {skillsSection}
            </>
          ) : (
            <>
              {skillsSection}
              {projectsSection}
            </>
          )}
          {educationSection}
          {certificatesSection}
          {interestsSection}
          {awardsSection}
          {languagesSection}
          {referencesSection}
        </div>
      </div>
    </div>
  );
};

export default ResumeTemplate;
