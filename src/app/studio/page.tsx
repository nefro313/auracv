import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/seo/metadata";
import StudioClient from "./studio-client";

// Auth-gated app surface — robots.txt already disallows it, but disallow
// alone doesn't keep a linked URL out of the index; noindex does.
export const metadata: Metadata = staticPageMetadata({
  title: "Studio",
  description: "Edit and publish your AuraCV portfolio.",
  path: "/studio",
  noindex: true,
});

export default function StudioPage() {
  return <StudioClient />;
}
