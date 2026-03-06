import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#0052A5",
          600: "#00438a",
          700: "#003470",
          800: "#002555",
          900: "#00163b",
        },
        accent: {
          50: "#fef9ec",
          100: "#fdf0c8",
          500: "#F5A623",
          600: "#d48e1a",
        },
        success: { 500: "#22c55e" },
        warning: { 500: "#f59e0b" },
        danger: { 500: "#ef4444" },
      },
    },
  },
  plugins: [],
}
export default config
