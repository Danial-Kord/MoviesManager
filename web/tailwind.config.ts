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
        imdb: {
          canvas: "#141414",
          surface: "#191919",
          elevated: "#1f1f1f",
          panel: "#262626",
          rail: "#333333",
          border: "#404040",
          text: "#f5f5f1",
          muted: "#b3b3b3",
          subtle: "#a3a3a3",
          dim: "#808080",
          gold: "#f5c518",
          goldHover: "#be9500",
          focus: "#5799ef",
          error: "#f87171",
          footer: "#0d0d0d",
          hover: "rgba(255, 255, 255, 0.08)",
        },
      },
      borderRadius: {
        imdb: "4px",
        "imdb-md": "6px",
        "imdb-card": "8px",
        "imdb-lg": "12px",
      },
      fontFamily: {
        imdb: [
          "-apple-system",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Oxygen-Sans",
          "Ubuntu",
          "Cantarell",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "imdb-hero-scrim": "linear-gradient(to top, var(--imdb-canvas) 0%, rgba(20,20,20,0.92) 35%, transparent 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
