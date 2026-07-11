import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/seo/metadata";
import SignupClient from "./signup-client";

export const metadata: Metadata = staticPageMetadata({
  title: "Sign up free",
  description:
    "Create a free AuraCV account and turn your résumé into a polished, shareable portfolio at your own address in about twenty seconds.",
  path: "/signup",
});

export default function SignupPage() {
  return <SignupClient />;
}
