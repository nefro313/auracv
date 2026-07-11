"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * An image that shows a calm "Atelier Paper" skeleton while it downloads, then
 * fades the photo in once it has loaded. Falls back to `fallback` (e.g. an
 * initial) when there is no `src` or the image genuinely fails to load.
 *
 * Use for portfolio photos so a slow network shows a shimmer placeholder
 * instead of an empty box or a broken-image icon.
 */
export function ImageWithSkeleton({
  src,
  alt,
  fallback,
  wrapperClassName,
  imgClassName,
  fallbackClassName,
  priority = false,
}: {
  src?: string | null;
  alt: string;
  fallback?: React.ReactNode;
  wrapperClassName?: string;
  imgClassName?: string;
  fallbackClassName?: string;
  /** Set for the LCP image (the portfolio avatar) so the browser fetches it
   *  first; everything else lazy-loads. */
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const showImage = !!src && !error;

  // A cached image can finish loading before React attaches the `onLoad`
  // listener, in which case that event never fires and the skeleton gets
  // stuck forever. Check `complete` directly once the <img> is mounted (and
  // again whenever `src` changes) to catch that case.
  useEffect(() => {
    setLoaded(false);
    setError(false);
    const img = imgRef.current;
    if (img?.complete) {
      if (img.naturalWidth === 0) {
        setError(true);
      } else {
        setLoaded(true);
      }
    }
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden", wrapperClassName)}>
      {/* Skeleton — visible until the image finishes loading. */}
      {showImage && !loaded && (
        <div className="absolute inset-0 animate-pulse bg-parchment-200/70" />
      )}

      {showImage ? (
        <img
          ref={imgRef}
          src={src as string}
          alt={alt}
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={cn(
            "h-full w-full transition-opacity duration-300 ease-out",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
        />
      ) : (
        fallback != null && (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center",
              fallbackClassName,
            )}
          >
            {fallback}
          </div>
        )
      )}
    </div>
  );
}
