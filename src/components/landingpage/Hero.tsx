"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { setCookie } from "cookies-next/client";
import { useCommonContext } from "@/CommonContext";
import { reservedWords } from "@/lib/type";
import { AuraLogo } from "@/components/brand/logo";
import { Reveal } from "@/components/ui/reveal";
import { HeroHighlights } from "./HeroHighlights";
import { PortfolioCountButton } from "./PortfolioCountButton";
import Footer from "./Footer";

const steps = [
  {
    number: "01",
    title: "Drop in your résumé",
    body: "One PDF. No forms, no drag-and-drop builders, no blank-page dread.",
  },
  {
    number: "02",
    title: "The AI sets the type",
    body: "Work, projects, education — parsed and typeset into a clean personal site.",
  },
  {
    number: "03",
    title: "Share your address",
    body: "yourname.auracv.me — made for recruiter DMs, bios, and email signatures.",
  },
];

export default function Hero() {
  const { userData } = useCommonContext();
  const router = useRouter();

  const [shopSlug, setShopSlug] = useState("");
  const [slugError, setSlugError] = useState(false);
  const [oldSlug] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage] = useState("Already taken!");
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    if (userData) {
      router.push("/studio");
    }
  }, [userData, router]);

  const checkSlugUnique = async (slug: string): Promise<boolean> => {
    if (shopSlug === oldSlug) {
      return true;
    }
    if (reservedWords.includes(slug.toLowerCase())) {
      return false;
    }
    const response = await axios.post("/api/checkSlug", { slug: slug });
    const { data, error } = response.data;

    if (error) {
      console.error("Error checking slug:", error);
      return false;
    }

    return data.length === 0;
  };

  const handleBlur = async () => {
    if (shopSlug === "") {
      setIsAvailable(false);
      return;
    }
    setIsChecking(true);
    const isUnique = await checkSlugUnique(shopSlug);
    setIsChecking(false);
    if (isUnique) {
      setIsAvailable(true);
      setCookie("username", shopSlug, { maxAge: 60 * 60 * 24 * 100 });
    }
    setSlugError(!isUnique);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/\s+/g, "");
    setSlugError(false);
    setIsAvailable(false);
    setShopSlug(value);
  };

  // Prefill the address when arriving from an unclaimed-subdomain page
  // (`/?claim=<slug>`) and immediately check that it's still available.
  useEffect(() => {
    const claim = new URLSearchParams(window.location.search)
      .get("claim")
      ?.toLowerCase()
      .replace(/\s+/g, "");
    if (!claim) return;
    setShopSlug(claim);
    (async () => {
      setIsChecking(true);
      const isUnique = await checkSlugUnique(claim);
      setIsChecking(false);
      if (isUnique) {
        setIsAvailable(true);
        setCookie("username", claim, { maxAge: 60 * 60 * 24 * 100 });
      }
      setSlugError(!isUnique);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative min-h-svh overflow-x-clip bg-parchment-100 font-outfit text-ink antialiased">
      {/* Faint drafting grid behind everything */}
      <div
        aria-hidden
        className="bg-atelier-grid pointer-events-none absolute inset-0 z-0"
      />
      {/* Paper grain over everything */}
      <div
        aria-hidden
        className="bg-grain pointer-events-none fixed inset-0 z-[60] opacity-[0.05] mix-blend-multiply"
      />

      {/* ---------------- Header ---------------- */}
      <header className="absolute inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" aria-label="AuraCV home">
            <AuraLogo
              markClassName="h-8 w-8 sm:h-9 sm:w-9"
              wordClassName="text-xl sm:text-2xl"
            />
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition hover:text-ink sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-parchment-50 transition duration-300 hover:shadow-[0_0_28px_-6px_rgba(139,92,246,0.65)]"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* ---------------- Hero ---------------- */}
      <section className="relative flex min-h-svh flex-col">
        {/* Aura bloom */}
        <div
          aria-hidden
          className="animate-aura-drift absolute left-1/2 top-[-14rem] h-[36rem] w-[46rem] max-w-none rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(139,92,246,0.16), rgba(6,182,212,0.09) 58%, transparent 100%)",
          }}
        />
        {/* Editorial hairline frame */}
        <div
          aria-hidden
          className="absolute inset-y-0 left-8 hidden w-px bg-ink/[0.06] lg:block"
        />
        <div
          aria-hidden
          className="absolute inset-y-0 right-8 hidden w-px bg-ink/[0.06] lg:block"
        />

        <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-5 pb-12 pt-32 text-center sm:px-8 sm:pt-36">
          <p className="animate-fade-up text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-ink-mute sm:text-xs">
            Résumé in <span className="text-aura-gradient">·</span> Portfolio
            out <span className="text-aura-gradient">·</span> Twenty seconds
          </p>

          <h1 className="animate-fade-up mt-6 max-w-4xl font-fraunces text-5xl font-medium leading-[1.05] tracking-tight [animation-delay:120ms] sm:text-7xl">
            The portfolio your résumé{" "}
            <em className="text-aura-sheen italic">deserves.</em>
          </h1>

          <p className="animate-fade-up mt-6 max-w-xl text-base/relaxed font-medium text-ink-soft [animation-delay:220ms] sm:text-lg/relaxed">
            Upload your CV and AuraCV shapes it into a polished personal site
            at your own address — ready to share before your coffee cools.
          </p>

          {/* Claim card */}
          <div className="animate-fade-up mt-10 w-full max-w-2xl [animation-delay:320ms]">
            <div className="flex flex-col gap-2 rounded-[1.75rem] border border-ink/10 bg-white/70 p-2.5 shadow-[0_18px_50px_-20px_rgba(33,27,18,0.28)] backdrop-blur-sm sm:flex-row sm:items-center sm:rounded-full">
              <div className="flex min-w-0 flex-1 items-center gap-1 rounded-full px-4 py-3 sm:py-2">
                <span className="hidden select-none text-ink-mute sm:inline">
                  https://
                </span>
                <input
                  type="text"
                  value={shopSlug}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="yourname"
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="Choose your AuraCV address"
                  aria-invalid={slugError}
                  className="w-full min-w-0 flex-1 bg-transparent text-base font-semibold text-ink placeholder:font-medium placeholder:text-ink-mute/50 focus:outline-none sm:text-lg"
                />
                <span className="select-none whitespace-nowrap font-medium text-ink-mute">
                  .auracv.me
                </span>
                {isChecking && (
                  <span
                    aria-hidden
                    className="ml-1 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-ink/15 border-t-aura-violet"
                  />
                )}
                {!isChecking && isAvailable && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    aria-label="Available"
                    className="ml-1 size-5 shrink-0 text-aura-cyan"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                )}
              </div>
              <Link href="/signup" className="sm:shrink-0">
                <span className="block whitespace-nowrap rounded-full bg-ink px-7 py-3.5 text-center text-sm font-semibold tracking-wide text-parchment-50 transition duration-300 hover:shadow-[0_0_32px_-6px_rgba(139,92,246,0.7)] sm:py-3">
                  {isAvailable && shopSlug ? `Claim ${shopSlug}` : "Create now"}
                </span>
              </Link>
            </div>
            {slugError && (
              <p className="mt-3 text-sm font-medium text-[#B3402A]">
                {errorMessage} Try another name.
              </p>
            )}
          </div>

          {/* Social proof */}
          <div className="animate-fade-up mt-9 flex flex-col items-center gap-3 [animation-delay:420ms] sm:flex-row">
            <PortfolioCountButton />
            <p className="text-sm font-medium text-ink-mute">
              by professionals, students &amp; makers
            </p>
          </div>
        </div>

        {/* Capability strip (live-portfolios marquee temporarily disabled) */}
        <div className="animate-fade-up relative px-5 pb-12 [animation-delay:540ms]">
          <HeroHighlights />
        </div>
      </section>

      {/* ---------------- Statement ---------------- */}
      <section className="relative border-y border-ink/10 bg-parchment-200/70 py-24 sm:py-32">
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 select-none font-fraunces text-[11rem] italic leading-none text-ink/[0.05]"
        >
          &ldquo;
        </span>
        <Reveal>
          <blockquote className="relative mx-auto max-w-4xl px-6 text-center font-fraunces text-3xl font-medium leading-tight tracking-tight sm:text-5xl">
            Too busy doing the work to{" "}
            <em className="text-aura-gradient italic">showcase</em> it? That
            &rsquo;s exactly the point.
          </blockquote>
          <p className="relative mt-6 text-center text-base font-medium text-ink-mute sm:text-lg">
            AuraCV reads your résumé — and does the showing off for you.
          </p>
        </Reveal>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-28">
        <Reveal>
          <div className="flex items-center gap-5">
            <h2 className="shrink-0 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-ink-mute sm:text-xs">
              How it works
            </h2>
            <div className="h-px flex-1 bg-ink/10" />
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 90} className="h-full">
              <article className="group h-full rounded-3xl border border-ink/10 bg-white/60 p-8 transition duration-300 hover:-translate-y-1 hover:border-ink/20 hover:shadow-[0_24px_50px_-24px_rgba(33,27,18,0.25)]">
                <p className="text-aura-gradient font-fraunces text-4xl font-medium italic">
                  {step.number}
                </p>
                <h3 className="mt-5 font-fraunces text-xl font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm/relaxed font-medium text-ink-soft">
                  {step.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- CTA band ---------------- */}
      <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8 sm:pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-ink px-7 py-16 text-center sm:px-16 sm:py-20">
            <div
              aria-hidden
              className="absolute -bottom-32 -right-20 h-80 w-[28rem] rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(139,92,246,0.45), rgba(6,182,212,0.25) 60%, transparent)",
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/10"
            />
            <h2 className="relative font-fraunces text-3xl font-medium tracking-tight text-parchment-50 sm:text-5xl">
              Claim your corner of the internet.
            </h2>
            <p className="relative mt-4 text-base font-medium text-parchment-300/90 sm:text-lg">
              yourname<span className="text-aura-gradient">.auracv.me</span> is
              free — and ready in about twenty seconds.
            </p>
            <Link href="/signup" className="relative mt-9 inline-block">
              <span className="block rounded-full bg-parchment-50 px-8 py-3.5 text-sm font-semibold tracking-wide text-ink transition duration-300 hover:shadow-[0_0_36px_-4px_rgba(139,92,246,0.8)]">
                Create your portfolio
              </span>
            </Link>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
