import Link from "next/link";

interface AwardCardProps {
  title: string;
  issuer: string;
  date: string;
  description?: string;
  url?: string;
}

export function AwardCard({
  title,
  issuer,
  date,
  description,
  url,
}: AwardCardProps) {
  return (
    <div className="glass-card group relative overflow-hidden rounded-3xl p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-white/75">
      {/* Aura accent slides in on hover */}
      <div
        aria-hidden
        className="absolute left-0 top-0 h-full w-1 -translate-x-full bg-gradient-to-b from-aura-violet to-aura-cyan transition-transform duration-300 ease-out group-hover:translate-x-0"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5 shrink-0 text-ink-mute"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"
            />
          </svg>

          <div className="min-w-0">
            <h3 className="truncate font-fraunces text-base font-medium tracking-tight text-ink">
              {title}
            </h3>
            {issuer && (
              <p className="mt-0.5 text-xs font-semibold text-ink-mute">
                {issuer}
              </p>
            )}
          </div>
        </div>

        {date && (
          <span className="glass-chip shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold text-ink-soft">
            {date}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-3 text-sm/relaxed font-medium text-ink-mute">
          {description}
        </p>
      )}

      {url && (
        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ink transition hover:text-aura-violet"
        >
          View certificate
          <svg
            className="size-4 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </Link>
      )}
    </div>
  );
}
