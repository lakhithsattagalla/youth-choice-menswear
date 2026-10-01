/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0a0a0c",
          surface: "#121215",
          card: "#18181c",
          border: "#27272a",
          gold: "#c5a059",
          goldHover: "#b38f48",
          muted: "#9a9a9a"
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
        display: ['Outfit', 'sans-serif']
      }
    },
  },
  plugins: [],
}
