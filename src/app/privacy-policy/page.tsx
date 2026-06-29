import Link from "next/link";
import React from "react";

import { AuraLogo } from "@/components/brand/logo";

export const metadata = {
  title: "Privacy Policy — AuraCV",
  description:
    "How AuraCV collects, uses, and protects your information when you create and share your portfolio.",
};

const LAST_UPDATED = "June 29, 2026";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-fraunces text-2xl font-medium tracking-tight text-ink">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-soft sm:text-[0.95rem]">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-svh bg-parchment-100 font-outfit text-ink antialiased">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-parchment-50/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/auracv" title="AuraCV" className="flex items-center">
            <AuraLogo markClassName="h-8 w-8" wordClassName="text-xl" />
          </Link>
          <Link
            href="/auracv"
            className="text-xs font-semibold text-ink-mute transition hover:text-ink"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-aura-violet/20 bg-gradient-to-r from-aura-violet/10 to-aura-cyan/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-aura-gradient">
          Legal
        </span>
        <h1 className="mt-4 font-fraunces text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm font-medium text-ink-mute">
          Last updated: {LAST_UPDATED}
        </p>

        <p className="mt-6 text-sm leading-relaxed text-ink-soft sm:text-[0.95rem]">
          This Privacy Policy explains how AuraCV (&quot;AuraCV&quot;,
          &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and
          protects your information when you use our website and services (the
          &quot;Service&quot;) to create, host, and share your portfolio and
          résumé. By using the Service, you agree to the practices described in
          this policy.
        </p>

        <Section title="Information We Collect">
          <p>We collect the following types of information:</p>
          <ul className="ml-1 space-y-2.5">
            <li className="flex gap-2.5">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-aura-violet" />
              <span>
                <strong className="font-semibold text-ink">
                  Account information.
                </strong>{" "}
                When you sign in with Google, we receive your name, email
                address, and profile picture to create and secure your account.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-aura-violet" />
              <span>
                <strong className="font-semibold text-ink">
                  Portfolio &amp; résumé content.
                </strong>{" "}
                The information you add or upload — such as your bio, work
                experience, education, projects, skills, links, and any résumé
                PDF you provide for extraction.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-aura-violet" />
              <span>
                <strong className="font-semibold text-ink">
                  Uploaded files.
                </strong>{" "}
                Images and documents you upload (e.g. profile photos, project
                images, résumés) are stored to render your portfolio.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-aura-violet" />
              <span>
                <strong className="font-semibold text-ink">
                  Connected data.
                </strong>{" "}
                If you connect a GitHub username, we fetch public information from
                GitHub to build your developer highlights.
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-aura-violet" />
              <span>
                <strong className="font-semibold text-ink">Usage data.</strong>{" "}
                Basic technical information such as browser type, device, and
                pages visited, collected to keep the Service reliable and secure.
              </span>
            </li>
          </ul>
        </Section>

        <Section title="How We Use Your Information">
          <p>We use the information we collect to:</p>
          <ul className="ml-1 space-y-2.5">
            {[
              "Create, host, and display your public portfolio and résumé.",
              "Authenticate you and keep your account secure.",
              "Extract structured data from résumés you upload, so you can edit it.",
              "Operate, maintain, and improve the Service.",
              "Communicate with you about your account or important changes.",
            ].map((item) => (
              <li key={item} className="flex gap-2.5">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-aura-cyan" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>
            We do not sell your personal information, and we do not use your
            content to train third-party advertising models.
          </p>
        </Section>

        <Section title="Your Portfolio Is Public">
          <p>
            AuraCV is built to help you share your work. Any portfolio you
            publish (e.g. <em>yourname.auracv.me</em>) and the content within it
            is <strong className="font-semibold text-ink">publicly accessible
            </strong>{" "}
            to anyone with the link, and may be indexed by search engines. Please
            only include information you are comfortable sharing publicly.
          </p>
        </Section>

        <Section title="Third-Party Services">
          <p>
            We rely on trusted providers to run the Service. Your data may be
            processed by:
          </p>
          <ul className="ml-1 space-y-2.5">
            {[
              ["Google", "Sign-in (OAuth) authentication."],
              ["Supabase", "Authentication, database, and file storage."],
              ["GitHub", "Public profile data, when you connect a username."],
              ["Hosting providers", "Serving the website and your portfolios."],
            ].map(([name, desc]) => (
              <li key={name} className="flex gap-2.5">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-aura-violet" />
                <span>
                  <strong className="font-semibold text-ink">{name}.</strong>{" "}
                  {desc}
                </span>
              </li>
            ))}
          </ul>
          <p>
            Each provider processes data under its own privacy policy. We share
            only what is necessary to deliver the Service.
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            We use essential cookies and similar technologies to keep you signed
            in and to remember your preferences. We do not use cookies for
            third-party advertising. You can control cookies through your browser
            settings, though disabling them may affect sign-in.
          </p>
        </Section>

        <Section title="Data Storage & Security">
          <p>
            Your data is stored with our infrastructure providers using
            industry-standard safeguards, including encryption in transit and
            access controls. While no method of transmission or storage is
            completely secure, we take reasonable measures to protect your
            information from unauthorized access, alteration, or disclosure.
          </p>
        </Section>

        <Section title="Data Retention">
          <p>
            We retain your information for as long as your account is active or as
            needed to provide the Service. If you delete your account, we remove
            your personal data and portfolio content, except where we are
            required to retain it to comply with legal obligations.
          </p>
        </Section>

        <Section title="Your Rights">
          <p>
            Depending on where you live, you may have the right to access,
            correct, export, or delete your personal information, and to object to
            or restrict certain processing. You can edit most of your data
            directly in the editor, or contact us to exercise these rights.
          </p>
        </Section>

        <Section title="Children's Privacy">
          <p>
            The Service is not directed to children under 13 (or the minimum age
            required in your jurisdiction). We do not knowingly collect personal
            information from children. If you believe a child has provided us
            data, please contact us and we will delete it.
          </p>
        </Section>

        <Section title="Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. When we do, we
            will revise the &quot;Last updated&quot; date above. Significant
            changes may be communicated through the Service. Your continued use of
            AuraCV after an update means you accept the revised policy.
          </p>
        </Section>

        <Section title="Contact Us">
          <p>
            If you have questions about this Privacy Policy or your data, reach
            out to us at{" "}
            <a
              href="mailto:hello@auracv.me"
              className="font-semibold text-aura-gradient"
            >
              hello@auracv.me
            </a>
            .
          </p>
        </Section>

        <div className="mt-14 border-t border-ink/10 pt-6 text-xs font-medium text-ink-mute">
          © {new Date().getFullYear()} AuraCV. All rights reserved.
        </div>
      </main>
    </div>
  );
}
