"use client";
import { getCookie } from "cookies-next/client";
import DotPattern from "@/components/magicui/dot-pattern";
import React, { useRef, useState, useEffect } from "react";
import { Input } from "@nextui-org/react";
import type { ConfettiRef } from "@/components/magicui/confetti";
import { supabase } from "@/utils/supabase/client";
import { setCookie } from "cookies-next/client";
import { useCommonContext } from "@/CommonContext";
import { useRouter } from "next/navigation";
import { reservedWords } from "@/lib/type";
import axios from "axios";
import confetti from "canvas-confetti";
import Navbar from "@/components/create/Navbar";
import { Tabs, Tab } from "@nextui-org/react";
import AnimatedCircularProgressBar from "@/components/magicui/animated-circular-progress-bar";
import withAuth from "@/utils/authProtect";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/components/ui/notification";
import { cn } from "@/lib/utils";

/** Turn an axios/unknown error into a user-facing message, preferring the
 *  backend's `{ error: { message } }` envelope and handling network/timeouts. */
function describeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = (
      error.response?.data as { error?: { message?: string } } | undefined
    )?.error?.message;
    if (message) return message;
    if (error.code === "ECONNABORTED")
      return "The request timed out. Please try again.";
    if (!error.response)
      return "Couldn't reach the server. Check your connection and try again.";
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

