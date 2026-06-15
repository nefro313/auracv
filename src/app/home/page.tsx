"use client";
import Webview from "@/components/home/Webview";
import Mob_view from "@/components/home/mobile/Mob_view";
import withAuth from "@/utils/authProtect";
import React from "react";

function Page() {
  
  return (
    <div className="min-h-screen bg-parchment-100 font-outfit text-ink antialiased">
      <Webview />
      <Mob_view />
    </div>
  );
}
export default withAuth(Page);
