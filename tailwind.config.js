/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        admin: {
          bg: "#0b0b0d",
          panel: "#121216",
          card: "#16161c",
          border: "#24242c",
          muted: "#8b8b96",
          accent: "#6366f1",
          "accent-soft": "#312e81",
          success: "#22c55e",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(99, 102, 241, 0.25)",
      },
    },
  },
  plugins: [],
};
