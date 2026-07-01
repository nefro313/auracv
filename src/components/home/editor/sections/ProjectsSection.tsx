"use client";

import { Button, Chip, Input, Kbd, Textarea } from "@nextui-org/react";
import React, { KeyboardEvent } from "react";
import { externalHref } from "@/lib/utils";
import { ACCEPTED_IMAGE_INPUT } from "../constants";
import { MonthRangePicker, splitRange, joinRange } from "../DatePicker";
import { useEditor } from "../EditorContext";
import HighlightsField from "../HighlightsField";
import RemoveButton from "../RemoveButton";
import RemovePhotoButton from "../RemovePhotoButton";

export default function ProjectsSection() {
  const {
    user,
    setUser,
    uploadStatus,
    inputValueProject,
    setInputValueProject,
    handleInputChange,
    handleFileUpload,
    handleRemovePhoto,
    deleteItemByIndex,
    handleTechnologyClose,
    handleTechnologyInputKeyDown,
    addProjects,
  } = useEditor();

  return (
          <div
            id="project"
            className="scroll-mt-20 flex flex-col pt-11 justify-center items-start gap-4"
          >
            <h2 className="font-fraunces text-2xl font-medium tracking-tight text-ink mb-5">
              Projects
            </h2>
            <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
              <p className="pt-0.5">Project description</p>
              <Textarea
                type="text"
                variant="bordered"
                value={user.projects.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange(
                    "projects.description",
                    -1,
                    "",
                    e.target.value,
                  )
                }
                name="projects.description"
                className="max-w-xs text-ink-soft"
                classNames={{
                  inputWrapper:
                    "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                }}
              />
            </div>
            {user.projects &&
              user.projects.projects.length > 0 &&
              user.projects.projects.map((project, index) => (
                <div
                  key={`project-${index}`}
                  className="flex flex-col w-full gap-4 border border-ink/10 bg-parchment-100/40 rounded-2xl p-5"
                >
                  {" "}
                  <div className="w-full flex justify-end">
                    <RemoveButton onClick={() =>
                        deleteItemByIndex("projects.projects", index, setUser)} label={`Delete projects ${index}`} />
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-0.05">Project Image</p>
                    <div className="flex max-w-xs w-full justify-start gap-2 items-center flex-row flex-wrap">
                      {project.image ? (
                        <div className="relative h-12 w-12 group/photo">
                          <img
                            src={project.image}
                            alt="Project Image"
                            className="w-12 h-12 sm:h-12 sm:w-12 rounded-xl object-cover"
                          />
                          <RemovePhotoButton
                            onClick={() =>
                              handleRemovePhoto("projectImage", index)
                            }
                            label="Remove project image"
                          />
                        </div>
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

                      <label className="flex flex-row gap-2 text-ink-mute cursor-pointer shadow-xs justify-center items-center flex-1 px-3 h-12 rounded-xl border-dashed border border-ink/25 bg-parchment-100/50 hover:border-aura-violet/50 hover:bg-white hover:text-ink transition-colors">
                        <input
                          onChange={(event) => {
                            if (event.target.files) {
                              handleFileUpload(
                                event.target.files[0],
                                "projectImage",
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
                        {uploadStatus[`projectImage-${index}`] === "idle" &&
                          "Click to upload "}
                        {uploadStatus[`projectImage-${index}`] ===
                          "uploading" && "Uploading..."}
                        {uploadStatus[`projectImage-${index}`] === "uploaded" &&
                          "Logo  uploaded"}
                        {!uploadStatus[`projectImage-${index}`] &&
                          "Click to upload "}{" "}
                      </label>
                    </div>
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-.05">Project name</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={project.title}
                      placeholder="Project name"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "projects.projects",
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
                    <p className="pt-.05">Period</p>
                    <div className="max-w-xs w-full text-ink-soft">
                      <MonthRangePicker
                        start={splitRange(project.duration).start}
                        end={splitRange(project.duration).end}
                        onChange={(start, end) =>
                          handleInputChange(
                            "projects.projects",
                            index,
                            "duration",
                            joinRange(start, end),
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-.05">Description</p>
                    <Textarea
                      variant="bordered"
                      labelPlacement="outside"
                      placeholder="Enter your description"
                      value={project.description}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "projects.projects",
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
                    <p className="pt-.05">Stack</p>
                    <div className="flex max-w-xs w-full flex-col justify-start items-start gap-3">
                      <div className="flex w-full gap-2">
                        <Input
                          type="text"
                          labelPlacement="inside"
                          placeholder="Add a technology"
                          description=" Press Enter to add a new technology"
                          variant="bordered"
                          value={inputValueProject}
                          onChange={(event) =>
                            setInputValueProject(event.target.value)
                          }
                          onKeyDown={(event) =>
                            handleTechnologyInputKeyDown(
                              event,
                              index,
                              inputValueProject,
                            )
                          }
                          classNames={{
                            inputWrapper:
                              "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                          }}
                          endContent={
                            <Kbd
                              className="font-dmSans text-xs"
                              keys={["enter"]}
                            >
                              Enter
                            </Kbd>
                          }
                          className="text-xs flex-1"
                        />
                        <Button
                          size="sm"
                          variant="bordered"
                          onPress={() => {
                            if (inputValueProject.trim() !== "") {
                              handleTechnologyInputKeyDown(
                                {
                                  key: "Enter",
                                } as KeyboardEvent<HTMLInputElement>,
                                index,
                                inputValueProject,
                              );
                            }
                          }}
                          className="min-w-[40px] h-[40px] p-0 rounded-full"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5 text-ink-soft"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4.5v15m7.5-7.5h-15"
                            />
                          </svg>
                        </Button>
                      </div>
                      <div className="w-full flex flex-wrap gap-1 max-w-xs">
                        {project.technologies.map((tech, techIndex) => (
                          <Chip
                            key={`tech-${techIndex}`}
                            onClose={() => handleTechnologyClose(index, tech)}
                            variant="flat"
                            classNames={{
                              closeButton: "text-ink-mute z-10",
                              base: "bg-parchment-100",
                            }}
                            className="flex mt-1 mb-1 items-center bg-none text-xs rounded-full border-1 border-ink/10 pl-2"
                          >
                            {tech}
                          </Chip>
                        ))}
                      </div>
                    </div>{" "}
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-.05">Website link</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={project.website}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "projects.projects",
                          index,
                          "website",
                          e.target.value,
                        )
                      }
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "projects.projects",
                          index,
                          "website",
                          externalHref(e.target.value),
                        )
                      }
                      placeholder="https://example.com"
                      className="max-w-xs text-ink-soft"
                      classNames={{
                        inputWrapper:
                          "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                    />
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-.05">Source Link</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={project.source}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "projects.projects",
                          index,
                          "source",
                          e.target.value,
                        )
                      }
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "projects.projects",
                          index,
                          "source",
                          externalHref(e.target.value),
                        )
                      }
                      placeholder="https://github.com/username/repo"
                      className="max-w-xs text-ink-soft"
                      classNames={{
                        inputWrapper:
                          "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                    />
                  </div>
                  <HighlightsField
                    path="projects.projects"
                    index={index}
                    highlights={project.highlights ?? []}
                  />
                </div>
              ))}
            <Button
              variant="bordered"
              onPress={addProjects}
              className="group border border-dashed border-ink/25 bg-none rounded-full flex justify-center items-center gap-1 text-sm font-semibold text-ink-soft transition-all duration-200 ease-out hover:border-aura-violet/60 hover:bg-aura-violet/5 hover:text-ink hover:scale-[1.02] active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-5 text-ink-soft transition-transform duration-200 ease-out group-hover:rotate-90"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Add Project
            </Button>
          </div>
  );
}
