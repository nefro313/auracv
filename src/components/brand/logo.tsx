import * as React from "react";
import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * AuraCV brand system, adapted for the parchment theme.
 *
 * - <AuraMark />     the aura ring + "A" glyph, inherits stroke from currentColor
 * - <AuraWordmark /> live-text wordmark set in Fraunces
 * - <AuraLogo />     full lockup (mark + wordmark)
 *
 * The gradient id is generated per-instance so multiple logos can
 * coexist on one page without SVG id collisions.
 */

export function AuraMark({
  className,
  glow = true,
}: {
  className?: string;
  glow?: boolean;
}) {
  const gradientId = useId();

  return (
    <svg
      viewBox="0 0 90 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("h-9 w-9 shrink-0", className)}
      style={
        glow
          ? { filter: "drop-shadow(0 1px 6px rgba(139, 92, 246, 0.35))" }
          : undefined
      }
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="15"
          y1="15"
          x2="75"
          y2="75"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <circle
        cx="45"
        cy="45"
        r="30"
        stroke={`url(#${gradientId})`}
        strokeWidth="6"
      />
      <path
        d="M45 18 L28 62 L62 62 Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M33 48 L57 48"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AuraWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-fraunces text-2xl font-semibold leading-none tracking-tight",
        className,
      )}
    >
      Aura
      <span className="text-aura-gradient">CV</span>
    </span>
  );
}

export function AuraLogo({
  className,
  markClassName,
  wordClassName,
}: {
  className?: string;
  markClassName?: string;
  wordClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-ink", className)}>
      <AuraMark className={markClassName} />
      <AuraWordmark className={wordClassName} />
    </span>
  );
}
