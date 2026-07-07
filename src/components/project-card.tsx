import Link from "next/link";
import Markdown from "react-markdown";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { ProjectDetail } from "@/lib/type";
import { externalHref } from "@/lib/utils";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";

export function ProjectCard({
  title,
  description,
  technologies,
  image,
  website,
  source,
  duration,
  highlights,
}: ProjectDetail) {
  return (
    <article className="glass-card group flex h-full flex-col rounded-3xl p-5 font-outfit transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-white/80 sm:p-6">
      {/* Header: glass tile (image or monogram) · title · duration */}
      <div className="flex items-center gap-4">
        <ImageWithSkeleton
          src={image}
          alt={title}
          fallback={title?.[0] ?? "•"}
          wrapperClassName="glass-tile size-12 shrink-0 rounded-2xl"
          imgClassName="object-cover object-top"
          fallbackClassName="font-fraunces text-lg font-medium text-ink"
        />

        <h3 className="min-w-0 flex-1 font-fraunces text-lg font-semibold leading-snug tracking-tight text-ink">
          {title}
        </h3>

        {duration && (
          <span className="glass-chip shrink-0 rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-ink-soft">
            {duration}
          </span>
        )}
      </div>

      {/* Body: summary + highlights on readable ink */}
      {(description || (highlights && highlights.length > 0)) && (
        <div className="mt-4 border-t border-ink/10 pt-4">
          {description && (
            <div className="max-w-full text-pretty text-[0.9rem]/relaxed font-medium text-ink-soft [&_a]:font-semibold [&_a]:text-aura-violet [&_strong]:text-ink">
              <Markdown>{description}</Markdown>
            </div>
          )}

          {highlights && highlights.length > 0 && (
            <ul className={description ? "mt-3 space-y-2.5" : "space-y-2.5"}>
              {highlights.map((highlight, index) => (
                <li
                  key={`projHighlight-${index}`}
                  className="flex gap-3 text-[0.9rem]/relaxed font-medium text-ink-soft"
                >
                  <span
                    aria-hidden
                    className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-gradient-to-br from-aura-violet to-aura-cyan"
                  />
                  <span className="min-w-0">{highlight}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Tech stack */}
      {technologies && technologies.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {technologies.map((tech, index) => (
            <span
              className="glass-chip rounded-full px-2.5 py-1 text-[0.7rem] font-semibold text-ink-soft"
              key={`badgeCard-${index}`}
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {/* Links */}
      {(website || source) && (
        <div className="mt-auto flex flex-row flex-wrap items-center gap-2 pt-4">
          {website && (
            <Link
              href={externalHref(website)}
              target="_blank"
              className="glass-chip flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-ink-soft transition hover:text-ink"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.6}
                stroke="currentColor"
                className="size-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                />
              </svg>
              Website
            </Link>
          )}
          {source && (
            <Link
              href={externalHref(source)}
              target="_blank"
              className="glass-chip flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-ink-soft transition hover:text-ink"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.6}
                stroke="currentColor"
                className="size-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
              Source code
            </Link>
          )}
        </div>
      )}
    </article>
  );
}
