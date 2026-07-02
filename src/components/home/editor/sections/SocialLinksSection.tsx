"use client";

import { Button, Input } from "@nextui-org/react";
import React from "react";
import { externalHref, faviconUrl } from "@/lib/utils";
import { useEditor } from "../EditorContext";

const FIXED_NETWORKS = [
  "LinkedIn",
  "GitHub",
  "X",
  "Youtube",
  "Dribbble",
  "Medium",
];

export default function SocialLinksSection() {
  const { user, setUser, handleSocialProfileChange, markAsEdited } = useEditor();

  // Any profile that isn't one of the built-in networks is a user-added custom
  // link (articles, case studies, a personal site, …). Keep the original array
  // index so edits/removes map back to basics.profiles.
  const customLinks = user.basics.profiles
    .map((profile, index) => ({ ...profile, index }))
    .filter((profile) => !FIXED_NETWORKS.includes(profile.network));

  const addCustomLink = () => {
    setUser((prev) => ({
      ...prev,
      basics: {
        ...prev.basics,
        profiles: [
          ...prev.basics.profiles,
          { network: "", url: "", username: "" },
        ],
      },
    }));
    markAsEdited();
  };

  const updateCustomLink = (
    profileIndex: number,
    field: "network" | "url",
    value: string,
  ) => {
    setUser((prev) => {
      const profiles = [...prev.basics.profiles];
      profiles[profileIndex] = { ...profiles[profileIndex], [field]: value };
      return { ...prev, basics: { ...prev.basics, profiles } };
    });
    markAsEdited();
  };

  const removeCustomLink = (profileIndex: number) => {
    setUser((prev) => ({
      ...prev,
      basics: {
        ...prev.basics,
        profiles: prev.basics.profiles.filter((_, i) => i !== profileIndex),
      },
    }));
    markAsEdited();
  };

  return (
          <div
            id="social-links"
            className="scroll-mt-20 flex flex-col pb-6 pt-11 justify-center items-start gap-4"
          >
            <h2 className="font-fraunces text-2xl font-medium tracking-tight text-ink mb-5">
              Social Links
            </h2>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-0.5">LinkedIn</p>
              <Input
                type="text"
                variant="bordered"
                value={
                  user.basics.profiles.find(
                    (profile) => profile.network === "LinkedIn",
                  )?.url || ""
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSocialProfileChange("LinkedIn", e.target.value, setUser)
                }
                onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                  handleSocialProfileChange(
                    "LinkedIn",
                    externalHref(e.target.value),
                    setUser,
                  )
                }
                placeholder="https://linkedin.com/in/username"
                className="max-w-xs text-ink-soft"
                startContent={
                  <img
                    src="/icon/linkedin.png"
                    className="w-6 h-6 opacity-70"
                    alt="LinkedIn"
                  />
                }
                classNames={{
                  inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                }}
              />
            </div>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-0.5">GitHub</p>
              <Input
                type="text"
                variant="bordered"
                value={
                  user.basics.profiles.find(
                    (profile) => profile.network === "GitHub",
                  )?.url || ""
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSocialProfileChange("GitHub", e.target.value, setUser)
                }
                onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                  handleSocialProfileChange(
                    "GitHub",
                    externalHref(e.target.value),
                    setUser,
                  )
                }
                placeholder="https://github.com/username"
                className="max-w-xs text-ink-soft"
                startContent={
                  <img
                    src="/icon/github.png"
                    className="w-6 h-6 opacity-70"
                    alt="GitHub"
                  />
                }
                classNames={{
                  inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                }}
              />
            </div>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-0.5">Twitter</p>
              <Input
                type="text"
                variant="bordered"
                value={
                  user.basics.profiles.find(
                    (profile) => profile.network === "X",
                  )?.url || ""
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSocialProfileChange("X", e.target.value, setUser)
                }
                onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                  handleSocialProfileChange(
                    "X",
                    externalHref(e.target.value),
                    setUser,
                  )
                }
                placeholder="https://x.com/username"
                className="max-w-xs text-ink-soft"
                startContent={
                  <img
                    src="/icon/twitter.png"
                    className="w-5 h-5 opacity-70"
                    alt="Twitter"
                  />
                }
                classNames={{
                  inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                }}
              />
            </div>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-0.5">YouTube</p>
              <Input
                type="text"
                variant="bordered"
                value={
                  user.basics.profiles.find(
                    (profile) => profile.network === "Youtube",
                  )?.url || ""
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSocialProfileChange("Youtube", e.target.value, setUser)
                }
                onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                  handleSocialProfileChange(
                    "Youtube",
                    externalHref(e.target.value),
                    setUser,
                  )
                }
                placeholder="https://youtube.com/@channel"
                className="max-w-xs text-ink-soft"
                startContent={
                  <img
                    src="/icon/youtube.png"
                    className="w-5 h-5 opacity-70"
                    alt="YouTube"
                  />
                }
                classNames={{
                  inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                }}
              />
            </div>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-0.5">Dribbble</p>
              <Input
                type="text"
                variant="bordered"
                value={
                  user.basics.profiles.find(
                    (profile) => profile.network === "Dribbble",
                  )?.url || ""
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSocialProfileChange("Dribbble", e.target.value, setUser)
                }
                onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                  handleSocialProfileChange(
                    "Dribbble",
                    externalHref(e.target.value),
                    setUser,
                  )
                }
                placeholder="https://dribbble.com/username"
                className="max-w-xs text-ink-soft"
                startContent={
                  <img
                    src="/icon/dribbble.png"
                    className="w-5 h-5 opacity-70"
                    alt="Dribbble"
                  />
                }
                classNames={{
                  inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                }}
              />
            </div>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-0.5">Medium</p>
              <Input
                type="text"
                variant="bordered"
                value={
                  user.basics.profiles.find(
                    (profile) => profile.network === "Medium",
                  )?.url || ""
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleSocialProfileChange("Medium", e.target.value, setUser)
                }
                onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                  handleSocialProfileChange(
                    "Medium",
                    externalHref(e.target.value),
                    setUser,
                  )
                }
                placeholder="https://medium.com/@username"
                className="max-w-xs text-ink-soft"
                startContent={
                  <img
                    src="/icon/medium.svg"
                    className="w-5 h-5 opacity-70"
                    alt="Medium"
                  />
                }
                classNames={{
                  inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                }}
              />
            </div>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-0.5">Other Links</p>
              <div className="flex max-w-xs w-full flex-col gap-3">
                {customLinks.length === 0 && (
                  <p className="text-xs text-ink-mute">
                    Articles, case studies, your own site — add any link. The
                    site&rsquo;s icon is fetched automatically.
                  </p>
                )}
                {customLinks.map((link) => (
                  <div
                    key={`custom-${link.index}`}
                    className="flex w-full items-start gap-2"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <Input
                        size="sm"
                        type="text"
                        variant="bordered"
                        placeholder="Label (e.g. Articles)"
                        value={link.network}
                        onChange={(e) =>
                          updateCustomLink(link.index, "network", e.target.value)
                        }
                        classNames={{
                          inputWrapper:
                            "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                        }}
                      />
                      <Input
                        size="sm"
                        type="text"
                        variant="bordered"
                        placeholder="https://yoursite.com/article"
                        value={link.url}
                        onChange={(e) =>
                          updateCustomLink(link.index, "url", e.target.value)
                        }
                        onBlur={(e) =>
                          updateCustomLink(
                            link.index,
                            "url",
                            externalHref(e.target.value),
                          )
                        }
                        startContent={
                          faviconUrl(link.url) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={faviconUrl(link.url)}
                              alt=""
                              className="h-4 w-4 shrink-0 rounded-sm object-contain"
                            />
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="h-4 w-4 shrink-0 text-ink-mute"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 13 16h-2a3.987 3.987 0 0 0-3.951 3.512A8.949 8.949 0 0 0 12 21Zm3-11.25a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                              />
                            </svg>
                          )
                        }
                        classNames={{
                          inputWrapper:
                            "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                        }}
                      />
                    </div>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="bordered"
                      aria-label="Remove link"
                      onPress={() => removeCustomLink(link.index)}
                      className="h-11 w-11 min-w-11 shrink-0 rounded-full border-ink/15"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-5 w-5 text-ink-soft"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 12h14"
                        />
                      </svg>
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="bordered"
                  onPress={addCustomLink}
                  className="group self-end border border-dashed border-ink/25 bg-none rounded-full flex justify-center items-center gap-1 text-xs font-semibold text-ink-soft transition-colors hover:border-aura-violet/60 hover:bg-aura-violet/5 hover:text-ink"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4 text-ink-soft transition-transform duration-200 ease-out group-hover:rotate-90"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  Add link
                </Button>
              </div>
            </div>
          </div>
  );
}
