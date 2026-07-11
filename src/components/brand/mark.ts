/**
 * The AuraCV mark on a parchment tile as inline SVG — shared by the favicon,
 * apple touch icon, and OG image routes so none of them need a network fetch
 * at render time.
 */
export const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90" fill="none">
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

export const MARK_DATA_URI = `data:image/svg+xml;base64,${Buffer.from(
  MARK_SVG,
).toString("base64")}`;
