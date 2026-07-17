/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      inter: ["Poppins", "sans-serif"],
      "edu-sa": ["Edu SA Beginner", "cursive"],
      mono: ["Roboto Mono", "monospace"],
    },
    colors: {
      white: "#fff",
      black: "#000",
      transparent: "#ffffff00",

      // ─────────────────────────────────────────────────────────────────
      // OPENHAND BRAND PALETTE — v2 (dark theme)
      //
      // ink    = structural scale: page bg, surfaces, borders, body text.
      //          900 = darkest (page bg) ... 50 = lightest (headings).
      // gold   = primary accent: CTAs, links, active states, ratings.
      // sage   = secondary accent: eyebrows, section labels, subtle tags.
      // ─────────────────────────────────────────────────────────────────

      ink: {
        50:  "#F3EFE6", // headings / high-emphasis text
        100: "#D7DADE", // nav links / body text on dark
        200: "#9AA0A6", // muted / secondary text
        300: "#6B7178", // dim text (captions, meta)
        400: "#565D66",
        500: "#3A4048",
        600: "#2A2F36", // borders / dividers
        700: "#262B31", // raised surface / hover bg
        800: "#1D2126", // card / panel surface
        900: "#14171B", // page background
      },

      gold: {
        50:  "#FBF3DD",
        100: "#F5E4B0",
        200: "#EDD07D",
        300: "#E0BC55", // hover state
        400: "#D2A72F",
        500: "#C9A227", // primary accent
        600: "#A9861E",
        700: "#866A18",
        800: "#614C11",
        900: "#3D2F0A",
      },

      sage: {
        50:  "#EEF4F1",
        100: "#D9E7E0",
        200: "#B8D2C5",
        300: "#93BCA8",
        400: "#7CAB93",
        500: "#6E9B85", // secondary accent
        600: "#587D6B",
        700: "#446052",
        800: "#30443B",
        900: "#1C2924",
      },
    },
    extend: {
      maxWidth: {
        maxContent: "1260px",
        maxContentTab: "650px",
      },
    },
  },
  plugins: [],
};