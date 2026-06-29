"use client";

import { Button, Input, Textarea } from "@nextui-org/react";
import React from "react";
import { ACCEPTED_IMAGE_INPUT } from "../constants";
import { useEditor } from "../EditorContext";

export default function HackathonsSection() {
  const {
    user,
    setUser,
    uploadStatus,
    handleInputChange,
    handleFileUpload,
    deleteItemByIndex,
    addHackathons,
  } = useEditor();

  return (
          <div
            id="hackathon"
            className="flex flex-col pt-11 justify-center items-start gap-4"
          >
            <h2 className="font-fraunces text-2xl font-medium tracking-tight text-ink mb-5">
              Hackathons
            </h2>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-0.5">Hackathon Description</p>
              <Textarea
                type="text"
                variant="bordered"
                value={user.hackathons.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange(
                    "hackathons.description",
                    -1,
                    "",
                    e.target.value,
                  )
                }
                className="max-w-xs text-ink-soft"
                classNames={{
                  inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                }}
              />
            </div>
            {user.hackathons &&
              user.hackathons.hackathons.length > 0 &&
              user.hackathons.hackathons.map((hackathon, index) => (
                <div
                  key={`hackathon-${index}`}
                  className="flex flex-col w-full gap-4 border border-ink/10 bg-parchment-100/40 rounded-2xl p-5"
                >
                  <div className="w-full flex justify-end">
                    <button
                      onClick={() =>
                        deleteItemByIndex(
                          "hackathons.hackathons",
                          index,
                          setUser,
                        )
                      }
                      aria-label={`Delete hackathon ${index}`}
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
                    <p className="pt-0.5">Hackathon logo</p>
                    <div className="flex max-w-xs w-full justify-start gap-2 items-center flex-row flex-wrap">
                      {hackathon.image ? (
                        <img
                          src={hackathon.image}
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
                              d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                            />
                          </svg>
                        </div>
                      )}{" "}
                      <label className="flex flex-row gap-2 text-ink-mute cursor-pointer shadow-xs justify-center items-center flex-1 px-3 h-12 rounded-xl border-dashed border border-ink/25 bg-parchment-100/50 hover:border-aura-violet/50 hover:bg-white hover:text-ink transition-colors">
                        <input
                          onChange={(event) => {
                            event.preventDefault();

                            if (event.target.files) {
                              handleFileUpload(
                                event.target.files[0],
                                "hackathonLogo",
                                index,
                              );
                            }
                          }}
                          type="file"
                          accept={ACCEPTED_IMAGE_INPUT}
                          className="  w-full hidden  font-body font-light text-ink/80 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-parchment-300 file:text-ink-soft hover:file:bg-ink-mute"
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
                        {uploadStatus[`hackathonLogo-${index}`] === "idle" &&
                          "Click to upload "}
                        {uploadStatus[`hackathonLogo-${index}`] ===
                          "uploading" && "Uploading..."}
                        {uploadStatus[`hackathonLogo-${index}`] ===
                          "uploaded" && "Logo  uploaded"}
                        {!uploadStatus[`hackathonLogo-${index}`] &&
                          "Click to upload "}{" "}
                        <input
                          type="file"
                          accept={ACCEPTED_IMAGE_INPUT}
                          className="w-full hidden font-body font-light text-ink/80 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-parchment-300 file:text-ink-soft hover:file:bg-ink-mute"
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-0.5">Hackathon name</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={hackathon.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "hackathons.hackathons",
                          index,
                          "title",
                          e.target.value,
                        )
                      }
                      className="max-w-xs text-ink-soft"
                      classNames={{
                        inputWrapper:
                          "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                    />
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-0.5">Location</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={hackathon.location}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "hackathons.hackathons",
                          index,
                          "location",
                          e.target.value,
                        )
                      }
                      className="max-w-xs text-ink-soft"
                      classNames={{
                        inputWrapper:
                          "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                    />
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-0.5">Date</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={hackathon.dates}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "hackathons.hackathons",
                          index,
                          "dates",
                          e.target.value,
                        )
                      }
                      className="max-w-xs text-ink-soft"
                      classNames={{
                        inputWrapper:
                          "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                    />
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-0.5">Description</p>
                    <Textarea
                      variant="bordered"
                      labelPlacement="outside"
                      placeholder="Enter your description"
                      value={hackathon.description}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "hackathons.hackathons",
                          index,
                          "description",
                          e.target.value,
                        )
                      }
                      className="max-w-xs text-ink-soft"
                      classNames={{
                        inputWrapper:
                          "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                    />
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-0.5">Website link</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={hackathon.url}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "hackathons.hackathons",
                          index,
                          "links.website",
                          e.target.value,
                        )
                      }
                      className="max-w-xs text-ink-soft"
                      classNames={{
                        inputWrapper:
                          "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                    />
                  </div>
                </div>
              ))}
            <Button
              variant="bordered"
              onPress={addHackathons}
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
              Add Hackathon
            </Button>
          </div>
  );
}
