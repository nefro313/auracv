"use client";

// please add mobile navbar and make it responsive

import React, { useState, useContext, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuraLogo } from "@/components/brand/logo";
import { Button, Snippet } from "@nextui-org/react";
import { CommonContext } from "@/CommonContext";
import { supabase } from "@/utils/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function Navbar() {
  const { logout, userData } = useContext(CommonContext);
  const [user, setUser] = useState<any>("");
  const pathname = usePathname();

  // Page nav shown only on phones/tablets — desktop has the Left_panel rail.
  const pageNavClass = (href: string, exact = false) => {
    const active = exact ? pathname === href : pathname?.startsWith(href);
    return `flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
      active
        ? "bg-parchment-200 text-ink"
        : "text-ink-mute hover:bg-parchment-200/60 hover:text-ink"
    }`;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("userName")
        .eq("userId", userData?.user.id);

      if (error) {
        console.error("Error fetching user data:", error);
      } else {
        if (data && data.length > 0) {
          setUser(data[0].userName);
        }
      }
    };
    if (userData?.user.id) fetchUserData();
  }, [userData]);
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-ink/10 bg-parchment-50/85 py-4 font-outfit backdrop-blur-md">
        <div className=" px-4 mx-auto sm:px-8 lg:px-10 ">
          <div className="flex items-center justify-between">
            <div className="flex-shrink-0">
              <Link
                href="/auracv"
                title="AuraCV"
                className="flex justify-center items-center"
              >
                <AuraLogo markClassName="h-8 w-8" wordClassName="text-xl" />
              </Link>
            </div>
            <nav className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1 lg:hidden">
                <Link
                  href="/studio"
                  aria-label="Home"
                  className={pageNavClass("/studio", true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                    />
                  </svg>
                </Link>
                <Link
                  href="/profile"
                  aria-label="Profile"
                  className={pageNavClass("/profile")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                </Link>
              </div>
              {user ? (
                <Snippet
                  variant="bordered"
                  classNames={{
                    base: "rounded-full border border-ink/15 bg-white/60 py-[.23rem] text-ink",
                    pre: "font-outfit font-semibold text-ink-soft",
                    symbol: "hidden",
                    copyButton: "text-ink-mute",
                  }}
                  className="hidden font-outfit lg:flex"
                >
                  {`${user}.auracv.me`}
                </Snippet>
              ) : (
                <Skeleton className="hidden h-9 w-44 rounded-full lg:block" />
              )}{" "}
              <Button
                onPress={() => logout()}
                variant="bordered"
                className="rounded-full py-1 flex justify-center items-center gap-1 font-outfit border border-ink/15 bg-white/60 font-semibold text-ink-soft transition hover:border-ink/25 hover:text-ink"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5 text-ink-soft"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
                  />
                </svg>
                Logout
              </Button>{" "}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
