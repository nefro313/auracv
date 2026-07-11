"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase } from "@/utils/supabase/client";
import { useCommonContext } from "@/CommonContext";
import { UserProfile } from "@/lib/type";
import { cn, profileCompleteness, skillCount } from "@/lib/utils";
import NumberTicker from "@/components/magicui/number-ticker";

/**
 * WelcomeBack — a branded splash shown for a few seconds when a returning user
 * signs in. It greets them by name and previews their live address, headline
 * stats and profile completeness while the studio editor quietly loads its data
 * underneath, then fades away to reveal the ready editor.
 *
 * It's mounted by the /studio page when a one-shot `auracv:welcome` flag is set
 * during the post-login redirect, so it appears exactly once per sign-in.
 */

const MIN_VISIBLE_MS = 2800; // keep the greeting up long enough to read
const MAX_VISIBLE_MS = 7000; // …but never trap the user if a fetch hangs
const EXIT_MS = 700; // fade-out duration before unmount

type Row = { userName: string; resumeJson: UserProfile };

export default function WelcomeBack({ onFinish }: { onFinish: () => void }) {
  const { userData } = useCommonContext();
  const [row, setRow] = useState<Row | null>(null);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [barFill, setBarFill] = useState(0);

  const mountedAt = useRef<number>(Date.now());
  const finished = useRef(false);

  // Session fallbacks for the very first paint, before the row arrives.
  const sessionAvatar = userData?.user?.user_metadata?.avatar_url ?? "";
  const sessionName =
    userData?.user?.user_metadata?.full_name ??
    userData?.user?.user_metadata?.name ??
    "";

  // Begin the smooth exit exactly once, then unmount after the fade.
  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    setPhase("out");
    setTimeout(onFinish, EXIT_MS);
  }, [onFinish]);

  // Pull the portfolio row, then leave once both the data is in and the
  // minimum on-screen time has elapsed.
  useEffect(() => {
    if (!userData?.user?.id) return;
    let active = true;

    (async () => {
      const { data } = await supabase
        .from("users")
        .select("userName,resumeJson")
        .eq("userId", userData.user.id);

      if (!active) return;
      if (data && data.length > 0) setRow(data[0] as Row);

      const elapsed = Date.now() - mountedAt.current;
      const wait = Math.max(MIN_VISIBLE_MS - elapsed, 500);
      setTimeout(() => active && finish(), wait);
    })();

    return () => {
      active = false;
    };
  }, [userData, finish]);

  // Hard safety net so the splash can never hang forever.
  useEffect(() => {
    const t = setTimeout(finish, MAX_VISIBLE_MS);
    return () => clearTimeout(t);
  }, [finish]);

  const resume = row?.resumeJson;
  const userName = row?.userName || resume?.meta?.userName || "";
  const avatar = resume?.basics?.avatarUrl || sessionAvatar;
  const fullName = resume?.basics?.name || sessionName || "there";
  const firstName = fullName.split(" ")[0];

  const completeness = useMemo(
    () => profileCompleteness(resume, avatar),
    [resume, avatar],
  );

  const stats = useMemo(
    () => [
      { label: "Projects", value: resume?.projects?.projects?.length ?? 0 },
      { label: "Experience", value: resume?.work?.length ?? 0 },
      { label: "Skills", value: skillCount(resume) },
    ],
    [resume],
  );

  // Animate the completeness bar to its value once it's known.
  useEffect(() => {
    const t = setTimeout(() => setBarFill(completeness), 250);
    return () => clearTimeout(t);
  }, [completeness]);

  return (
    <div
      role="status"
      aria-label="Welcome back — loading your studio"
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-parchment-100 px-6 font-outfit text-ink antialiased transition-all duration-700 ease-out",
        phase === "out"
          ? "pointer-events-none scale-[1.02] opacity-0"
          : "scale-100 opacity-100",
      )}
    >
      {/* Faint drafting grid + paper grain + aura bloom (Atelier Paper). */}
      <div
        aria-hidden
        className="bg-atelier-grid pointer-events-none absolute inset-0 z-0"
      />
      <div
        aria-hidden
        className="bg-grain pointer-events-none absolute inset-0 z-0 opacity-[0.05] mix-blend-multiply"
      />
      <div
        aria-hidden
        className="animate-aura-drift pointer-events-none absolute left-1/2 top-[-14rem] z-0 h-[34rem] w-[44rem] max-w-none rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(139,92,246,0.16), rgba(6,182,212,0.09) 58%, transparent 100%)",
        }}
      />

      <div className="relative z-10 w-full max-w-lg">
        {/* Greeting */}
        <div className="animate-fade-up flex flex-col items-center text-center">
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-1 rounded-full bg-gradient-to-tr from-aura-violet to-aura-cyan opacity-70 blur-[2px]"
            />
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt={fullName}
                className="relative h-20 w-20 rounded-full object-cover ring-4 ring-parchment-50"
              />
            ) : (
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-ink font-fraunces text-2xl text-parchment-50 ring-4 ring-parchment-50">
                {firstName.charAt(0).toUpperCase() || "A"}
              </div>
            )}
          </div>

          <p className="mt-6 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-ink-mute">
            Welcome back
          </p>
          <h1 className="mt-2 font-fraunces text-3xl font-medium tracking-tight sm:text-4xl">
            Hello, <span className="text-aura-gradient">{firstName}</span>.
          </h1>
          <p className="mt-2.5 text-sm/relaxed font-medium text-ink-soft">
            Polishing your studio — this only takes a moment.
          </p>
        </div>

        {/* Snapshot card */}
        <div className="animate-fade-up mt-8 rounded-3xl border border-ink/10 bg-white/60 p-6 backdrop-blur-sm [animation-delay:140ms] sm:p-7">
          {/* Live address */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aura-cyan opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-aura-cyan" />
            </span>
            <span className="min-w-0 flex-1 truncate font-fraunces text-base font-medium text-ink">
              {userName ? `${userName}.auracv.me` : "your portfolio"}
            </span>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-50 px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide text-emerald-700">
              Live
            </span>
          </div>

          <div className="my-5 border-t border-ink/10" />

          {/* Headline stats */}
          <div className="grid grid-cols-3 divide-x divide-ink/10">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center px-2">
                <span className="font-fraunces text-2xl font-medium leading-none text-ink">
                  <NumberTicker value={s.value} className="text-ink" />
                </span>
                <span className="mt-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ink-mute">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <div className="my-5 border-t border-ink/10" />

          {/* Completeness */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-ink-mute">
                Profile completeness
              </span>
              <span className="font-fraunces text-sm font-medium text-ink">
                <NumberTicker value={completeness} className="text-ink" />%
              </span>
            </div>
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-parchment-200/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-aura-violet to-aura-cyan transition-[width] duration-[1200ms] ease-out"
                style={{ width: `${barFill}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer loader */}
        <div className="animate-fade-up mt-7 flex items-center justify-center gap-2.5 text-ink-mute [animation-delay:280ms]">
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.24em]">
            Opening your studio
          </span>
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink/40"
                style={{ animationDelay: `${i * 180}ms` }}
              />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
