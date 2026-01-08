/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F1F7ED", // Mint Cream (Light Background)
        surface: "#ffffff", // White (Cards)
        primary: "#735CDD", // Slate Blue
        secondary: "#4A3F9B", // Deep Purple
        tertiary: "#1e1b4b", // Dark Indigo (Main Text)
        accent: "#9D8FE3", // Light Purple Accent
        success: "#10b981", // Emerald Green
        error: "#ef4444", // Red
        warning: "#f59e0b", // Amber
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Orbitron', 'sans-serif'], // For futuristic headers
      }
    },
  },
  plugins: [],
}
