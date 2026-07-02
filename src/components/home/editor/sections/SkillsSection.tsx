"use client";

import { Button, Input } from "@nextui-org/react";
import React from "react";
import { useEditor } from "../EditorContext";
import RemoveButton from "../RemoveButton";

export default function SkillsSection() {
  const {
    user,
    setUser,
    handleInputChange,
    deleteItemByIndex,
    addSkills,
  } = useEditor();

  return (
          <div
            id="skills"
            className="scroll-mt-20 flex flex-col pt-11 justify-center items-start gap-4"
          >
            <h2 className="font-fraunces text-2xl font-medium tracking-tight text-ink mb-5">
              Skills
            </h2>
            {user.skills &&
              user.skills.length > 0 &&
              user.skills.map((skill, index) => (
                <div
                  key={`skill-${index}`}
                  className="flex flex-col w-full gap-4 border border-ink/10 bg-parchment-100/40 rounded-2xl p-5"
                >
                  <div className="w-full flex justify-end">
                    <RemoveButton onClick={() =>
                        deleteItemByIndex("skills", index, setUser)} label={`Delete skill ${index}`} />
                  </div>
                  <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
                    <p className="pt-.05">Skill Name</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={skill.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "skills",
                          index,
                          "name",
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
                    <p className="pt-.05">Keywords</p>
                    <Input
                      type="text"
                      variant="bordered"
                      value={
                        Array.isArray(skill.keywords)
                          ? skill.keywords.join(", ")
                          : ""
                      }
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(
                          "skills",
                          index,
                          "keywords",
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
              onPress={addSkills}
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
              Add Skill
            </Button>
          </div>
  );
}
