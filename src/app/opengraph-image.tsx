import { ImageResponse } from "next/og";
import { MARK_DATA_URI } from "@/components/brand/mark";
import { portfolioOrigin, siteConfig } from "@/config/site";
import { getPublicProfile } from "@/lib/public-profile";
import { resolveTenant } from "@/lib/seo/host";

// One host-aware OG image for every page: the brand card on the marketing
// host, a personalised card on each portfolio subdomain. Replaces the old
// og:image reference to /logo_icon.png — a file that never existed, so every
// social share rendered without an image.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AuraCV";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
};

const INK = "#211B12";
const INK_SOFT = "#473E30";
const INK_MUTE = "#8A7D68";
const PARCHMENT = "#F8F7F3";
const AURA =
  "radial-gradient(circle at 20% 0%, rgba(139,92,246,0.14), transparent 55%), radial-gradient(circle at 85% 100%, rgba(6,182,212,0.12), transparent 55%)";

type PortfolioCard = {
  name: string;
  role: string;
  avatarUrl: string;
  host: string;
};

/** Portfolio data for the given slug, or null for the brand card. */
async function loadPortfolioCard(slug: string): Promise<PortfolioCard | null> {
  try {
    const user = await getPublicProfile(slug);
    if (!user) return null;

    return {
      name: user.basics.name || slug,
      role: user.basics.label || user.work?.[0]?.position || "",
      avatarUrl: user.basics.avatarUrl || user.meta.avatarUrl || "",
      host: portfolioOrigin(user.meta.userName).replace("https://", ""),
    };
  } catch (error) {
    console.error("Failed to load OG image data:", error);
    return null;
  }
}

function brandCard() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: PARCHMENT,
          backgroundImage: AURA,
        }}
      >
        <img src={MARK_DATA_URI} alt="" width={140} height={140} />
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 84,
            color: INK,
            letterSpacing: -2,
          }}
        >
          AuraCV
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 34,
            color: INK_SOFT,
            maxWidth: 820,
            textAlign: "center",
          }}
        >
          {siteConfig.tagline}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 26,
            color: INK_MUTE,
          }}
        >
          auracv.me
        </div>
      </div>
    ),
    { ...size, headers: CACHE_HEADERS },
  );
}

function portfolioCard({ name, role, avatarUrl, host }: PortfolioCard) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: PARCHMENT,
          backgroundImage: AURA,
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            width={180}
            height={180}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              border: "6px solid white",
            }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              width: 180,
              height: 180,
              borderRadius: "50%",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 90,
              color: "white",
              backgroundImage: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
            }}
          >
            {name.trim().charAt(0).toUpperCase() || "A"}
          </div>
        )}
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 72,
            color: INK,
            letterSpacing: -1.5,
            maxWidth: 1040,
            textAlign: "center",
          }}
        >
          {name}
        </div>
        {role ? (
          <div
            style={{
              display: "flex",
              marginTop: 16,
              fontSize: 34,
              color: INK_SOFT,
              maxWidth: 920,
              textAlign: "center",
            }}
          >
            {role}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            marginTop: 32,
            alignItems: "center",
            gap: 14,
            fontSize: 26,
            color: INK_MUTE,
          }}
        >
          <img src={MARK_DATA_URI} alt="" width={36} height={36} />
          <div style={{ display: "flex" }}>{host}</div>
        </div>
      </div>
    ),
    { ...size, headers: CACHE_HEADERS },
  );
}

export default async function OgImage() {
  // resolveTenant stays outside the try/catch in loadPortfolioCard: Next
  // signals "this route is dynamic" by throwing from headers(), and that
  // control-flow error must propagate.
  const tenant = await resolveTenant();
  if (tenant.kind === "marketing") return brandCard();

  const card = await loadPortfolioCard(tenant.slug);
  if (!card) return brandCard();
  return portfolioCard(card);
}
