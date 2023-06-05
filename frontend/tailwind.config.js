/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: {
    content: [
      "app/**/*.{ts,tsx}",
      "components/**/*.{ts,tsx}",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    
  },
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        "panels": "#0A0025",
        "blank": "#1E293B",
        "border": "#30304A"
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}