/**
 * Static capability strip shown in the hero in place of the live-portfolios
 * marquee (temporarily disabled). Non-scrolling by design — three editorial
 * pills that state what AuraCV delivers, styled with the Atelier Paper tokens.
 *
 * The marquee lives on in `Marquee.tsx`; swap `<MarqueeDemo />` back into
 * `Hero.tsx` to re-enable it.
 */

const highlights = [
  {
    label: "Live in ~20 seconds",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
      />
    ),
  },
  {
    label: "Your own address",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
      />
    ),
  },
  {
    label: "Export to PDF & DOCX",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
      />
    ),
  },
];

export function HeroHighlights() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
      {highlights.map((item) => (
        <span
          key={item.label}
          className="group inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-sm font-medium text-ink-soft backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-aura-violet/30 hover:text-ink hover:shadow-[0_16px_40px_-20px_rgba(33,27,18,0.35)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.6}
            stroke="currentColor"
            aria-hidden="true"
            className="size-4 shrink-0 text-aura-violet transition duration-300 group-hover:text-aura-cyan"
          >
            {item.icon}
          </svg>
          {item.label}
        </span>
      ))}
    </div>
  );
}
