import React from "react";
import Home from "../Home";
import Navbar from "../Navbar";
import Left_panel from "../Left_panel";

export default function Webview() {
  return (
    <div>
      <section className="block bg-parchment-100 font-outfit text-ink sm:hidden">
        <Navbar />

        <div className="grid grid-cols-12 min-h-screen">
          <div className=" col-span-12 flex flex-col border-l border-ink/10 ">
            <Home />
          </div>
        </div>
      </section>
    </div>
  );
}
