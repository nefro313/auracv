import { ImageResponse } from "next/og";
import { supabase } from "@/utils/supabase/supabase.service";
import { MARK_DATA_URI } from "@/components/brand/mark";
import { resolveTenant } from "@/lib/seo/host";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

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
  const tenant = await resolveTenant();

  try {
    if (tenant.kind === "marketing") {
      return brandIcon();
    }
    const userName = tenant.slug;

    const user = await getUser(userName);
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
