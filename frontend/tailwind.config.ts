import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "hsl(214, 100%, 97%)",
          100: "hsl(214, 96%, 90%)",
          200: "hsl(214, 92%, 80%)",
          300: "hsl(214, 88%, 68%)",
          400: "hsl(214, 84%, 58%)",
          500: "hsl(214, 80%, 50%)",
          600: "hsl(214, 76%, 42%)",
          700: "hsl(214, 72%, 34%)",
          800: "hsl(214, 68%, 26%)",
          900: "hsl(214, 64%, 18%)",
        },
        surface: {
          50:  "hsl(220, 20%, 98%)",
          100: "hsl(220, 16%, 94%)",
          800: "hsl(220, 20%, 12%)",
          900: "hsl(220, 24%, 8%)",
          950: "hsl(220, 28%, 5%)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-fira-mono)", "Fira Mono", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.5s ease forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "grid-pattern":
          "linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
export default config;
