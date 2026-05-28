import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["DM Serif Display", "serif"],
        sans: ["DM Sans", "sans-serif"],
      },
      colors: {
        ink: {
          DEFAULT: "#1A1814",
          2: "#6B6760",
          3: "#A8A49E",
        },
        bg: {
          DEFAULT: "#F7F5F0",
          surface: "#FFFFFF",
          surface2: "#F0EDE6",
        },
        accent: {
          DEFAULT: "#2D5A3D",
          light: "#EAF2EC",
        },
        gold: {
          DEFAULT: "#8B6914",
          light: "#FDF3DC",
        },
        navy: {
          DEFAULT: "#1A3A5C",
          light: "#E8EFF6",
        },
      },
    },
  },
  plugins: [],
};

export default config;
