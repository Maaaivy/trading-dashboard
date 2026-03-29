import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        // Police principale — chiffres tabular pour aligner les données financières
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["var(--font-display)", "sans-serif"],
      },
      colors: {
        // Palette sombre trading-oriented
        surface: {
          DEFAULT: "#0d0f14",
          card: "#131720",
          elevated: "#1a2030",
          border: "#1e2535",
          hover: "#1f2840",
        },
        accent: {
          DEFAULT: "#00e5ff",
          dim: "#00b8d4",
          glow: "rgba(0,229,255,0.15)",
        },
        profit: {
          DEFAULT: "#00e676",
          dim: "#00c853",
          muted: "rgba(0,230,118,0.12)",
        },
        loss: {
          DEFAULT: "#ff1744",
          dim: "#d50000",
          muted: "rgba(255,23,68,0.12)",
        },
        neutral: {
          DEFAULT: "#ffd740",
          muted: "rgba(255,215,64,0.12)",
        },
        ink: {
          primary: "#e8eaf0",
          secondary: "#8892a4",
          tertiary: "#4a5568",
          muted: "#2d3748",
        },
      },
      backgroundImage: {
        // Grille subtile sur le fond
        "grid-pattern":
          "linear-gradient(rgba(30,37,53,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(30,37,53,0.8) 1px, transparent 1px)",
        "surface-gradient":
          "linear-gradient(135deg, #0d0f14 0%, #111827 100%)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(30,37,53,1)",
        "card-hover":
          "0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,229,255,0.15)",
        profit: "0 0 20px rgba(0,230,118,0.2)",
        loss: "0 0 20px rgba(255,23,68,0.2)",
        accent: "0 0 20px rgba(0,229,255,0.2)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
}

export default config
