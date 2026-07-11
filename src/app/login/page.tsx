import type { Metadata } from "next";
import { staticPageMetadata } from "@/lib/seo/metadata";
import LoginClient from "./login-client";

export const metadata: Metadata = staticPageMetadata({
  title: "Sign in",
  description:
    "Sign in to AuraCV to edit your portfolio, update your résumé, and share your personal site.",
  path: "/login",
});

export default function LoginPage() {
  return <LoginClient />;
}
