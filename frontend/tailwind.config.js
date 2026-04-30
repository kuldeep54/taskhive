/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f1117",
        card: "#1a1d27",
        sidebar: "#13151f",
        primary: "#00d4aa",
        "text-primary": "#ffffff",
        "text-secondary": "#8b8fa8",
        border: "#2a2d3e",
        error: "#ef4444",
        success: "#22c55e",
        warning: "#eab308",
        info: "#3b82f6",
      },
      boxShadow: {
        'teal-glow': '0 0 40px rgba(0,212,170,0.08)',
      },
      borderRadius: {
        'xl': '0.75rem',
        'lg': '0.5rem',
        'card': '0.75rem',
        'input': '0.5rem',
      }
    },
  },
  plugins: [],
}
