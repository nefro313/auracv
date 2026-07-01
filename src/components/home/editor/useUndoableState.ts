"use client";

import { useCallback, useRef, useState } from "react";

/**
 * useUndoableState — drop-in replacement for `useState` that records history so
 * edits can be undone / redone (Cmd/Ctrl+Z).
 *
 * Two details matter for this editor:
 *  - Some editor handlers mutate the previous object **in place** (e.g.
 *    `current[key][subKey] = value`). So every update is applied against a deep
 *    clone of the present — the snapshot pushed to `past` is the untouched
 *    previous value and can never be corrupted by a later edit.
 *  - Rapid successive edits within `COALESCE_MS` (typing) collapse into a single
 *    undo step, so Cmd+Z reverts a word/field rather than one keystroke, while a
 *    deliberate action like deleting a section stays its own step.
 */

type Updater<T> = T | ((prev: T) => T);

interface History<T> {
  past: T[];
  present: T;
  future: T[];
}

const HISTORY_LIMIT = 100;
const COALESCE_MS = 450;

// UserProfile is plain JSON — structuredClone where available, JSON otherwise.
const clone = <T>(value: T): T =>
  typeof structuredClone === "function"
    ? structuredClone(value)
    : (JSON.parse(JSON.stringify(value)) as T);

export interface UndoableState<T> {
  state: T;
  /** Compatible with React.Dispatch<SetStateAction<T>>. Records history. */
  setState: (updater: Updater<T>) => void;
  /** Replace the value AND clear history — use when a new baseline loads/saves. */
  reset: (value: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useUndoableState<T>(initial: T): UndoableState<T> {
  const [history, setHistory] = useState<History<T>>({
    past: [],
    present: initial,
    future: [],
  });
  const lastChangeAt = useRef(0);

  const setState = useCallback((updater: Updater<T>) => {
    const now = Date.now();
    const coalesce = now - lastChangeAt.current < COALESCE_MS;
    lastChangeAt.current = now;

    setHistory((cur) => {
      // Apply against a clone so in-place mutations never touch `cur.present`,
      // which we keep as the pristine snapshot for undo.
      const base = clone(cur.present);
      const next =
        typeof updater === "function"
          ? (updater as (prev: T) => T)(base)
          : updater;

      // Ignore no-op updates so they don't create empty undo steps.
      if (JSON.stringify(next) === JSON.stringify(cur.present)) return cur;

      if (coalesce) {
        return { past: cur.past, present: next, future: [] };
      }
      return {
        past: [...cur.past, cur.present].slice(-HISTORY_LIMIT),
        present: next,
        future: [],
      };
    });
  }, []);

  const reset = useCallback((value: T) => {
    lastChangeAt.current = 0;
    setHistory({ past: [], present: clone(value), future: [] });
  }, []);

  const undo = useCallback(() => {
    lastChangeAt.current = 0; // discrete action — don't coalesce the next edit
    setHistory((cur) => {
      if (cur.past.length === 0) return cur;
      const previous = cur.past[cur.past.length - 1];
      return {
        past: cur.past.slice(0, -1),
        present: previous,
        future: [cur.present, ...cur.future].slice(0, HISTORY_LIMIT),
      };
    });
  }, []);

  const redo = useCallback(() => {
    lastChangeAt.current = 0;
    setHistory((cur) => {
      if (cur.future.length === 0) return cur;
      const next = cur.future[0];
      return {
        past: [...cur.past, cur.present].slice(-HISTORY_LIMIT),
        present: next,
        future: cur.future.slice(1),
      };
    });
  }, []);

  return {
    state: history.present,
    setState,
    reset,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
