import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        netflix: { DEFAULT: "#E50914" },
        imdb: { gold: "#F5C518" },
        surface: { DEFAULT: "#1a1a1a", card: "#232323", hover: "#2a2a2a" },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-fade": "linear-gradient(180deg, transparent 0%, #0d0d0d 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
