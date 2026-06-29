"use client";

import { Button, Input } from "@nextui-org/react";
import React from "react";
import { ACCEPTED_IMAGE_INPUT } from "../constants";
import { MonthRangePicker } from "../DatePicker";
import { useEditor } from "../EditorContext";
import RemoveButton from "../RemoveButton";

export default function EducationSection() {
  const {
    user,
    setUser,
    uploadStatus,
    handleInputChange,
    handleFileUpload,
    deleteItemByIndex,
    addEducation,
  } = useEditor();

  return (
          <div
            id="education"
            className="scroll-mt-20 flex flex-col  pt-11 justify-center items-start gap-4"
          >
            <h2 className="font-fraunces text-2xl font-medium tracking-tight text-ink mb-5">
              Education
            </h2>
            {user.education &&
              user.education.length > 0 &&
              user.education.map((edu, index) => (
                <div
                  key={`education-${index}`}
                  className="flex flex-col w-full gap-4 border border-ink/10 bg-parchment-100/40 rounded-2xl p-5"
                >
                  {" "}
                  <div className="w-full flex justify-end">
                    <RemoveButton onClick={() =>
                        deleteItemByIndex("education", index, setUser)} label={`Delete education ${index}`} />
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-.05">College Logo</p>
                    <div className="flex max-w-xs w-full justify-start gap-2 items-center flex-row flex-wrap">
                      {edu.logo ? (
                        <img
                          src={edu.logo}
                          alt="College Logo"
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
                              d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
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
                                "educationLogo",
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
                        {uploadStatus[`educationLogo-${index}`] === "idle" &&
                          "Click to upload "}
                        {uploadStatus[`educationLogo-${index}`] ===
                          "uploading" && "Uploading..."}
                        {uploadStatus[`educationLogo-${index}`] ===
                          "uploaded" && "Logo  uploaded"}
                        {!uploadStatus[`educationLogo-${index}`] &&
                          "Click to upload "}{" "}
                      </label>
                    </div>
                  </div>{" "}
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-.05">College Name</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={edu.institution}
                      placeholder="School / University"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "education",
                          index,
                          "institution",
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
                    <p className="pt-.05">Field of Study</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={edu.area}
                      placeholder="Field of study"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "education",
                          index,
                          "area",
                          e.target.value,
                        )
                      }
                      className="max-w-xs text-ink-soft"
                      classNames={{
                        inputWrapper:
                          "border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
                      }}
                    />
                  </div>{" "}
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-.05">Period</p>
                    <div className="max-w-xs w-full text-ink-soft">
                      <MonthRangePicker
                        start={edu.startDate}
                        end={edu.endDate}
                        onChange={(start, end) => {
                          handleInputChange(
                            "education",
                            index,
                            "startDate",
                            start,
                          );
                          handleInputChange("education", index, "endDate", end);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            <Button
              variant="bordered"
              onPress={addEducation}
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
              Add Education
            </Button>
          </div>
  );
}
