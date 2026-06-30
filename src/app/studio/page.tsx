"use client";
import Webview from "@/components/home/Webview";
import Mob_view from "@/components/home/mobile/Mob_view";
import WelcomeBack from "@/components/home/WelcomeBack";
import withAuth from "@/utils/authProtect";
import React, { useEffect, useState } from "react";

function Page() {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Greet in the two moments where the portfolio has to be (re)fetched, so
    // the splash always covers a real data load:
    //   1. a fresh sign-in — a one-shot `auracv:welcome` flag dropped by the
    //      post-login redirect, read-and-cleared here so it fires once; and
    //   2. a hard refresh of /studio — detected via the Navigation Timing API.
    // Ordinary in-app navigation to /studio (e.g. from Profile) shows nothing.
    const justLoggedIn = sessionStorage.getItem("auracv:welcome");
    if (justLoggedIn) sessionStorage.removeItem("auracv:welcome");

    const navEntry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    const isReload = navEntry?.type === "reload";

    if (justLoggedIn || isReload) {
      setShowWelcome(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-parchment-100 font-outfit text-ink antialiased">
      {showWelcome && <WelcomeBack onFinish={() => setShowWelcome(false)} />}
      <Webview />
      <Mob_view />
    </div>
  );
}
export default withAuth(Page);
