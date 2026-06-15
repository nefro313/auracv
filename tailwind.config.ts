import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        urbanist: ["var(--font-urbanist)", "sans-serif"],
        outfit: ["var(--font-outfit)", "sans-serif"],
        monrope: ["var(--font-monrope)", "sans-serif"],
        dmSans: ["var(--font-dm-sans)", "sans-serif"],
        sora: ["var(--font-sora)", "sans-serif"],
        roboto: ["var(--font-roboto)", "sans-serif"],
        quattrocento: ["var(--font-quattrocento)", "serif"],
        fraunces: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      colors: {
        parchment: {
          50: "#FCFAF5",
          100: "#F8F7F3",
          200: "#F0E8D9",
          300: "#E5D9C3",
          400: "#D5C4A5",
        },
        ink: {
          DEFAULT: "#211B12",
          soft: "#473E30",
          mute: "#8A7D68",
        },
        aura: {
          violet: "#8B5CF6",
          cyan: "#06B6D4",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        grid: {
          "0%": { transform: "translateY(-50%)" },
          "100%": { transform: "translateY(0)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },
        "scale-up4": {
          "20%": {
            backgroundColor: "#fff",
            transform: "scaleY(1.5)",
          },
          "40%": {
            transform: "scaleY(1)",
          },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        orbit: {
          "0%": {
            transform:
              "rotate(0deg) translateY(calc(var(--radius) * 1px)) rotate(0deg)",
          },
          "100%": {
            transform:
              "rotate(360deg) translateY(calc(var(--radius) * 1px)) rotate(-360deg)",
          },
        },
        "spin-around": {
          "0%": {
            transform: "translateZ(0) rotate(0)",
          },
          "15%, 35%": {
            transform: "translateZ(0) rotate(90deg)",
          },
          "65%, 85%": {
            transform: "translateZ(0) rotate(270deg)",
          },
          "100%": {
            transform: "translateZ(0) rotate(360deg)",
          },
        },
        slide: {
          to: {
            transform: "translate(calc(100cqw - 100%), 0)",
          },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "aura-drift": {
          "0%, 100%": { opacity: "0.55", transform: "translateX(-50%) scale(1)" },
          "50%": { opacity: "0.85", transform: "translateX(-50%) scale(1.07)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        orbit: "orbit calc(var(--duration)*1s) linear infinite",
        "spin-around": "spin-around calc(var(--speed) * 2) infinite linear",
        slide: "slide var(--speed) ease-in-out infinite alternate",
        "scale-up4": "scale-up4 1s linear infinite",
        marquee: "marquee var(--duration) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
        grid: "grid 30s linear infinite",
        "fade-up": "fade-up 0.9s cubic-bezier(0.21, 0.65, 0.32, 1) both",
        "aura-drift": "aura-drift 9s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), nextui()],
} satisfies Config;

export default config;