function Page() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { notify, viewport: notificationViewport } = useNotifications();
  const { userData } = useCommonContext();
  const confettiRef = useRef<ConfettiRef>(null);
  const [shopSlug, setShopSlug] = useState("");
  const [slugError, setSlugError] = useState(false);
  const [slugMissing, setSlugMissing] = useState(false);
  const [oldSlug, setOldSlug] = useState("");
  const [errorMessage] = useState("Already taken!");
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [resumeUrl, setResumeUrl] = useState("");
  const [aiCreating, setAiCreating] = useState(false);
  const slugInputRef = useRef<HTMLInputElement>(null);

  const [isAvailable, setIsAvailable] = useState(false);
  const isError = slugError || slugMissing;
  const displayedErrorMessage = slugMissing
    ? "Please enter your portfolio domain"
    : errorMessage;

  // Flag the domain field as required: turn it red, focus and scroll to it so
  // the user can see exactly which field needs filling.
  const flagMissingSlug = () => {
    setSlugMissing(true);
    slugInputRef.current?.focus();
    slugInputRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };
  useEffect(() => {
    const user = getCookie("username");
    if (user) {
      setShopSlug(user);
      setOldSlug(user);
    }
  }, []);

  const checkSlugUnique = async (slug: string): Promise<boolean> => {
    if (shopSlug === oldSlug) {
      return true;
    }
    if (reservedWords.includes(slug.toLowerCase())) {
      return false;
    }

    const { data, error } = await supabase
      .from("users")
      .select("userName")
      .eq("userName", slug);

    if (error) {
      console.error("Error checking slug:", error);
      return false;
    }

    return data.length === 0;
  };

  const handleBlur = async () => {
    const isUnique = await checkSlugUnique(shopSlug);
    if (shopSlug === "") {
      setIsAvailable(false);
    }
    if (isUnique && shopSlug !== "") {
      setIsAvailable(isUnique);
      setCookie("username", shopSlug, { maxAge: 60 * 60 * 24 * 100 });
    }
    setSlugError(!isUnique);
  };
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!aiCreating) {
      setValue(100);
      return;
    }
    // Single, monotonic progress: creep up to 90% while the resume is being
    // extracted/parsed, then hold there until generateai sets it to 100 on
    // completion. Never resets to 0, so the bar only ever fills once.
    setValue(0);
    const interval = setInterval(() => {
      setValue((prev) => (prev >= 90 ? prev : prev + 10));
    }, 1200);

    return () => clearInterval(interval);
  }, [aiCreating]);

  useEffect(() => {
    const insertUser = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("userName")
        .eq("userId", userData?.user.id);
      if (error) {
        setLoading(false);
        return;
      }
      if (data.length > 0) {
        // Returning user with a portfolio — greet them while /studio loads.
        sessionStorage.setItem("auracv:welcome", "1");
        router.push("/studio");
        return;
      }
      if (data.length === 0) {
        setLoading(false);
      }
    };

    insertUser();
  }, [userData]);
  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center bg-parchment-100 px-7">
        <div className="mt-28 flex w-full max-w-sm flex-col items-center gap-8">
          {/* heading */}
          <Skeleton className="h-9 w-64" />
          {/* claim-your-domain input */}
          <div className="flex w-full flex-col gap-2">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          {/* tab switcher */}
          <Skeleton className="h-12 w-full rounded-2xl" />
          {/* tab body: icon + input row */}
          <div className="flex w-full flex-col gap-3">
            <Skeleton className="h-4 w-52" />
            <div className="flex w-full items-center gap-2">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-12 flex-1 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleFileUpload = async (file: File) => {
    setUploadStatus("uploading");
    const { data, error } = await supabase.storage
      .from("resume")
      .upload(
        `public/${userData?.user.id}/resume${Math.floor(
          1000 + Math.random() * 9000,
        )}.pdf`,
        file,
        {
          cacheControl: "3600",
          upsert: false,
        },
      );

    if (error) {
      console.error("Error uploading file:", error);
      setUploadStatus("idle");
      return;
    }

    if (data) {
      setUploadStatus("uploaded");
      const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/resume/${data.path}`;
      setResumeUrl(fileUrl);
    }
  };

  const ManuallyCreate = async () => {
    if (!shopSlug) {
      flagMissingSlug();
      return;
    }
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
    const { data, error } = await supabase.from("users").insert({
      id: userData?.user.id,
      userName: shopSlug.toLowerCase().replace(/\s+/g, ""),
      resumeJson: {
        meta: {
          buttonText: "Hire me",
          resumeTheme: "professional",
          portfolioColor: "sky",
          portfolioTheme: "basic",
          userName: shopSlug.toLowerCase().replace(/\s+/g, ""),
          avatarUrl: userData?.user.user_metadata.avatar_url,
        },
        basics: {
          name: userData?.user.user_metadata.full_name,
          phone: "",
          label: "",
          avatarUrl: userData?.user.user_metadata.avatar_url,
          about: "",
          website: "",
          resumeUrl: "",
          email: userData?.user.email,
          skills: [],
          location: {
            city: "",
            countryCode: "",
          },
          profiles: [
            {
              username: "",
              url: "",
              network: "LinkedIn",
            },
            {
              username: "",
              url: "",
              network: "X",
            },
            {
              username: "",
              url: "",
              network: "GitHub",
            },
            {
              username: "",
              url: "",
              network: "Youtube",
            },
            {
              username: "",
              url: "",
              network: "Dribbble",
            },
            {
              username: "",
              url: "",
              network: "Medium",
            },
          ],
        },
        certificates: [
          {
            name: "",
            date: "",
            issuer: "",
            url: "",
          },
        ],
        education: [
          {
            endDate: "",
            startDate: "",
            area: "",
            studyType: "",
            summary: "",
            institution: "",
            url: "",
            logo: "",
            score: "",
            courses: [""],
          },
        ],
        skills: [
          {
            name: "",
            keywords: [""],
          },
        ],
        awards: [
          {
            title: "",
            awarder: "",
            date: "",
            summary: "",
          },
        ],
        hackathons: {
          description: "",
          hackathons: [
            {
              title: "",
              dates: "",
              location: "",
              description: "",
              image: "",
              win: "",
              url: "",
            },
          ],
        },

        volunteer: [
          {
            organization: "",
            position: "",
            url: "",
            startDate: "",
            summary: "",
            highlights: [""],
          },
        ],
        work: [
          {
            summary: "",
            website: "",
            name: "",
            location: "",
            position: "",
            startDate: "",
            endDate: "",
            logo: "",
            highlights: [""],
          },
        ],
        projects: {
          description: "",
          projects: [
            {
              title: "",
              description: "",
              website: "",
              duration: "",
              technologies: [""],
              highlights: [""],
              image: "",
              source: "",
            },
          ],
        },
        languages: [
          {
            language: "",
            fluency: "",
          },
        ],
        interests: [
          {
            name: "",
            keywords: [""],
          },
        ],
        references: [
          {
            reference: "",
            name: "",
          },
        ],
      },
      metaJson: {
        userName: shopSlug.toLowerCase().replace(/\s+/g, ""),
        avatarUrl: userData?.user.user_metadata.avatar_url,
        buttonText: "Hire me",
        resumeTheme: "professional",
        portfolioColor: "sky",
        portfolioTheme: "basic",
      },
    });

    if (error) {
      console.error("Error inserting user:", error);
    }

    if (!error) {
      router.push("/studio");
    }
  };

  const generateai = async () => {
    if (!shopSlug) {
      flagMissingSlug();
      return;
    }
    if (!resumeUrl) {
      notify({
        variant: "warning",
        title: "Resume required",
        description: "Please upload your resume (PDF) to generate your portfolio.",
      });
      return;
    }
    setAiCreating(true);
    setValue(0);

    if (resumeUrl) {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND}/extract-pdf`,
          {
            pdfUrl: resumeUrl,
          },
        );
        console.log("AI Generated Result:", response);
        const result = response.data;
        // result.userName = shopSlug;
        // result.avatarUrl = userData?.user_metadata.avatarUrl;
        // result.userId = userData?.user.id;
        console.log("AI Generated Result:", result);
        // Filter out null values from the result object
        const end = Date.now() + 3 * 1000; // 3 seconds
        const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

        const frame = () => {
          if (Date.now() > end) return;

          confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            startVelocity: 60,
            origin: { x: 0, y: 0.5 },
            colors: colors,
          });
          confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            startVelocity: 60,
            origin: { x: 1, y: 0.5 },
            colors: colors,
          });

          requestAnimationFrame(frame);
        };

        frame();
        setValue(90);
        const extendedResult = await {
          userName: shopSlug.toLowerCase().replace(/\s+/g, ""),
          resumeJson: {
            ...result,
            meta: {
              ...result.meta,
              userName: shopSlug.toLowerCase().replace(/\s+/g, ""),
              buttonText: "Hire me",
              resumeTheme: "professional",
              portfolioColor: "sky",
              portfolioTheme: "basic",
              avatarUrl: userData?.user.user_metadata.avatar_url,
            },
            basics: {
              ...result.basics,
              email: userData?.user.email,
              avatarUrl: userData?.user.user_metadata.avatar_url,
            },
          },
          metaJson: {
            userName: shopSlug.toLowerCase().replace(/\s+/g, ""),
            avatarUrl: userData?.user.user_metadata.avatar_url,
            buttonText: "Hire me",
            resumeTheme: "professional",
            portfolioColor: "sky",
            portfolioTheme: "basic",
          },
          userEmail: userData?.user.email,
          userId: userData?.user.id,
        };
        const { data, error } = await supabase
          .from("users")
          .insert(extendedResult);

        if (error) {
          console.error("Error inserting user:", error);
          notify({
            variant: "error",
            title: "Couldn't save your portfolio",
            description:
              "Your resume was parsed but we couldn't save it. Please try again.",
          });
          setAiCreating(false);
          setValue(0);
          return null;
        }
        setValue(100);
        router.push("/studio");

        console.log("AI Generated Result:", result);
      } catch (error) {
        console.error("Error in AI generation:", error);
        notify({
          variant: "error",
          title: "Couldn't generate your portfolio",
          description: describeError(error),
        });
        setAiCreating(false);
        setValue(0);
      }
    }
    return null;
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-parchment-100 font-outfit text-ink antialiased">
      {notificationViewport}
      <div>
        <Navbar />
      </div>
      <div className="w-full flex-1 px-7 flex flex-col justify-between items-center py-10">
        {aiCreating ? (
          <div className="flex mt-44 justify-start flex-col items-center gap-10">
            <DotPattern className="absolute mt-16 [mask-image:radial-gradient(300px_circle_at_center,white,transparent)]" />
            <h1 className="z-50 pb-0 text-center font-fraunces text-3xl font-medium tracking-tight text-ink">
              AI is generating
            </h1>
            <AnimatedCircularProgressBar
              max={100}
              min={0}
              value={value}
              gaugePrimaryColor="rgb(139 92 246)"
              gaugeSecondaryColor="rgba(33, 27, 18, 0.1)"
            />
          </div>
        ) : (
          <div className="max-w-xl -mt-4 rounded-3xl  min-h-64 h-full w-full flex flex-col justify-center items-center">
            <DotPattern className="absolute [mask-image:radial-gradient(300px_circle_at_center,white,transparent)]" />
            <h1 className="z-50 pb-12 text-center font-fraunces text-3xl font-medium tracking-tight text-ink sm:text-4xl">
              Create your portfolio
            </h1>
            <Input
              type="url"
              placeholder=""
              labelPlacement="outside"
              label="Claim your portfolio domain"
              className="z-50 inputbar flex w-full max-w-sm justify-center rounded-xl font-outfit text-lg font-semibold text-ink-soft"
              size="lg"
              classNames={{
                input: cn(
                  "font-semibold text-lg",
                  isError && "!text-red-600 placeholder:!text-red-400",
                ),
                label: cn(
                  "font-semibold text-base",
                  isError ? "!text-red-600" : "text-ink-soft",
                ),
                inputWrapper: cn(
                  isError &&
                    "!bg-red-50 !border-2 !border-red-500 ring-2 ring-red-500/30",
                ),
                errorMessage: "!text-red-600 font-medium",
              }}
              ref={slugInputRef}
              isInvalid={isError}
              errorMessage={displayedErrorMessage}
              value={shopSlug}
              onBlur={handleBlur}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSlugError(false);
                setSlugMissing(false);
                setShopSlug(e.target.value.toLowerCase().replace(/\s+/g, ""));
              }}
              endContent={
                <div className="pointer-events-none w-full justify-between pl-2 flex items-center">
                  <span className="text-ink-mute font-semibold text-lg">
                    .auracv.me
                  </span>
                  {isAvailable && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6 text-green-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  )}
                </div>
              }
              startContent={
                <div className="pointer-events-none justify-between pl-2 flex items-center">
                  <span className="text-ink-mute font-semibold text-lg">
                    https://
                  </span>
                </div>
              }
            />{" "}
            <div className="flex z-50 mt-8 relative flex-col sm:gap-0 w-full justify-center text-sm  items-center">
              <Tabs
                className="w-full bg-parchment-200 rounded-2xl font-outfit flex justify-center items-center max-w-sm"
                aria-label="Options"
                color="default"
                variant="light"
                size="lg"
                radius="sm"
              >
                <Tab
                  className="w-full "
                  key="photos"
                  title={
                    <div className="flex justify-center items-center  space-x-1 ">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        x="0px"
                        y="0px"
                        className="size-6"
                        viewBox="0 0 48 48"
                      >
                        <path
                          fill="#0288D1"
                          d="M42,37c0,2.762-2.238,5-5,5H11c-2.761,0-5-2.238-5-5V11c0-2.762,2.239-5,5-5h26c2.762,0,5,2.238,5,5V37z"
                        ></path>
                        <path
                          fill="#FFF"
                          d="M12 19H17V36H12zM14.485 17h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99C24.957 25.543 25 26.511 25 27v9h-5V19h5v2.616C25.721 20.5 26.85 19 29.738 19c3.578 0 6.261 2.25 6.261 7.274L36 36 36 36z"
                        ></path>
                      </svg>
                      <span className="flex text-base h-full justify-center items-center">
                        From LinkedIn
                      </span>
                    </div>
                  }
                >
                  {" "}
                  <div className="flex z-50 mt-3 flex-col gap-2 sm:gap-0 w-full justify-center text-sm items-center">
                    <p className="w-full text-start max-w-sm font-medium mb-2.5 text-base">
                      Bring your LinkedIn profile in 3 steps
                    </p>
                    <div className="flex max-w-sm w-full flex-col gap-3 rounded-xl border border-ink/10 bg-white p-4 text-ink-soft">
                      <ol className="list-decimal space-y-2 pl-5 text-sm font-medium">
                        <li>
                          Open your LinkedIn profile and click{" "}
                          <span className="font-semibold text-ink">More</span>.
                        </li>
                        <li>
                          Choose{" "}
                          <span className="font-semibold text-ink">
                            Save to PDF
                          </span>{" "}
                          to download your profile.
                        </li>
                        <li>
                          Switch to the{" "}
                          <span className="font-semibold text-ink">
                            Upload resume
                          </span>{" "}
                          tab and upload that PDF.
                        </li>
                      </ol>
                      <p className="text-xs text-ink-mute">
                        LinkedIn no longer allows importing directly from a
                        profile URL, so the exported PDF gives us the most
                        accurate, complete portfolio.
                      </p>
                    </div>
                  </div>
                </Tab>
                <Tab
                  className="w-full"
                  key="music"
                  title={
                    <div className="flex justify-center items-center  space-x-2 ">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5 text-red-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                        />
                      </svg>
                      <span>Upload resume </span>
                    </div>
                  }
                >
                  {" "}
                  <div className="flex z-50 mt-3 flex-col gap-2 sm:gap-0 w-full justify-center text-sm  items-center">
                    <p className="w-full text-start max-w-sm font-medium mb-2.5 text-base">
                      Upload resume for instant portfolio (PDF)
                    </p>
                    <div className="flex max-w-sm w-full justify-center  gap-2 items-center flex-row flex-wrap">
                      {resumeUrl ? (
                        <div className="w-12 h-12 flex items-center justify-center  bg-parchment-200 rounded-xl">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6 text-green-500"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12"
                            />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center  bg-parchment-200 rounded-xl">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6 text-ink-mute"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                            />
                          </svg>
                        </div>
                      )}

                      <label className=" flex flex-row gap-2 text-ink-mute cursor-pointer shadow-xs justify-center items-center  flex-1 px-3 h-12 border-ink/20 rounded-xl border-dashed border  bg-white">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-4 text-ink-mute"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                          />
                        </svg>
                        {uploadStatus === "idle" && "Upload resume or CV (PDF)"}
                        {uploadStatus === "uploading" && "Uploading..."}
                        {uploadStatus === "uploaded" && "resume uploaded"}
                        <input
                          onChange={(event) => {
                            // setIsError(false);
                            if (event.target.files) {
                              handleFileUpload(event.target.files[0]);
                            }
                          }}
                          type="file"
                          className="  w-full hidden  font-body font-light text-black/80 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-gray-700 hover:file:bg-slate-400"
                        />
                      </label>
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </div>
            <button
              onClick={generateai}
              className="mt-8 z-50 w-full hover:scale-[1.02] transform-gpu max-w-sm flex justify-center items-center gap-2 font-outfit bg-ink text-parchment-50 font-semibold transition duration-300 ease-in-out text-base rounded-full py-3 hover:shadow-[0_0_28px_-6px_rgba(139,92,246,0.65)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                />
              </svg>
              Generate By AI
            </button>
            <div className="relative w-full max-w-sm mt-5 z-50">
              <div
                className="absolute inset-0  flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t  border-ink/15"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 text-xs font-medium text-ink-mute bg-parchment-100">
                  Or
                </span>
              </div>
            </div>
            <button
              onClick={ManuallyCreate}
              className="mt-5 z-50 w-full transition duration-300 ease-in-out hover:bg-white/60 hover:border-ink/30  max-w-sm flex justify-center items-center gap-2 font-outfit border border-ink/15 bg-white/50 text-ink font-semibold text-base rounded-full py-3"
            >
              Create Manually
            </button>
          </div>
        )}
        <div></div>
      </div>
    </div>
  );
}

export default withAuth(Page);
