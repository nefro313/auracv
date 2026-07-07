import { Skeleton } from "@/components/ui/skeleton";

/**
 * Page-shaped skeletons in the "Atelier Paper" language. These replace the bare
 * NextUI <Spinner> "buffering" states with calm, layout-aware placeholders so a
 * loading page already looks like the page that's coming.
 */

/* ------------------------------------------------------------------ */
/* AppShellSkeleton — the authenticated app frame (navbar + left rail). */
/* Used by the `withAuth` gate while the session is being resolved.     */
/* ------------------------------------------------------------------ */
export function AppShellSkeleton() {
  return (
    <div className="min-h-screen bg-parchment-100 font-outfit">
      <header className="sticky top-0 z-50 border-b border-ink/10 bg-parchment-50/85 py-4 backdrop-blur-md">
        <div className="mx-auto flex items-center justify-between px-4 sm:px-8 lg:px-10">
          <Skeleton className="h-8 w-28 rounded-full" />
          <div className="flex items-center gap-3">
            <Skeleton className="hidden h-9 w-44 rounded-full sm:block" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12">
        <aside className="hidden min-h-[calc(100vh-65px)] border-r border-ink/10 lg:col-span-1 lg:block">
          <div className="flex flex-col items-center gap-8 py-9">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </aside>

        <main className="col-span-12 px-6 py-10 lg:col-span-11 lg:px-10">
          <div className="mx-auto w-full max-w-5xl">
            <Skeleton className="h-10 w-64" />
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-5">
              <Skeleton className="h-52 rounded-3xl lg:col-span-3" />
              <Skeleton className="h-52 rounded-3xl lg:col-span-2" />
            </div>
            <Skeleton className="mt-6 h-40 w-full rounded-3xl" />
          </div>
        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* StudioSkeleton — mirrors the 3-pane editor (sections · form · view). */
/* Rendered inside <Home> while the portfolio row loads.                */
/* ------------------------------------------------------------------ */
export function StudioSkeleton() {
  return (
    <div className="grid h-full min-h-[70vh] w-full grid-cols-5 overflow-hidden bg-parchment-100 font-outfit">
      {/* Sections rail */}
      <div className="col-span-1 hidden h-full border-r border-ink/10 px-8 py-12 lg:block">
        <Skeleton className="mb-8 h-3 w-20" />
        <div className="flex flex-col gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-28" />
          ))}
        </div>
      </div>

      {/* Form column */}
      <div className="col-span-5 h-full border-r border-ink/10 bg-parchment-50 lg:col-span-2">
        <div className="flex gap-2 border-b border-ink/10 p-6">
          <Skeleton className="h-10 flex-1 rounded-full" />
          <Skeleton className="h-10 flex-1 rounded-full" />
        </div>
        <div className="space-y-7 px-8 py-8">
          <Skeleton className="h-7 w-40" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ))}
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      </div>

      {/* Live preview column */}
      <div className="col-span-2 hidden h-full bg-parchment-100 lg:block">
        <div className="border-b border-ink/10 p-6">
          <Skeleton className="h-10 w-full rounded-2xl" />
        </div>
        <div className="space-y-5 p-8">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3.5 w-28" />
            </div>
          </div>
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-11/12" />
          <Skeleton className="h-3.5 w-4/5" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ProfileSkeleton — mirrors the account/profile page body.            */
/* ------------------------------------------------------------------ */
export function ProfileSkeleton() {
  return (
    <div className="relative mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-12 w-40 rounded-full" />
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Skeleton className="h-56 rounded-3xl lg:col-span-3" />
        <Skeleton className="h-56 rounded-3xl lg:col-span-2" />
      </div>

      <Skeleton className="mt-6 h-44 w-full rounded-3xl" />
      <Skeleton className="mt-6 h-24 w-full rounded-3xl" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ResumeSkeleton — the published résumé page (/resume) while the      */
/* profile streams in: actions bar + the white A4-ish sheet.           */
/* ------------------------------------------------------------------ */
export function ResumeSkeleton() {
  return (
    <div className="min-h-svh bg-parchment-200/60 py-8 font-outfit sm:py-12">
      <div className="mx-auto w-full max-w-[820px] px-4 sm:px-6">
        {/* actions bar: back link · download buttons */}
        <div className="mb-5 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-10 w-32 rounded-full" />
          <div className="flex items-center justify-center gap-2.5">
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        </div>

        {/* the sheet */}
        <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-[0_24px_60px_-32px_rgba(33,27,18,0.35)] sm:p-10 md:p-12">
          {/* centered header: name · label · contact row */}
          <div className="flex flex-col items-center gap-3">
            <Skeleton className="h-9 w-60 sm:w-72" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-11/12 max-w-md" />
          </div>

          {/* body sections: small-caps heading over text lines */}
          <div className="mt-10 space-y-9">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-5 w-36" />
                <div className="mt-4 space-y-2.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
