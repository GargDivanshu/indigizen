/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "panels": "#0A0025",
        "blank": "#1E293B",
        "border": "#30304A"
      }
    },
  },
  plugins: [],
}