"use client";

import { Button, Input, Textarea } from "@nextui-org/react";
import React from "react";
import { MonthYearPicker } from "../DatePicker";
import { useEditor } from "../EditorContext";
import RemoveButton from "../RemoveButton";

export default function VolunteerSection() {
  const {
    user,
    setUser,
    handleInputChange,
    deleteItemByIndex,
    addVolunteer,
  } = useEditor();

  return (
          <div
            id="volunteer"
            className="scroll-mt-20 flex flex-col pt-11 justify-center items-start gap-4"
          >
            <h2 className="font-fraunces text-2xl font-medium tracking-tight text-ink mb-5">
              Volunteer Work
            </h2>
            {user.volunteer &&
              user.volunteer.length > 0 &&
              user.volunteer.map((work, index) => (
                <div
                  key={`volunteer-${index}`}
                  className="flex flex-col w-full gap-4 border border-ink/10 bg-parchment-100/40 rounded-2xl p-5"
                >
                  <div className="w-full flex justify-end">
                    <RemoveButton onClick={() =>
                        deleteItemByIndex("volunteer", index, setUser)} label={`Delete volunteer work ${index}`} />
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-.05">Organization</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={work.organization}
                      placeholder="Organization name"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "volunteer",
                          index,
                          "organization",
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
                    <p className="pt-.05">Position</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={work.position}
                      placeholder="Your role"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "volunteer",
                          index,
                          "position",
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
                    <p className="pt-.05">URL</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={work.url}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "volunteer",
                          index,
                          "url",
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
                    <p className="pt-.05">Start Date</p>
                    <div className="max-w-xs w-full text-ink-soft">
                      <MonthYearPicker
                        value={work.startDate}
                        onChange={(value) =>
                          handleInputChange(
                            "volunteer",
                            index,
                            "startDate",
                            value,
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-.05">Summary</p>
                    <Textarea
                      variant="bordered"
                      value={work.summary}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "volunteer",
                          index,
                          "summary",
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
              onPress={addVolunteer}
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
              Add Volunteer Work
            </Button>
          </div>
  );
}
