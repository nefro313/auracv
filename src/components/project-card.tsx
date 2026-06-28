import Link from "next/link";
import Markdown from "react-markdown";
import { ProjectDetail } from "@/lib/type";

export function ProjectCard({
  title,
  description,
  technologies,
  image,
  website,
  source,
}: ProjectDetail) {
  return (
    <article className="glass-card group flex h-full flex-col rounded-3xl p-5 font-outfit transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-white/75">
      <div className="flex items-start gap-4">
        {/* Modern glass tile — project image when present, else a monogram. */}
        <div className="glass-tile flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl">
          {image ? (
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <span className="font-fraunces text-lg font-medium text-ink">
              {title?.[0] ?? "•"}
            </span>
          )}
        </div>

        <h3 className="mt-1 min-w-0 font-fraunces text-lg font-medium leading-tight tracking-tight text-ink">
          {title}
        </h3>
      </div>

      {description && (
        <div className="prose mt-4 max-w-full text-pretty text-xs/relaxed font-medium text-ink-mute">
          <Markdown>{description}</Markdown>
        </div>
      )}

      {technologies && technologies.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {technologies.map((tech, index) => (
            <span
              className="glass-chip rounded-full px-2.5 py-0.5 text-[0.67rem] font-semibold text-ink-soft"
              key={`badgeCard-${index}`}
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {(website || source) && (
        <div className="mt-auto flex flex-row flex-wrap items-center gap-2 pt-4">
          {website && (
            <Link
              href={website}
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
              href={source}
              target="_blank"
              className="glass-chip flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-ink-soft transition hover:text-ink"
            >
              Source code
            </Link>
          )}
        </div>
      )}
    </article>
  );
}
