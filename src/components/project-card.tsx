import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white/60 font-outfit shadow-none transition-all duration-300 ease-out hover:-translate-y-1 hover:border-ink/20 hover:bg-white hover:shadow-[0_24px_50px_-26px_rgba(33,27,18,0.4)]">
      {/* Aura accent — consistent brand strip in place of a random gradient */}
      <div
        aria-hidden
        className="h-1 w-full bg-gradient-to-r from-aura-violet to-aura-cyan"
      />

      {image && (
        <Link href={website || "#"} className="block cursor-pointer">
          <img
            src={image}
            alt={title}
            className="h-40 w-full object-cover object-top"
          />
        </Link>
      )}

      <CardHeader className="p-4 pb-2">
        <CardTitle className="font-fraunces text-lg font-medium leading-tight tracking-tight text-ink">
          {title}
        </CardTitle>
        {description && (
          <div className="prose mt-1.5 max-w-full text-pretty text-xs/relaxed font-medium text-ink-mute">
            <Markdown>{description}</Markdown>
          </div>
        )}
      </CardHeader>

      <CardContent className="mt-auto flex flex-col px-4">
        {technologies && technologies.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {technologies.map((tech, index) => (
              <span
                className="rounded-full bg-parchment-200 px-2.5 py-0.5 text-[0.67rem] font-semibold text-ink-soft"
                key={`badgeCard-${index}`}
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-3">
        <div className="flex flex-row flex-wrap items-start gap-2">
          {website && (
            <Link
              href={website}
              target="_blank"
              className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3.5 py-1.5 text-xs font-semibold text-ink-soft transition hover:border-ink/30 hover:text-ink"
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
              className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3.5 py-1.5 text-xs font-semibold text-ink-soft transition hover:border-ink/30 hover:text-ink"
            >
              Source code
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
