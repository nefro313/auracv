"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1970;
const MAX_YEAR = CURRENT_YEAR + 8;

type Parsed = { monthIdx: number | null; year: number | null };

function parseMonthYear(value: string): Parsed {
  const trimmed = (value || "").trim();
  if (!trimmed) return { monthIdx: null, year: null };
  const parts = trimmed.split(/\s+/);
  const monthIdx = MONTHS.findIndex((m) =>
    parts[0]?.toLowerCase().startsWith(m.toLowerCase()),
  );
  const yearNum = parts[1] ? parseInt(parts[1], 10) : NaN;
  return {
    monthIdx: monthIdx >= 0 ? monthIdx : null,
    year: Number.isNaN(yearNum) ? null : yearNum,
  };
}

function formatMonthYear(monthIdx: number, year: number): string {
  return `${MONTHS[monthIdx]} ${year}`;
}

/** Split a combined "Start - End" string into its two halves. */
export function splitRange(value: string): { start: string; end: string } {
  const parts = (value || "").split(/\s+[-–]\s+/);
  return { start: (parts[0] || "").trim(), end: (parts[1] || "").trim() };
}

/** Join start/end back into a single "Start - End" string. */
export function joinRange(start: string, end: string): string {
  if (start && end) return `${start} - ${end}`;
  return (start || end || "").trim();
}

const triggerClass =
  "max-w-xs w-full flex h-10 items-center justify-between gap-2 rounded-medium border-1 border-ink/15 bg-white px-3 text-sm shadow-none transition-colors hover:border-ink/30 focus:outline-none data-[open=true]:border-aura-violet";

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-4 shrink-0 text-ink-mute"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
      />
    </svg>
  );
}

