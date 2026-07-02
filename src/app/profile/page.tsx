"use client";

import Navbar from "@/components/home/Navbar";
import Left_panel from "@/components/home/Left_panel";
import Profile from "@/components/profile/Profile";
import withAuth from "@/utils/authProtect";

function Page() {
  return (
    <div className="min-h-screen bg-parchment-100 font-outfit text-ink antialiased">
      <Navbar />

      {/* Desktop: rail + content. Phone/tablet: content only (nav lives in the Navbar). */}
      <div className="grid grid-cols-12">
        <aside className="hidden lg:col-span-1 lg:block">
          <Left_panel />
        </aside>
        <main className="col-span-12 border-ink/10 lg:col-span-11 lg:border-l">
          <Profile />
        </main>
      </div>
    </div>
  );
}

export default withAuth(Page);
