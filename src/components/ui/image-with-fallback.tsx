"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A drop-in replacement for the Radix `<Avatar>` pattern that avoids the
 * fallback "flash" on every render. Radix Avatar hides the image until its
 * `onload` fires and shows the fallback in the meantime — so even cached images
 * briefly render the placeholder tile. This component renders a native `<img>`
 * directly (the browser paints cached images immediately), fades it in on load,
 * and only shows the fallback when there is no `src` or the image genuinely
 * fails to load.
 */
export function ImageWithFallback({
  src,
  alt,
  fallback,
  wrapperClassName,
  imgClassName,
  fallbackClassName,
}: {
  src?: string | null;
  alt: string;
  fallback: React.ReactNode;
  wrapperClassName?: string;
  imgClassName?: string;
  fallbackClassName?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const showImage = !!src && !error;

  return (
    <div className={cn("relative overflow-hidden", wrapperClassName)}>
      {showImage ? (
        <img
          src={src as string}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={cn(
            "h-full w-full transition-opacity duration-500 ease-out",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
        />
      ) : (
        <div
          className={cn(
            "flex h-full w-full items-center justify-center",
            fallbackClassName,
          )}
        >
          {fallback}
        </div>
      )}
    </div>
  );
}
