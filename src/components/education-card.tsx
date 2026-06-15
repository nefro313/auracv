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
}

export const EducationCard = ({
  logoUrl,
  altText,
  title,
  subtitle,
  href,
  badges,
  period,
}: ResumeCardProps) => {
  return (
    <Link href={href || "#"} className="group block">
      <div className="flex gap-4 rounded-2xl border border-ink/10 bg-white/60 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-ink/20 hover:bg-white hover:shadow-[0_20px_44px_-26px_rgba(33,27,18,0.4)]">
        <Avatar className="size-12 shrink-0 border border-ink/10 bg-parchment-50">
          <AvatarImage src={logoUrl} alt={altText} className="object-contain" />
          <AvatarFallback className="bg-parchment-200 text-sm font-semibold text-ink-soft">
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
                  key={`badge-${index}`}
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
        </div>
      </div>
    </Link>
  );
};
