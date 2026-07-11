import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/seo/metadata";
import CreateClient from "./create-client";

// Auth-gated app surface — robots.txt already disallows it, but disallow
// alone doesn't keep a linked URL out of the index; noindex does.
export const metadata: Metadata = staticPageMetadata({
  title: "Create your portfolio",
  description: "Upload your résumé and let AuraCV build your portfolio.",
  path: "/create",
  noindex: true,
});

export default function CreatePage() {
  return <CreateClient />;
}
