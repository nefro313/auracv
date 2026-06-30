"use client";

// please add mobile navbar and make it responsive

import React, { useState, useContext, useEffect } from "react";
import Link from "next/link";
import { AuraLogo } from "@/components/brand/logo";
import { Button, Snippet } from "@nextui-org/react";
import { CommonContext } from "@/Common_context";
import { supabase } from "@/utils/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function Navbar() {
  const { logout, userData } = useContext(CommonContext);
  const [user, setUser] = useState<any>("");

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
            <nav className=" sm:flex gap-3">
              {user ? (
                <Snippet
                  variant="bordered"
                  classNames={{
                    base: "rounded-full border border-ink/15 bg-white/60 py-[.23rem] text-ink",
                    pre: "font-outfit font-semibold text-ink-soft",
                    symbol: "hidden",
                    copyButton: "text-ink-mute",
                  }}
                  className="hidden font-outfit sm:flex"
                >
                  {`${user}.auracv.me`}
                </Snippet>
              ) : (
                <Skeleton className="hidden h-9 w-44 rounded-full sm:block" />
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