/** Year stepper + 12-month grid used inside the picker popovers. */
function MonthGrid({
  selectedMonthIdx,
  selectedYear,
  viewYear,
  onViewYearChange,
  onPick,
}: {
  selectedMonthIdx: number | null;
  selectedYear: number | null;
  viewYear: number;
  onViewYearChange: (year: number) => void;
  onPick: (monthIdx: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous year"
          disabled={viewYear <= MIN_YEAR}
          onClick={() => onViewYearChange(Math.max(MIN_YEAR, viewYear - 1))}
          className="flex size-7 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-parchment-200 disabled:opacity-30"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <span className="font-outfit text-sm font-semibold text-ink">
          {viewYear}
        </span>
        <button
          type="button"
          aria-label="Next year"
          disabled={viewYear >= MAX_YEAR}
          onClick={() => onViewYearChange(Math.min(MAX_YEAR, viewYear + 1))}
          className="flex size-7 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-parchment-200 disabled:opacity-30"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {MONTHS.map((month, idx) => {
          const isSelected =
            selectedMonthIdx === idx && selectedYear === viewYear;
          return (
            <button
              key={month}
              type="button"
              onClick={() => onPick(idx)}
              className={cn(
                "rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                isSelected
                  ? "bg-ink text-parchment-50"
                  : "text-ink-soft hover:bg-parchment-200",
              )}
            >
              {month}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Single month-year picker (e.g. an award date or a volunteer start date). */
export function MonthYearPicker({
  value,
  onChange,
  placeholder = "Select month",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const parsed = parseMonthYear(value);
  const [viewYear, setViewYear] = useState(parsed.year ?? CURRENT_YEAR);

  return (
    <Popover
      placement="bottom-start"
      isOpen={open}
      onOpenChange={(next) => {
        if (next) setViewYear(parseMonthYear(value).year ?? CURRENT_YEAR);
        setOpen(next);
      }}
    >
      <PopoverTrigger>
        <button type="button" className={triggerClass}>
          <span className={cn(value ? "text-ink-soft" : "text-ink-mute")}>
            {value || placeholder}
          </span>
          <CalendarIcon />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 rounded-2xl border border-ink/10 bg-white p-3">
        <MonthGrid
          selectedMonthIdx={parsed.monthIdx}
          selectedYear={parsed.year}
          viewYear={viewYear}
          onViewYearChange={setViewYear}
          onPick={(monthIdx) => {
            onChange(formatMonthYear(monthIdx, viewYear));
            setOpen(false);
          }}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="mt-3 w-full rounded-lg py-1.5 text-xs font-semibold text-ink-mute transition-colors hover:bg-parchment-200 hover:text-ink"
          >
            Clear
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}

/**
 * Month-year range picker producing strings like "Jul 2025 - Present" or
 * "Jan 2024 - Mar 2025". Reports the start and end separately so callers can
 * store them in one combined field or two fields.
 */
export function MonthRangePicker({
  start,
  end,
  onChange,
  startPlaceholder = "Start",
  endPlaceholder = "End",
}: {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  startPlaceholder?: string;
  endPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<"start" | "end">("start");

  const isPresent = end.trim().toLowerCase() === "present";
  const startParsed = parseMonthYear(start);
  const endParsed = parseMonthYear(end);
  const active = side === "start" ? startParsed : endParsed;
  const [viewYear, setViewYear] = useState(
    active.year ?? CURRENT_YEAR,
  );

  const triggerLabel =
    start || end
      ? `${start || startPlaceholder} – ${end || endPlaceholder}`
      : "";

  return (
    <Popover
      placement="bottom-start"
      isOpen={open}
      onOpenChange={(next) => {
        if (next) {
          setSide("start");
          setViewYear(startParsed.year ?? CURRENT_YEAR);
        }
        setOpen(next);
      }}
    >
      <PopoverTrigger>
        <button type="button" className={triggerClass}>
          <span
            className={cn(start || end ? "text-ink-soft" : "text-ink-mute")}
          >
            {triggerLabel || `${startPlaceholder} – ${endPlaceholder}`}
          </span>
          <CalendarIcon />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 rounded-2xl border border-ink/10 bg-white p-3">
        <div className="mb-3 flex gap-1 rounded-full border border-ink/10 bg-parchment-100 p-1">
          {(["start", "end"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSide(s);
                const p = s === "start" ? startParsed : endParsed;
                setViewYear(p.year ?? CURRENT_YEAR);
              }}
              className={cn(
                "flex-1 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                side === s
                  ? "bg-white text-ink shadow-sm"
                  : "text-ink-mute hover:text-ink-soft",
              )}
            >
              {s === "start" ? "From" : "To"}
            </button>
          ))}
        </div>

        {side === "end" && (
          <button
            type="button"
            onClick={() => onChange(start, isPresent ? "" : "Present")}
            className={cn(
              "mb-3 w-full rounded-lg border py-1.5 text-xs font-semibold transition-colors",
              isPresent
                ? "border-aura-violet bg-aura-violet/10 text-aura-violet"
                : "border-ink/15 text-ink-soft hover:border-ink/30 hover:text-ink",
            )}
          >
            {isPresent ? "✓ Present (current)" : "Set to Present"}
          </button>
        )}

        {!(side === "end" && isPresent) && (
          <MonthGrid
            selectedMonthIdx={active.monthIdx}
            selectedYear={active.year}
            viewYear={viewYear}
            onViewYearChange={setViewYear}
            onPick={(monthIdx) => {
              const picked = formatMonthYear(monthIdx, viewYear);
              if (side === "start") {
                onChange(picked, end);
                setSide("end");
                setViewYear(endParsed.year ?? viewYear);
              } else {
                onChange(start, picked);
              }
            }}
          />
        )}

        {(start || end) && (
          <button
            type="button"
            onClick={() => {
              onChange("", "");
              setOpen(false);
            }}
            className="mt-3 w-full rounded-lg py-1.5 text-xs font-semibold text-ink-mute transition-colors hover:bg-parchment-200 hover:text-ink"
          >
            Clear
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
