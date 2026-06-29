import { ImageResponse } from "next/og";
import { headers } from "next/headers";
import { supabase } from "@/utils/supabase/supabase_service";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// AuraCV mark on a parchment tile, rendered locally (no network fetch)
const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90" fill="none">
  <defs>
    <linearGradient id="g" x1="15" y1="15" x2="75" y2="75" gradientUnits="userSpaceOnUse">
      <stop stop-color="#8B5CF6"/>
      <stop offset="1" stop-color="#06B6D4"/>
    </linearGradient>
  </defs>
  <rect width="90" height="90" rx="20" fill="#F8F7F3"/>
  <circle cx="45" cy="45" r="28" stroke="url(#g)" stroke-width="7"/>
  <path d="M45 20 L29 61 L61 61 Z" stroke="#211B12" stroke-width="5" stroke-linejoin="round"/>
  <path d="M34 48 L56 48" stroke="#211B12" stroke-width="5" stroke-linecap="round"/>
</svg>`;

const MARK_DATA_URI = `data:image/svg+xml;base64,${Buffer.from(
  MARK_SVG,
).toString("base64")}`;

async function getUser(auracv: string): Promise<any | null> {
  try {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("metaJson")
      .eq("userName", auracv)
      .single();

    if (userError) {
      return null;
    }
    return userData.metaJson;
  } catch (error) {
    console.error("An error occurred while fetching the user details:", error);
    return null;
  }
}

function brandIcon() {
  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={MARK_DATA_URI}
        alt="AuraCV"
        style={{ height: 32, width: 32 }}
      />
    ),
    {
      ...size,
      headers: {
        "Content-Type": contentType,
      },
    },
  );
}

// Image generation
export default async function Icon() {
  const headersList = await headers();
  // `x-current-path` is the subdomain set by the proxy middleware (the same
  // header every portfolio page reads); fall back to the forwarded host.
  const hostHeader =
    headersList.get("x-current-path") ||
    headersList.get("x-forwarded-host") ||
    headersList.get("host") ||
    "";
  const userName = hostHeader.split(".")[0];
  const isDev = hostHeader.includes("localhost");

  try {
    if (userName === "www" || userName === "auracv" || isDev) {
      return brandIcon();
    }

    const user = await getUser(userName || "");
    if (user && user.avatarUrl) {
      return new ImageResponse(
        (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt={userName}
            style={{
              height: 32,
              width: 32,
              borderRadius: "50%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        ),
        {
          ...size,
          headers: {
            "Content-Type": contentType,
          },
        },
      );
    }

    if (userName) {
      return new ImageResponse(
        (
          <div
            style={{
              fontSize: 24,
              background: "#F8F7F3",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#211B12",
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
        ),
        {
          ...size,
        },
      );
    }

    return brandIcon();
  } catch (error) {
    console.error("Failed to generate icon:", error);
    return brandIcon();
  }
}
