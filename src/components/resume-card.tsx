import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";

interface ResumeCardProps {
  logoUrl: string;
  altText: string;
  title: string;
  subtitle?: string;
  href?: string;
  badges?: readonly string[];
  period: string;
  description?: string;
  highlights?: string[];
}

export const ResumeCard = ({
  logoUrl,
  altText,
  title,
  subtitle,
  href,
  badges,
  period,
  description,
  highlights,
}: ResumeCardProps) => {
  const hasBody = Boolean(description) || (highlights?.length ?? 0) > 0;

  return (
    <Link href={href || "#"} className="group block">
      <article className="glass-card rounded-3xl p-5 transition duration-300 hover:-translate-y-1 hover:bg-white/80 sm:p-6">
        {/* Header: logo · company / role · period */}
        <div className="flex items-start gap-4">
          <Avatar className="size-12 shrink-0 overflow-hidden rounded-2xl">
            <AvatarImage
              src={logoUrl}
              alt={altText}
              className="rounded-2xl object-contain"
            />
            <AvatarFallback className="glass-tile rounded-2xl font-fraunces text-lg font-medium text-ink">
              {altText[0]}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
              <h3 className="inline-flex items-center gap-1.5 font-fraunces text-lg font-semibold leading-snug tracking-tight text-ink">
                {title}
                {badges?.map((badge, index) => (
                  <Badge
                    variant="secondary"
                    className="align-middle text-xs"
                    key={`badgeResumeCard-${index}`}
                  >
                    {badge}
                  </Badge>
                ))}
                <ChevronRightIcon className="size-4 text-ink-mute opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100" />
              </h3>
              <span className="glass-chip shrink-0 rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wide tabular-nums text-ink-soft">
                {period}
              </span>
            </div>

            {subtitle && (
              <p className="mt-1 text-sm font-semibold text-ink-soft">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Body: summary + achievement bullets, on readable ink */}
        {hasBody && (
          <div className="mt-4 border-t border-ink/10 pt-4 sm:pl-16">
            {description && (
              <p className="text-[0.9rem]/relaxed font-medium text-ink-soft">
                {description}
              </p>
            )}

            {highlights && highlights.length > 0 && (
              <ul className={description ? "mt-3 space-y-2.5" : "space-y-2.5"}>
                {highlights.map((highlight, index) => (
                  <li
                    key={`highlight-${index}`}
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
      </article>
    </Link>
  );
};
