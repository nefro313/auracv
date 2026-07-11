import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Metadata } from "next";
import "./globals.css";
import { DM_Sans, Outfit, Quattrocento, Fraunces } from "next/font/google";
import { headers } from "next/headers";
import { Providers } from "./providers";
import { CommonContextProvider } from "@/CommonContext";
import { supabase } from "@/utils/supabase/supabase_service";
import { UserProfile } from "@/lib/type";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";

const DM_SansFont = DM_Sans({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

const OutfitFont = Outfit({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

const QuattrocentoFont = Quattrocento({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-quattrocento",
});

const FrauncesFont = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz"],
});

async function getUser(auracv: string): Promise<UserProfile | null> {
  try {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("resumeJson")
      .eq("userName", auracv)
      .single();

    if (userError) {
      // Unknown subdomain — no portfolio here. Return null so the page can
      // render the "claim this address" invitation instead of bouncing the
      // visitor back to the landing page.
      return null;
    }
    const user: any = {
      meta: {
        userName: userData.resumeJson.meta.userName,
      },
      basics: {
        name: userData.resumeJson.basics.name,
        about: userData.resumeJson.basics.about,
        avatarUrl: userData.resumeJson.basics.avatarUrl,
      },
    };

    return user;
  } catch (error) {
    console.error("An error occurred while fetching the shop details:", error);
    return null; // Return null if there's an error in the fetch process
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const userName = headersList.get("x-forwarded-host")?.split(".")[0] ?? "";
  const isDev = userName?.includes("localhost");
  if (userName === "www" || isDev) {
    return {
      metadataBase: new URL("https://auracv.me"),
      title: "auracv - Create Stunning Portfolios and CVs that Get You Hired",
      description:
        "auracv is your ultimate tool to instantly transform your resume into a beautiful, shareable portfolio. Ideal for job seekers, professionals, and students. Share your professional journey across DMs and social media with customizable templates designed to impress.",
      openGraph: {
        title: "auracv - Create Stunning Portfolios and CVs that Get You Hired",
        description:
          "Instantly create and share stunning portfolios and CVs with auracv. Effortlessly convert your resume into a professional portfolio that stands out. Perfect for job seekers, professionals, and students.",
        url: "https://auracv.me",
        siteName: "auracv",
        locale: "en_US",
        type: "website",
        images: "/logo_icon.png",
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      twitter: {
        title: "auracv - Create Stunning Portfolios and CVs Instantly",
        card: "summary_large_image",
      },
      verification: {
        google: "",
        yandex: "",
      },
      keywords: [
        "CV creator",
        "online portfolio maker",
        "instant CV creator",
        "portfolio templates",
        "share CV online",
        "DM CV sharing",
        "social media portfolio",
        "professional portfolio",
        "job seekers portfolio",
        "student CV builder",
        "customizable CV templates",
        "beautiful CV designs",
        "resume to portfolio",
        "digital portfolio",
        "impress employers",
        "easy CV creation",
        "stunning CV designs",
        "online CV tool",
        "get hired faster",
        "CV for LinkedIn",
        "social media resume",
        "free CV builder",
      ],
    };
  }
  const user: UserProfile | null = await getUser(userName || "");
  if (!user) {
    return {
      metadataBase: new URL("https://auracv.me"),
      title: "auracv - Create Stunning Portfolios and CVs that Get You Hired",
      description:
        "auracv is your ultimate tool to instantly transform your resume into a beautiful, shareable portfolio. Ideal for job seekers, professionals, and students. Share your professional journey across DMs and social media with customizable templates designed to impress.",
      openGraph: {
        title: "auracv - Create Stunning Portfolios and CVs that Get You Hired",
        description:
          "Instantly create and share stunning portfolios and CVs with auracv. Effortlessly convert your resume into a professional portfolio that stands out. Perfect for job seekers, professionals, and students.",
        url: "https://auracv.me",
        siteName: "auracv",
        locale: "en_US",
        type: "website",
        images: "/logo_icon.png",
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
      twitter: {
        title: "auracv - Create Stunning Portfolios and CVs Instantly",
        card: "summary_large_image",
      },
      verification: {
        google: "",
        yandex: "",
      },
      keywords: [
        "CV creator",
        "online portfolio maker",
        "instant CV creator",
        "portfolio templates",
        "share CV online",
        "DM CV sharing",
        "social media portfolio",
        "professional portfolio",
        "job seekers portfolio",
        "student CV builder",
        "customizable CV templates",
        "beautiful CV designs",
        "resume to portfolio",
        "digital portfolio",
        "impress employers",
        "easy CV creation",
        "stunning CV designs",
        "online CV tool",
        "get hired faster",
        "CV for LinkedIn",
        "social media resume",
        "free CV builder",
      ],
    };
  }

  return {
    metadataBase: new URL(`https://${user.meta.userName}.auracv.me`),
    title: user.basics.name,
    description: user.basics.about,
    openGraph: {
      title: `${user.basics.name}`,
      description: user.basics.about,
      url: `https://${user.meta.userName}.auracv.me`,
      siteName: `${user.meta.userName}`,
      locale: "en_US",
      type: "website",
      images: `${user.basics.avatarUrl}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    twitter: {
      title: `${user.basics.name}`,
      card: "summary_large_image",
    },
    verification: {
      google: "",
      yandex: "",
    },
    keywords: [
      `${user.basics.name} portfolio`,
      `${user.meta.userName} CV`,
      `${user.meta.userName} profile`,
      `${user.meta.userName} online resume`,
      "personal portfolio",
      "online profile",
      "digital portfolio",
      ...(user.skills?.map((skill) => skill.name) || []),
      ...(user.work?.map((job) => job.position) || []),
      ...(user.education?.map((edu) => edu.area) || []),
    ],
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVariables = ` ${DM_SansFont.variable} ${OutfitFont.variable} ${QuattrocentoFont.variable} ${FrauncesFont.variable}`;
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className="font-dmSans bg-parchment-100">
        <GoogleAnalytics gaId="G-3VBBZ01RDS" />{" "}
        <GoogleTagManager gtmId="GTM-P92GBK9P" />
        <CommonContextProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            <TooltipProvider delayDuration={0}>
              <Providers>
                {children} <Analytics />
                <SpeedInsights />
              </Providers>
            </TooltipProvider>
          </ThemeProvider>
        </CommonContextProvider>
      </body>
    </html>
  );
}
