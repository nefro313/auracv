import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/seo/metadata";
import ProfileClient from "./profile-client";

// Auth-gated app surface — robots.txt already disallows it, but disallow
// alone doesn't keep a linked URL out of the index; noindex does.
export const metadata: Metadata = staticPageMetadata({
  title: "Your account",
  description: "Manage your AuraCV account and portfolio settings.",
  path: "/profile",
  noindex: true,
});

export default function ProfilePage() {
  return <ProfileClient />;
}
