"use client";

/**
 * Small overlay "remove" (×) button that sits on the corner of an uploaded
 * photo/logo thumbnail. This is the same control General Info uses on the
 * profile photo, factored out so every image upload area can reuse it.
 * Render it inside a `relative` wrapper around the <img>.
 */
export default function RemovePhotoButton({
  onClick,
  label = "Remove photo",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full bg-white border border-ink/15 text-red-400 shadow-sm hover:bg-red-50 hover:border-red-300 transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="size-3"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18 18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
}
