import Link from "next/link";
import { AuraLogo } from "@/components/brand/logo";

/**
 * Rendered for any URL that doesn't match a route — e.g. `auracv.me/ekkjk`
 * or a stray path under a portfolio subdomain. We keep the visitor inside the
 * AuraCV world and nudge them toward building their own portfolio.
 */
export default function NotFound() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-x-clip bg-parchment-100 font-outfit text-ink antialiased">
      {/* Faint drafting grid */}
      <div
        aria-hidden
        className="bg-atelier-grid pointer-events-none absolute inset-0 z-0"
      />
      {/* Paper grain */}
      <div
        aria-hidden
        className="bg-grain pointer-events-none fixed inset-0 z-[60] opacity-[0.05] mix-blend-multiply"
      />
      {/* Aura bloom */}
      <div
        aria-hidden
        className="animate-aura-drift absolute left-1/2 top-[-14rem] h-[36rem] w-[46rem] max-w-none -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(139,92,246,0.16), rgba(6,182,212,0.09) 58%, transparent 100%)",
        }}
      />

      {/* Header */}
      <header className="relative z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" aria-label="AuraCV home">
            <AuraLogo
              markClassName="h-8 w-8 sm:h-9 sm:w-9"
              wordClassName="text-xl sm:text-2xl"
            />
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-parchment-50 transition duration-300 hover:shadow-[0_0_28px_-6px_rgba(139,92,246,0.65)]"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Body */}
      <section className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 pb-16 pt-8 text-center sm:px-8">
        <p className="animate-fade-up font-fraunces text-7xl font-medium tracking-tight text-aura-gradient sm:text-8xl">
          404
        </p>

        <h1 className="animate-fade-up mt-6 max-w-2xl font-fraunces text-4xl font-medium leading-[1.08] tracking-tight [animation-delay:120ms] sm:text-5xl">
          This page went{" "}
          <em className="text-aura-sheen italic">off-script.</em>
        </h1>

        <p className="animate-fade-up mt-6 max-w-xl text-base/relaxed font-medium text-ink-soft [animation-delay:220ms] sm:text-lg/relaxed">
          We couldn&apos;t find anything at this address. Head back to the
          homepage — upload your résumé and AuraCV will turn it into a polished
          portfolio at your own address in about twenty seconds.
        </p>

        <div className="animate-fade-up mt-10 flex flex-col items-center gap-3 [animation-delay:320ms] sm:flex-row">
          <Link href="/" className="w-full sm:w-auto">
            <span className="block whitespace-nowrap rounded-full bg-ink px-8 py-3.5 text-center text-sm font-semibold tracking-wide text-parchment-50 transition duration-300 hover:shadow-[0_0_32px_-6px_rgba(139,92,246,0.7)]">
              Build your portfolio
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-ink-soft transition hover:text-ink"
          >
            Back to homepage →
          </Link>
        </div>
      </section>
    </div>
  );
}
