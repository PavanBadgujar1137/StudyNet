/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      inter: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      poppins: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      jakarta: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      fraunces: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      sans: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      mono: ["Plus Jakarta Sans", "Inter", "sans-serif"],
    },
    colors: {
      white: "#fff",
      black: "#000",
      transparent: "#ffffff00",
      
      // OpenHand Custom Color Palette
      paper: "#F3F4F6",      // Neutral light gray background
      "paper-deep": "#FFFFFF", // Clean white surface
      navy: "#0D1B3D",       // Deep Navy
      "royal-blue": "#2563EB", // Royal Blue accent
      violet: "#7C3AED",     // Violet secondary accent
      "sky-blue": "#60A5FA",  // Sky Blue highlight
      "ink-soft": "#4B5563",  // Slate gray for secondary text
      line: "#E5E7EB",       // Border gray

      richblack: {
        5: "#0D1B3D",        // Deep Navy (main text)
        25: "#0D1B3D",       // Deep Navy text
        50: "#111827",       // Dark neutral text
        100: "#1F2937",      // Dark neutral text
        200: "#374151",      // Muted dark text
        300: "#4B5563",      // Slate gray text
        400: "#6B7280",      // Gray text
        500: "#9CA3AF",      // Neutral gray
        600: "#D1D5DB",      // Border gray
        700: "#E5E7EB",      // Light border gray
        800: "#FFFFFF",      // White card/surface background
        900: "#F3F4F6",      // Light gray body background
      },
      richblue: {
        5: "#0D1B3D",
        25: "#0D1B3D",
        50: "#111827",
        100: "#1F2937",
        200: "#374151",
        300: "#4B5563",
        400: "#6B7280",
        500: "#9CA3AF",
        600: "#D1D5DB",
        700: "#E5E7EB",
        800: "#FFFFFF",
        900: "#F3F4F6",
      },
      blue: {
        5: "#EFF6FF",
        25: "#DBEAFE",
        50: "#3B82F6",
        100: "#2563EB",
        200: "#1D4ED8",
        300: "#1E40AF",
        400: "#1E3A8A",
        500: "#172554",
        600: "#0D1B3D",
        700: "#0D1B3D",
        800: "#0D1B3D",
        900: "#0D1B3D",
      },
      caribbeangreen: {
        5: "#ECFDF5",
        25: "#D1FAE5",
        50: "#10B981",
        100: "#059669",
        200: "#047857",
        300: "#065F46",
        400: "#064E3B",
        500: "#022C22",
        600: "#022C22",
        700: "#022C22",
        800: "#022C22",
        900: "#022C22",
      },
      brown: {
        5: "#FFFBEB",
        25: "#FEF3C7",
        50: "#F59E0B",
        100: "#D97706",
        200: "#B45309",
        300: "#92400E",
        400: "#78350F",
        500: "#451A03",
        600: "#451A03",
        700: "#451A03",
        800: "#451A03",
        900: "#451A03",
      },
      pink: {
        5: "#FDF2F8",
        25: "#FCE7F3",
        50: "#EC4899",
        100: "#DB2777",
        200: "#C084FC",      // Used for highlights: map to violet-like color
        300: "#BE185D",
        400: "#9D174D",
        500: "#831843",
        600: "#500724",
        700: "#500724",
        800: "#500724",
        900: "#500724",
      },
      yellow: {
        5: "#EFF6FF",        // Light sky blue
        25: "#DBEAFE",       // Sky blue
        50: "#2563EB",        // Royal Blue (primary button bg in old theme)
        100: "#1D4ED8",       // Deep Royal Blue
        200: "#1E40AF",       // Hover state blue
        300: "#1E3A8A",
        400: "#7C3AED",       // Violet highlight
        500: "#6D28D9",
        600: "#5B21B6",
        700: "#4C1D95",
        800: "#0D1B3D",
        900: "#0D1B3D",
      },
      "pure-greys": {
        5: "#F9FAFB",
        25: "#F3F4F6",
        50: "#E5E7EB",
        100: "#D1D5DB",
        200: "#9CA3AF",
        300: "#6B7280",
        400: "#4B5563",
        500: "#374151",
        600: "#1F2937",
        700: "#111827",
        800: "#030712",
        900: "#030712",
      },
    },
    extend: {
      screens: {
        xs: "320px",
        sm: "481px",
        md: "768px",
        lg: "1025px",
        xl: "1441px",
        "2xl": "1920px",
      },
      maxWidth: {
        maxContent: "1260px",
        maxContentTab: "650px"
      },
    },
  },
  plugins: [],
};
