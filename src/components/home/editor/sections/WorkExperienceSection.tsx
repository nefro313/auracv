"use client";

import { Button, Input, Textarea } from "@nextui-org/react";
import React from "react";
import { ACCEPTED_IMAGE_INPUT } from "../constants";
import { useEditor } from "../EditorContext";

export default function WorkExperienceSection() {
  const {
    user,
    setUser,
    uploadStatus,
    handleInputChange,
    handleFileUpload,
    deleteItemByIndex,
    addWork,
  } = useEditor();

  return (
          <div
            id="work-experience"
            className="flex min-h-screen flex-col pt-11 justify-center items-start gap-4"
          >
            <h2 className="font-fraunces text-2xl font-medium tracking-tight text-ink mb-5">
              Work Experience
            </h2>
            {user.work &&
              user.work.length > 0 &&
              user.work.map((experience, index) => (
                <div
                  key={`work-${index}`}
                  className="flex flex-col w-full gap-4 border border-ink/10 bg-parchment-100/40 rounded-2xl p-5"
                >
                  {" "}
                  <div className="w-full flex justify-end">
                    <button
                      onClick={() => deleteItemByIndex("work", index, setUser)}
                      aria-label={`Delete workExperience ${index}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-6 text-red-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-0.05">Company Logo</p>
                    <div className="flex max-w-xs w-full justify-start gap-2 items-center flex-row flex-wrap">
                      {experience.logo ? (
                        <img
                          src={experience.logo}
                          alt="Company Logo"
                          className="w-12 h-12 sm:h-12 sm:w-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-parchment-200 rounded-xl">
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
                              d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
                            />
                          </svg>
                        </div>
                      )}
                      <label className=" flex flex-row gap-2 text-ink-mute cursor-pointer shadow-xs justify-center items-center  flex-1 px-3 h-12 rounded-xl border-dashed border border-ink/25 bg-parchment-100/50 hover:border-aura-violet/50 hover:bg-white hover:text-ink transition-colors">
                        <input
                          onChange={(event) => {
                            if (event.target.files) {
                              handleFileUpload(
                                event.target.files[0],
                                "workExperienceLogo",
                                index,
                              );
                            }
                          }}
                          type="file"
                          accept={ACCEPTED_IMAGE_INPUT}
                          className="  w-full hidden  font-body font-light text-ink/80 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-parchment-300 file:text-ink-soft hover:file:bg-ink-mute"

                          // {...getInputProps()}
                        />
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
                        {uploadStatus[`workExperienceLogo-${index}`] ===
                          "idle" && "Click to upload "}
                        {uploadStatus[`workExperienceLogo-${index}`] ===
                          "uploading" && "Uploading..."}
                        {uploadStatus[`workExperienceLogo-${index}`] ===
                          "uploaded" && "Logo  uploaded"}
                        {!uploadStatus[`workExperienceLogo-${index}`] &&
                          "Click to upload "}
                      </label>
                    </div>
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-0.05">Company Name</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={experience.name}
                      className="max-w-xs text-ink-soft"
                      classNames={{
                        inputWrapper:
                          "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("work", index, "name", e.target.value)
                      }
                      placeholder="Company name"
                    />
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-0.05">Role</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={experience.position}
                      className="max-w-xs text-ink-soft"
                      classNames={{
                        inputWrapper:
                          "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "work",
                          index,
                          "position",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-0.05">Period </p>
                    <div className="max-w-xs flex gap-2 text-ink-soft">
                      {" "}
                      <Input
                        classNames={{
                          inputWrapper:
                            "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                        }}
                        placeholder="Start eg: April 2020"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleInputChange(
                            "work",
                            index,
                            "startDate",
                            e.target.value,
                          )
                        }
                        value={experience.startDate}
                        variant="bordered"
                        className="max-w-xs text-ink-soft"
                        // value={[experience.start, experience.end]}
                      />
                      <Input
                        classNames={{
                          inputWrapper:
                            "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                        }}
                        placeholder="end"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleInputChange(
                            "work",
                            index,
                            "endDate",
                            e.target.value,
                          )
                        }
                        value={experience.endDate}
                        variant="bordered"
                        className="max-w-xs text-ink-soft"
                        // value={[experience.start, experience.end]}
                      />
                    </div>
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-.05">Summary</p>
                    <Textarea
                      variant="bordered"
                      labelPlacement="outside"
                      placeholder="Enter your description"
                      value={experience.summary}
                      className="max-w-xs text-ink-soft"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "work",
                          index,
                          "summary",
                          e.target.value,
                        )
                      }
                      classNames={{
                        inputWrapper:
                          "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                    />
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-0.05">Company Link</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={experience.website}
                      className="max-w-xs text-ink-soft"
                      classNames={{
                        inputWrapper:
                          "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "work",
                          index,
                          "website",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            <Button
              variant="bordered"
              onPress={addWork}
              className="border border-dashed border-ink/25 bg-none rounded-full flex justify-center items-center gap-1 text-sm font-semibold text-ink-soft hover:border-aura-violet/50 hover:text-ink transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-5 text-ink-soft"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Add Experience
            </Button>
          </div>
  );
}
