import React from "react";
import Home from "../Home";
import Navbar from "../Navbar";

export default function Webview() {
  return (
    <div>
      <section className="flex h-[100dvh] flex-col overflow-hidden bg-parchment-100 font-outfit text-ink lg:hidden">
        <Navbar />

        <div className="grid min-h-0 flex-1 grid-cols-12">
          <div className="col-span-12 flex min-h-0 flex-col border-l border-ink/10">
            <Home />
          </div>
        </div>
      </section>
    </div>
  );
}
