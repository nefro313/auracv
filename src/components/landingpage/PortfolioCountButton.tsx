"use client";
import { useEffect, useState } from "react";
import NumberTicker from "../magicui/number-ticker";

export function PortfolioCountButton() {
  const [count, setCount] = useState(100); // Default value

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch("/api/noOfPortfolio");
        if (response.ok) {
          const data = await response.json();
          setCount(data.count || count);
        }
      } catch (error) {
        console.error("Error fetching portfolio count:", error);
      }
    };

    fetchCount();
  }, []);

  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-ink/10 bg-white/70 px-4 py-2 backdrop-blur-sm">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aura-cyan opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-aura-cyan" />
      </span>
      <NumberTicker
        value={count}
        className="font-fraunces text-base font-semibold text-ink"
      />
      <span className="text-sm font-medium text-ink-mute">
        portfolios created
      </span>
    </div>
  );
}
