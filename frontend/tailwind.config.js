/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a", // Deep black/gray
        surface: "#1a1a1a", // Slightly lighter for cards
        primary: "#3b82f6", // Electric Blue
        secondary: "#8b5cf6", // Purple
        accent: "#06b6d4", // Cyan
        success: "#10b981", // Emerald Green
        error: "#ef4444", // Red
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Orbitron', 'sans-serif'], // For futuristic headers
      }
    },
  },
  plugins: [],
}
