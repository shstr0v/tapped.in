/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#F8FBFF",
        foreground: "#0E1726",
        muted: "#E8EEF7",
        "muted-foreground": "#667085",
        primary: "#38BDF8",
        "primary-foreground": "#031525",
        accent: "#22C55E",
        warning: "#F59E0B",
        destructive: "#F43F5E",
        border: "#D8E2EE",
        card: "#FFFFFF",
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px",
      },
    },
  },
  plugins: [],
};
