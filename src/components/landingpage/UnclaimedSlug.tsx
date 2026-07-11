"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AuraLogo } from "@/components/brand/logo";

/**
 * Shown when someone visits a subdomain that has no portfolio behind it
 * (e.g. `robinkk.auracv.me`). Instead of falling back to the landing page
 * we turn the dead end into an invitation: the address is free, come claim it.
 *
 * `claimable` is false for reserved slugs (see `reservedWords`) — those can't
 * be registered, so we point the visitor at the homepage to pick another name.
 */
export default function UnclaimedSlug({
  slug,
  claimable,
}: {
  slug: string;
  claimable: boolean;
}) {
  // Build the apex ("auracv.me" / "localhost:3000") from the current host so
  // the claim link works in dev and prod without hard-coding the domain.
  const [apexOrigin, setApexOrigin] = useState("https://auracv.me");

  useEffect(() => {
    const { protocol, host } = window.location;
    // Reach the apex by dropping the leading subdomain label ("robinkk").
    // Prod: robinkk.auracv.me → auracv.me. Dev: robinkk.localhost:3000 →
    // localhost:3000 (the apex is whatever starts at "localhost").
    const localhostIndex = host.indexOf("localhost");
    let apexHost = host;
    if (localhostIndex > 0) {
      apexHost = host.slice(localhostIndex);
    } else {
      const parts = host.split(".");
      if (parts.length > 2) apexHost = parts.slice(1).join(".");
    }
    setApexOrigin(`${protocol}//${apexHost}`);
  }, []);

  // Send the visitor straight to sign-up, carrying the address they picked so
  // the create flow can prefill it once they're authenticated.
  const claimHref = useMemo(
    () =>
      claimable
        ? `${apexOrigin}/signup?claim=${encodeURIComponent(slug)}`
        : `${apexOrigin}/signup`,
    [apexOrigin, slug, claimable],
  );

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
          <a href={`${apexOrigin}/`} aria-label="AuraCV home">
            <AuraLogo
              markClassName="h-8 w-8 sm:h-9 sm:w-9"
              wordClassName="text-xl sm:text-2xl"
            />
          </a>
          <a
            href={`${apexOrigin}/signup`}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-parchment-50 transition duration-300 hover:shadow-[0_0_28px_-6px_rgba(139,92,246,0.65)]"
          >
            Get started
          </a>
        </div>
      </header>

      {/* Body */}
      <section className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 pb-16 pt-8 text-center sm:px-8">
        <p className="animate-fade-up text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-ink-mute sm:text-xs">
          {claimable ? "Address available" : "Address unavailable"}
        </p>

        {/* The address the visitor typed */}
        <div className="animate-fade-up mt-6 flex max-w-full items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-5 py-2.5 shadow-[0_18px_50px_-20px_rgba(33,27,18,0.28)] backdrop-blur-sm [animation-delay:80ms]">
          <span className="truncate font-fraunces text-lg font-medium sm:text-xl">
            <span className="text-aura-gradient">{slug}</span>
            <span className="text-ink-mute">.auracv.me</span>
          </span>
          {claimable ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-label="Available"
              className="size-5 shrink-0 text-aura-cyan"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-label="Unavailable"
              className="size-5 shrink-0 text-ink-mute"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          )}
        </div>

        <h1 className="animate-fade-up mt-8 max-w-2xl font-fraunces text-4xl font-medium leading-[1.08] tracking-tight [animation-delay:160ms] sm:text-6xl">
          {claimable ? (
            <>
              Nobody lives here{" "}
              <em className="text-aura-sheen italic">yet.</em>
            </>
          ) : (
            <>
              This name is{" "}
              <em className="text-aura-sheen italic">taken.</em>
            </>
          )}
        </h1>

        <p className="animate-fade-up mt-6 max-w-xl text-base/relaxed font-medium text-ink-soft [animation-delay:240ms] sm:text-lg/relaxed">
          {claimable ? (
            <>
              No portfolio has claimed{" "}
              <span className="font-semibold text-ink">
                {slug}.auracv.me
              </span>{" "}
              yet. Upload your résumé and AuraCV will turn it into a polished
              personal site at this exact address — in about twenty seconds.
            </>
          ) : (
            <>
              <span className="font-semibold text-ink">
                {slug}.auracv.me
              </span>{" "}
              is reserved and can&apos;t be claimed. Head to the homepage to
              pick your own address and build your portfolio.
            </>
          )}
        </p>

        <div className="animate-fade-up mt-10 flex flex-col items-center gap-3 [animation-delay:320ms] sm:flex-row">
          <a href={claimHref} className="w-full sm:w-auto">
            <span className="block whitespace-nowrap rounded-full bg-ink px-8 py-3.5 text-center text-sm font-semibold tracking-wide text-parchment-50 transition duration-300 hover:shadow-[0_0_32px_-6px_rgba(139,92,246,0.7)]">
              {claimable ? `Claim ${slug}.auracv.me` : "Create your portfolio"}
            </span>
          </a>
          <a
            href={`${apexOrigin}/`}
            className="text-sm font-medium text-ink-soft transition hover:text-ink"
          >
            Explore AuraCV →
          </a>
        </div>
      </section>
    </div>
  );
}
