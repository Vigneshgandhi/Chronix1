/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./src/**/*.{js,jsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        "primary-dim": "#1D4ED8",
        background: "#0B1120",
        card: "#111827",
        "card-elevated": "#161F2E",
        border: "#1F2937",
        "text-primary": "#E5E9F0",
        "text-secondary": "#8B95A7",
        "text-muted": "#5B6478",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      borderRadius: {
        chronix: "24px",
        "chronix-sm": "12px",
      },
    },
  },
  plugins: [],
};
