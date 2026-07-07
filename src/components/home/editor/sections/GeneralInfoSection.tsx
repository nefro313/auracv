"use client";

import { Chip, Input, Kbd, Spinner, Switch, Textarea } from "@nextui-org/react";
import { ChangeEvent } from "react";
import { UserMetaData } from "@/lib/type";
import { cn, tailwindColors } from "@/lib/utils";
import { ACCEPTED_IMAGE_INPUT } from "../constants";
import { useEditor } from "../EditorContext";

export default function GeneralInfoSection() {
  const {
    user,
    setUser,
    setUserMetaData,
    uploadStatus,
    inputValue,
    slugError,
    setSlugError,
    fieldErrors,
    setFieldErrors,
    isChecking,
    isAvailable,
    setIsAvailable,
    errorMessage,
    handleBlur,
    handleInputChange,
    handleFileUpload,
    handleRemoveProfilePhoto,
    handleSkillClose,
    handleSkillInputChange,
    handleSkillInputKeyDown,
    markAsEdited,
  } = useEditor();

  // A required field is flagged red until the user starts typing into it.
  const clearFieldError = (key: string) =>
    setFieldErrors((prev) => (prev[key] ? { ...prev, [key]: false } : prev));

  // Shared inputWrapper classes; when a required field is missing we override
  // the border/background to red so it's clear which field needs filling.
  const wrapperClass = (key: string) =>
    cn(
      "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
      fieldErrors[key] &&
        "!border-red-500 !bg-red-50 data-[hover=true]:!border-red-500 group-data-[focus=true]:!border-red-500",
    );

  return (
          <div
            id="general-info"
            className="scroll-mt-20 flex flex-col pt-6 sm:pt-11 justify-center items-start gap-4"
          >
            <h2 className="font-fraunces text-2xl font-medium tracking-tight text-ink mb-5">
              General Info
            </h2>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-.05">Profile Photo</p>
              <div className="flex max-w-xs w-full justify-start  gap-2 items-center flex-row flex-wrap">
                {user.meta.avatarUrl ? (
                  <div className="relative w-12 h-12 sm:h-12 sm:w-12 group/photo">
                    <img
                      src={user.meta.avatarUrl}
                      className="w-12 h-12 sm:h-12 sm:w-12 rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveProfilePhoto}
                      aria-label="Remove profile photo"
                      className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full bg-white border border-ink/15 text-red-400 shadow-sm hover:bg-red-50 hover:border-red-300 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="size-3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
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
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                      />
                    </svg>
                  </div>
                )}

                <label className=" flex flex-row gap-2 text-ink-mute cursor-pointer shadow-xs justify-center items-center  flex-1 px-3 h-12 rounded-xl border-dashed border border-ink/25 bg-parchment-100/50 hover:border-aura-violet/50 hover:bg-white hover:text-ink transition-colors">
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
                  {uploadStatus["profilePhoto-0"] === "idle" &&
                    "Upload profile image"}
                  {uploadStatus["profilePhoto-0"] === "uploading" &&
                    "Uploading..."}
                  {uploadStatus["profilePhoto-0"] === "uploaded" &&
                    "Profile image uploaded"}
                  <input
                    onChange={(event) => {
                      // setIsError(false);
                      if (event.target.files) {
                        handleFileUpload(
                          event.target.files[0],
                          "profilePhoto",
                          0,
                        );
                      }
                    }}
                    type="file"
                    accept={ACCEPTED_IMAGE_INPUT}
                    className="  w-full hidden  font-body font-light text-ink/80 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-parchment-300 file:text-ink-soft hover:file:bg-ink-mute"
                  />
                </label>
              </div>
            </div>{" "}
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-.05">Full Name</p>
              <Input
                type="text"
                variant="bordered"
                placeholder="e.g. Ada Lovelace"
                value={user.basics.name}
                onChange={(e) => {
                  clearFieldError("basics.name");
                  handleInputChange("basics.name", -1, "", e.target.value);
                }}
                name="basics.name"
                isInvalid={!!fieldErrors["basics.name"]}
                errorMessage="Full name is required"
                className="max-w-xs text-ink-soft"
                classNames={{
                  inputWrapper: wrapperClass("basics.name"),
                  errorMessage: "!text-red-600 font-medium",
                }}
              />
            </div>{" "}
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-.05">Username</p>
              <Input
                type="text"
                variant="bordered"
                value={user.meta.userName}
                placeholder="yourname"
                onChange={(e) => {
                  // Clear any stale availability state while the user edits.
                  setSlugError(false);
                  clearFieldError("meta.userName");
                  setIsAvailable(false);
                  setUserMetaData((prevUserMetaData: UserMetaData) => ({
                    ...prevUserMetaData,
                    userName: e.target.value.toLowerCase().replace(/\s+/g, ""),
                  }));
                  handleInputChange(
                    "meta.userName",
                    -1,
                    "",
                    e.target.value.toLowerCase().replace(/\s+/g, ""),
                  );
                }}
                name="userName"
                isInvalid={slugError || !!fieldErrors["meta.userName"]}
                errorMessage={
                  slugError ? errorMessage : "User name is required"
                }
                onBlur={handleBlur}
                className="max-w-xs flex  text-ink-soft"
                classNames={{
                  inputWrapper: cn(
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                    (slugError || fieldErrors["meta.userName"]) &&
                      "!border-red-500 !bg-red-50 data-[hover=true]:!border-red-500 group-data-[focus=true]:!border-red-500",
                  ),
                  errorMessage: "!text-red-600 font-medium",
                }}
                endContent={
                  <div className="pointer-events-none pl-2 w-full  gap-7 flex items-between">
                    <span className="text-default-600 font-semibold text-sm">
                      .auracv.me
                    </span>
                    {isChecking ? (
                      <Spinner size="sm" color="default" className="size-6" />
                    ) : (
                      isAvailable && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-6 text-aura-cyan"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      )
                    )}
                  </div>
                }
                pattern="[^ ]+" // Pattern to disallow spaces
                title="Spaces are not allowed" // Title to show when invalid
              />
            </div>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-.05">Your Role</p>
              <Input
                type="text"
                variant="bordered"
                placeholder="e.g. Product Designer"
                value={user.basics.label}
                onChange={(e) => {
                  clearFieldError("basics.label");
                  handleInputChange("basics.label", -1, "", e.target.value);
                }}
                name="role"
                isInvalid={!!fieldErrors["basics.label"]}
                errorMessage="Your role is required"
                className="max-w-xs text-ink-soft"
                classNames={{
                  inputWrapper: wrapperClass("basics.label"),
                  errorMessage: "!text-red-600 font-medium",
                }}
              />
            </div>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-.05">Availability</p>
              <div className="flex max-w-xs w-full items-center justify-between gap-3 rounded-medium border-1 border-ink/15 bg-white px-3.5 py-2.5">
                <span className="text-ink-soft">
                  {user.basics.openToWork
                    ? "Open to work — shown on your portfolio"
                    : "Open to work"}
                </span>
                <Switch
                  size="sm"
                  aria-label="Open to work"
                  isSelected={!!user.basics.openToWork}
                  onValueChange={(val) => {
                    markAsEdited();
                    setUser((prev) => ({
                      ...prev,
                      basics: { ...prev.basics, openToWork: val },
                    }));
                  }}
                  classNames={{
                    wrapper: "group-data-[selected=true]:bg-aura-violet",
                  }}
                />
              </div>
            </div>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-.05">About</p>
              <Textarea
                variant="bordered"
                labelPlacement="outside"
                placeholder="Enter your description"
                value={user.basics.about}
                onChange={(e) =>
                  handleInputChange("basics.about", -1, "", e.target.value)
                }
                name="about"
                className="max-w-xs text-ink-soft"
                classNames={{
                  inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                }}
              />
            </div>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-.05">Skills</p>
              <div className="flex max-w-xs w-full flex-col justify-start items-start gap-3">
                <Input
                  type="text"
                  labelPlacement="inside"
                  placeholder="Add your skills"
                  description=" Press Enter to add a new skill"
                  variant="bordered"
                  value={inputValue}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleSkillInputChange(e)
                  }
                  onKeyDown={(event) =>
                    handleSkillInputKeyDown(event, inputValue)
                  }
                  classNames={{
                    inputWrapper:
                      "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                  }}
                  endContent={
                    <Kbd className="font-dmSans text-xs" keys={["enter"]}>
                      Enter
                    </Kbd>
                  }
                  className=" text-xs max-w-xs flex-wrap"
                />
                <div className="w-full  flex flex-wrap gap-1 max-w-xs">
                  {user.basics.skills?.map((skill: string, index: number) => (
                    <Chip
                      key={index}
                      onClose={() => handleSkillClose(skill, skill)}
                      variant="flat"
                      classNames={{
                        closeButton: "text-ink-mute z-10",
                        base: "bg-parchment-100",
                      }}
                      className="flex mt-1 mb-1  items-center bg-none text-xs rounded-full border-1 border-ink/10 pl-2 "
                    >
                      {skill}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-.05">Contact Mail</p>
              <Input
                type="email"
                variant="bordered"
                placeholder="you@example.com"
                value={user.basics.email}
                onChange={(e) => {
                  clearFieldError("basics.email");
                  handleInputChange("basics.email", -1, "", e.target.value);
                }}
                name="email"
                isInvalid={!!fieldErrors["basics.email"]}
                errorMessage="Contact email is required"
                className="max-w-xs text-ink-soft"
                classNames={{
                  inputWrapper: wrapperClass("basics.email"),
                  errorMessage: "!text-red-600 font-medium",
                }}
              />
            </div>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-.05">Location</p>
              <div className="flex gap-2 max-w-xs w-full">
                <Input
                  type="text"
                  variant="bordered"
                  value={user.basics.location.city}
                  onChange={(e) =>
                    handleInputChange(
                      "basics.location.city",
                      -1,
                      "",
                      e.target.value,
                    )
                  }
                  placeholder="City"
                  className="flex-1 text-ink-soft"
                  classNames={{
                    inputWrapper:
                      "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                  }}
                />
                <Input
                  type="text"
                  variant="bordered"
                  value={user.basics.location.countryCode}
                  onChange={(e) =>
                    handleInputChange(
                      "basics.location.countryCode",
                      -1,
                      "",
                      e.target.value,
                    )
                  }
                  placeholder="Country Code"
                  className="w-32 text-ink-soft"
                  classNames={{
                    inputWrapper: "border-1 shadow-none h-11",
                  }}
                />
              </div>
            </div>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-.05">Button Text</p>
              <Input
                type="text"
                variant="bordered"
                value={user.meta.buttonText}
                onChange={(e) =>
                  handleInputChange("meta.buttonText", -1, "", e.target.value)
                }
                name="buttonText"
                className="max-w-xs text-ink-soft"
                classNames={{
                  inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                }}
              />
            </div>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-.05">Theme Color</p>
              <div className="flex flex-wrap max-w-xs gap-4">
                {tailwindColors.map((color, index) => (
                  <div
                    key={`color-${index}`}
                    style={{
                      backgroundColor: color.value,
                      border:
                        user.meta.portfolioColor === color.name
                          ? ".1rem solid black"
                          : "",
                    }}
                    className={`w-5 h-5 rounded-full cursor-pointer ${
                      color.name === "white" ? "border border-ink/25" : ""
                    } `}
                    onClick={() =>
                      setUser((prevUser) => ({
                        ...prevUser,
                        meta: {
                          ...prevUser.meta,
                          portfolioColor: color.name,
                        },
                      }))
                    }
                  ></div>
                ))}
              </div>
            </div>
          </div>
  );
}
