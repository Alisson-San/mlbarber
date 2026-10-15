import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        alabaster: "#FAF8F5",
        sand: {
          DEFAULT: "#EFECE4",
          dark: "#E2DDD2",
        },
        fern: {
          DEFAULT: "#1B3B2B",
          light: "#2A543E",
          dark: "#11261B",
        },
        olive: "#4A5848",
        charcoal: "#141615",
        wood: "#A67C52",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
