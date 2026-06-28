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
  tags?: string[];
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
  tags,
}: ResumeCardProps) => {
  return (
    <Link href={href || "#"} className="group block">
      <div className="glass-card flex gap-4 rounded-3xl p-5 transition duration-300 hover:-translate-y-1 hover:bg-white/75">
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
          <div className="flex items-center justify-between gap-2">
            <h3 className="inline-flex items-center gap-1.5 font-fraunces text-base font-medium leading-tight tracking-tight text-ink">
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
            <span className="shrink-0 text-xs tabular-nums text-ink-mute">
              {period}
            </span>
          </div>

          {subtitle && (
            <p className="mt-1 text-sm font-semibold text-ink-soft">
              {subtitle}
            </p>
          )}

          {description && (
            <p className="mt-2.5 text-sm/relaxed font-medium text-ink-mute">
              {description}
            </p>
          )}

          {tags && tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag, index) => (
                <span
                  key={`tagResumeCard-${index}`}
                  className="glass-chip rounded-full px-2.5 py-0.5 text-[0.67rem] font-semibold text-ink-soft"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
