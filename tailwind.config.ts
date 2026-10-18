import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        studio: {
          bg: "#1e1f22",
          sidebar: "#2b2d30",
          header: "#111214",
          card: "#2b2d30",
          border: "#393b40",
          accent: "#3574f0",
          accentHover: "#305dbe",
          success: "#579a5a",
          warning: "#f1a100",
          danger: "#e55757",
          textPrimary: "#dfe1e5",
          textSecondary: "#868a91",
        },
      },
    },
  },
  plugins: [],
};

export default config;