"use client";
import { useState } from "react";
import { AuraLogo } from "@/components/brand/logo";
import Link from "next/link";
import { Spinner } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useCommonContext } from "@/Common_context";

export default function page() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { userData } = useCommonContext();
  if (userData) {
    router.push("/home");
  }
  const SigninWithGoogle = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const { data } = await response.json();
      setLoading(false);
      if (!data?.url) throw new Error("No url returned");
      router.push(data.url);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-svh overflow-hidden bg-parchment-100 font-outfit text-ink antialiased">
      {/* Faint drafting grid behind everything */}
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
        className="animate-aura-drift pointer-events-none absolute left-1/2 top-[-14rem] h-[34rem] w-[44rem] max-w-none rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(139,92,246,0.16), rgba(6,182,212,0.09) 58%, transparent 100%)",
        }}
      />
      {/* Hairline frame */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-8 hidden w-px bg-ink/[0.06] lg:block"
      />
      <div
        aria-hidden
        className="absolute inset-y-0 right-8 hidden w-px bg-ink/[0.06] lg:block"
      />

      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/auracv" aria-label="AuraCV home">
            <AuraLogo
              markClassName="h-8 w-8 sm:h-9 sm:w-9"
              wordClassName="text-xl sm:text-2xl"
            />
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-parchment-50 transition duration-300 hover:shadow-[0_0_28px_-6px_rgba(139,92,246,0.65)]"
          >
            Sign up
          </Link>
        </div>
      </header>

      {/* Card */}
      <main className="relative flex min-h-svh items-center justify-center px-5 py-24">
        <div className="animate-fade-up w-full max-w-md rounded-[2rem] border border-ink/10 bg-white/70 p-8 text-center shadow-[0_18px_50px_-20px_rgba(33,27,18,0.28)] backdrop-blur-sm sm:p-10">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-ink-mute">
            Welcome back
          </p>
          <h1 className="mt-4 font-fraunces text-3xl font-medium tracking-tight sm:text-4xl">
            Sign in to <span className="text-aura-gradient">AuraCV</span>
          </h1>
          <p className="mt-3 text-sm/relaxed font-medium text-ink-soft">
            Pick up right where you left off — your portfolio is waiting.
          </p>

          <button
            onClick={SigninWithGoogle}
            disabled={loading}
            className="mt-8 inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-ink/15 bg-white px-7 py-3 text-sm font-semibold text-ink transition duration-300 hover:border-ink/30 hover:shadow-[0_0_28px_-6px_rgba(139,92,246,0.45)] disabled:opacity-70"
          >
            {loading ? (
              <Spinner size="sm" color="default" />
            ) : (
              <>
                <GoogleIcon /> Continue with Google
              </>
            )}
          </button>

          <p className="mt-6 text-xs font-medium text-ink-mute">
            New here?{" "}
            <Link href="/signup" className="font-semibold text-aura-gradient">
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    viewBox="0 0 48 48"
    className="size-5"
  >
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    ></path>
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    ></path>
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
  </svg>
);
