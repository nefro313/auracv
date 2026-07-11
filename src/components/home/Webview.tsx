import React from "react";
import Home from "./Home";
import Navbar from "./Navbar";
import LeftPanel from "./LeftPanel";

export default function Webview() {
  return (
    <div>
      <section className="hidden h-screen flex-col overflow-hidden bg-parchment-100 font-outfit text-ink lg:flex">
        <Navbar />

        <div className="grid min-h-0 flex-1 grid-cols-12">
          <div className="col-span-1 min-h-0 overflow-y-auto">
            <LeftPanel />
          </div>
          <div className="col-span-11 flex min-h-0 flex-col border-l border-ink/10">
            <Home />
          </div>
        </div>
      </section>
    </div>
  );
}
