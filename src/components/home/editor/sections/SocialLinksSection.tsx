"use client";

import { Input } from "@nextui-org/react";
import React from "react";
import { useEditor } from "../EditorContext";

export default function SocialLinksSection() {
  const {
    user,
    setUser,
    handleSocialProfileChange,
  } = useEditor();

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
          </div>
  );
}
