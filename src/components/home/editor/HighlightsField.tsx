"use client";

import { Button, Textarea } from "@nextui-org/react";
import React from "react";
import { useEditor } from "./EditorContext";

/**
 * Editor for the `highlights` string[] shared by work entries and projects —
 * the bullet points the resume/portfolio render. Each highlight is its own
 * editable row with a remove button, plus an "Add highlight" button.
 */
export default function HighlightsField({
  path,
  index,
  highlights,
}: {
  path: "work" | "projects.projects";
  index: number;
  highlights: string[];
}) {
  const { handleHighlightChange, addHighlight, removeHighlight } = useEditor();

  return (
    <div className="flex sm:flex-row flex-col gap-2 sm:gap-0 w-full justify-between text-sm items-start">
      <p className="pt-0.5">Highlights</p>
      <div className="flex max-w-xs w-full flex-col gap-2">
        {highlights.length === 0 && (
          <p className="text-xs text-ink-mute">
            Bullet points that stand out — impact, achievements, metrics.
          </p>
        )}

        {highlights.map((highlight, highlightIndex) => (
          <Textarea
            key={`highlight-${highlightIndex}`}
            minRows={1}
            variant="bordered"
            placeholder="Add a highlight"
            value={highlight}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleHighlightChange(path, index, highlightIndex, e.target.value)
            }
            className="w-full text-ink-soft"
            classNames={{
              input: "pr-6",
              inputWrapper:
                "items-start border-1 border-ink/15 bg-white shadow-none data-[hover=true]:border-ink/30 group-data-[focus=true]:border-aura-violet",
            }}
            endContent={
              <button
                type="button"
                aria-label={`Remove highlight ${highlightIndex + 1}`}
                onClick={() => removeHighlight(path, index, highlightIndex)}
                className="-mr-1 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-ink-mute transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            }
          />
        ))}

        <Button
          size="sm"
          variant="bordered"
          onPress={() => addHighlight(path, index)}
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
          Add highlight
        </Button>
      </div>
    </div>
  );
}
