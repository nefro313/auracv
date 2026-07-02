import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { HackathonDetail } from "@/lib/type";

export function HackathonCard({
  title,
  description,
  dates,
  location,
  image,
  win,
  url,
}: HackathonDetail) {
  return (
    <li className="relative ml-10 py-6">
      <div className="absolute -left-[3.65rem] top-6 flex items-center justify-center rounded-2xl bg-parchment-100 p-0.5">
        <Avatar className="size-12 overflow-hidden rounded-2xl">
          <AvatarImage
            src={image}
            alt={title}
            className="rounded-2xl object-contain"
          />
          <AvatarFallback className="glass-tile rounded-2xl font-fraunces text-lg font-medium text-ink">
            {title[0]}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex flex-1 flex-col justify-start gap-1">
        {dates && (
          <time className="text-xs font-medium text-ink-mute">{dates}</time>
        )}
        <h2 className="font-fraunces text-lg font-medium leading-tight tracking-tight text-ink">
          {title}
        </h2>
        {location && (
          <p className="text-sm font-semibold text-ink-soft">{location}</p>
        )}
        {description && (
          <p className="mt-1 text-sm/relaxed font-medium text-ink-mute">
            {description}
          </p>
        )}
        {win && (
          <span className="glass-chip mt-1 w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold text-ink-soft">
            {win}
          </span>
        )}
      </div>

      {url && (
        <div className="mt-3">
          <Link
            href={url}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3.5 py-1.5 text-xs font-semibold text-ink-soft transition hover:border-ink/30 hover:text-ink"
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
        </div>
      )}
    </li>
  );
}
