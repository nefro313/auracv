import { ResumeSkeleton } from "@/components/ui/skeletons";

/**
 * Streams instantly while the résumé page fetches the profile, so navigating
 * from the portfolio paints a sheet-shaped placeholder instead of a blank
 * screen. (It also lets Next prefetch this boundary from portfolio links.)
 */
export default function Loading() {
  return <ResumeSkeleton />;
}
