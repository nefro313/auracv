import { ImageResponse } from "next/og";
import { MARK_DATA_URI } from "@/components/brand/mark";

// Static brand mark for iOS home-screen bookmarks (the parchment tile in the
// SVG doubles as the required opaque background).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <img src={MARK_DATA_URI} alt="AuraCV" style={{ height: 180, width: 180 }} />
    ),
    size,
  );
}
