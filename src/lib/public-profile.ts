import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import { UserProfile } from "@/lib/type";

/**
 * Read-only Supabase client for public portfolio data. Uses the anon key —
 * RLS on `public.users` allows public select — so it is safe on the server
 * without cookies or the service role.
 *
 * The portfolio (`/`) and resume (`/resume`) pages previously fetched this
 * data over HTTP from the app's own `/api/getUser` route: two sequential
 * round-trips (page → API route → Supabase) on every navigation. Querying
 * Supabase directly removes a full network hop from every page load.
 */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
);

/**
 * Wrapped in `React.cache` so `generateMetadata` and the page body share one
 * query per request instead of hitting Supabase separately.
 */
export const getPublicProfile = cache(
  async (username: string): Promise<UserProfile | null> => {
    if (!username) return null;

    const { data, error } = await supabase
      .from("users")
      .select("resumeJson")
      .eq("userName", username)
      .single();

    if (error || !data?.resumeJson) {
      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows — an unknown subdomain, not a real failure.
        console.error("Error fetching public profile:", error);
      }
      return null;
    }

    return data.resumeJson as UserProfile;
  },
);

/**
 * Existence + last-modified check without pulling the whole resume JSON —
 * used by the per-portfolio sitemap.
 */
export const getPublicProfileTimestamp = cache(
  async (username: string): Promise<{ updatedAt: string | null } | null> => {
    if (!username) return null;

    const { data, error } = await supabase
      .from("users")
      .select("updatedAt")
      .eq("userName", username)
      .single();

    if (error || !data) return null;
    return { updatedAt: (data as { updatedAt: string | null }).updatedAt };
  },
);
