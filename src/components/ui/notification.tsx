"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type NotificationVariant = "success" | "error" | "warning" | "info";

export type NotificationInput = {
  variant?: NotificationVariant;
  title: string;
  description?: React.ReactNode;
  /** Auto-dismiss after this many ms. Pass 0 to keep it until dismissed. */
  duration?: number;
};

type NotificationItem = Required<Omit<NotificationInput, "description">> & {
  id: number;
  description?: React.ReactNode;
};

const variantStyles: Record<
  NotificationVariant,
  { ring: string; iconWrap: string; icon: React.ReactNode }
> = {
  success: {
    ring: "ring-emerald-200",
    iconWrap: "bg-emerald-50 text-emerald-600",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    ),
  },
  error: {
    ring: "ring-red-200",
    iconWrap: "bg-red-50 text-red-500",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
      />
    ),
  },
  warning: {
    ring: "ring-amber-200",
    iconWrap: "bg-amber-50 text-amber-600",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
      />
    ),
  },
  info: {
    ring: "ring-aura-violet/30",
    iconWrap: "bg-aura-violet/10 text-aura-violet",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
      />
    ),
  },
};

/**
 * Self-contained, top-center notification stack with framer-motion animation.
 * Returns a `notify` dispatcher and the `viewport` element to render once.
 */
// Most notifications kept on screen at once; older ones are dropped so the
// stack never overflows the viewport.
const MAX_VISIBLE = 4;

export function useNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const notify = useCallback(
    ({ variant = "info", title, description, duration = 4000 }: NotificationInput) => {
      const id =
        typeof performance !== "undefined"
          ? performance.now()
          : Date.now() + Math.random();
      // Newest first so it appears at the top of the stack; cap the count.
      setItems((prev) =>
        [{ id, variant, title, description, duration }, ...prev].slice(
          0,
          MAX_VISIBLE,
        ),
      );
      if (duration > 0) {
        timers.current[id] = setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss],
  );

  const viewport = (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[200] flex flex-col items-center gap-2 px-4">
      <AnimatePresence initial={false}>
        {items.map((item) => {
          const style = variantStyles[item.variant];
          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: -28, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className={cn(
                "pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-ink/10 bg-white/95 p-4 shadow-lg ring-1 backdrop-blur",
                style.ring,
              )}
              role="alert"
            >
              <span
                className={cn(
                  "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                  style.iconWrap,
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="size-5"
                >
                  {style.icon}
                </svg>
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="font-outfit text-sm font-semibold text-ink">
                  {item.title}
                </p>
                {item.description && (
                  <div className="mt-0.5 font-dmSans text-xs text-ink-soft">
                    {item.description}
                  </div>
                )}
              </div>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismiss(item.id)}
                className="-mr-1 -mt-1 rounded-full p-1 text-ink-mute transition-colors hover:bg-parchment-200 hover:text-ink"
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
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );

  return { notify, dismiss, viewport };
}
