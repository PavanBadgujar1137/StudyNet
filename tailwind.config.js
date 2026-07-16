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
      // OPENHAND BRAND PALETTE — LIGHT THEME (flipped July 2026)
      //
      // Only the richblack scale is reversed (5 <-> 900, 25 <-> 800, etc).
      // richblack was the only "structural" scale (page bg + body text) —
      // everything else (richblue, blue, caribbeangreen, yellow, pink,
      // brown, pure-greys) is an accent color and stays unchanged, since
      // those already read fine on both dark and light backgrounds.
      //
      // Practical effect on Home.jsx:
      //   bg-richblack-900 / -800   -> now light surfaces (was dark bg)
      //   text-richblack-200 / -300 -> now dark text (was light text on dark)
      //   text-richblack-700        -> now LIGHT (was dark text on
      //                                 bg-pure-greys-5 in Section 2) —
      //                                 change that one class to
      //                                 text-richblack-800 or -900 so it
      //                                 stays dark and readable.
      // ─────────────────────────────────────────────────────────────────

      richblack: {
        5:   "#060C1E",  // was 900 — now darkest, primary text on light
        25:  "#0D1B3D",  // was 800 — dark, secondary text
        50:  "#10184D",  // was 700 — dark
        100: "#1A2468",  // was 600 — deep
        200: "#263385",  // was 500 — dark navy text
        300: "#3F4EA0",  // was 400 — medium-dark navy text
        400: "#606DC3",  // was 300 — medium navy
        500: "#7D88CE",  // was 200 — medium-light navy
        600: "#9BA3D9",  // was 100 — light
        700: "#B8BEE4",  // was 50  — light (see note above re: Section 2)
        800: "#D5D9EF",  // was 25  — very light surface
        900: "#EEF0F8",  // was 5   — lightest, main app background
      },

      // Royal Blue tonal scale — unchanged (accent, not theme-structural)
      richblue: {
        5:   "#EBF2FF",
        25:  "#C4D8FD",
        50:  "#9DBEFB",
        100: "#76A4F9",
        200: "#4F8AF7",
        300: "#2563EB",  // Royal Blue — primary interactive ← BRAND COLOR
        400: "#1D55D0",
        500: "#1547B5",
        600: "#0D399A",
        700: "#052B7F",
        800: "#001D64",
        900: "#000F49",
      },

      // Sky Blue tonal scale — unchanged
      blue: {
        5:   "#EEF7FF",
        25:  "#D5EAFE",
        50:  "#BBDCFD",
        100: "#A2CFFC",
        200: "#60A5FA",  // Sky Blue — lighter accents ← BRAND COLOR
        300: "#4A90E8",
        400: "#347BD6",
        500: "#1E66C4",
        600: "#0851B2",
        700: "#003C9A",
        800: "#002782",
        900: "#00126A",
      },

      // Violet tonal scale — unchanged
      caribbeangreen: {
        5:   "#F4F0FF",
        25:  "#E3D5FD",
        50:  "#D0BBFB",
        100: "#7C3AED",  // Violet — secondary accent ← BRAND COLOR
        200: "#6B2FD4",
        300: "#5A24BB",
        400: "#4919A2",
        500: "#380E89",
        600: "#270370",
        700: "#180058",
        800: "#0A0040",
        900: "#020028",
      },

      // Neutral navy-grey scale — unchanged
      brown: {
        5:   "#F0F2F8",
        25:  "#D8DCF0",
        50:  "#C0C6E8",
        100: "#A8B0E0",
        200: "#909AD8",
        300: "#7884D0",
        400: "#5C6AB8",
        500: "#4050A0",
        600: "#2A3688",
        700: "#1A2470",
        800: "#0E1458",
        900: "#060840",
      },

      // Violet-pink scale — unchanged
      pink: {
        5:   "#F5F0FF",
        25:  "#E8D8FF",
        50:  "#DAC0FF",
        100: "#CCA8FF",
        200: "#BE90FF",
        300: "#A060F0",
        400: "#7C3AED",  // Violet (matches caribbeangreen-100) ← BRAND COLOR
        500: "#6B2FD4",
        600: "#5A24BB",
        700: "#4919A2",
        800: "#380E89",
        900: "#270370",
      },

      // Royal Blue action scale — unchanged (CTA buttons, active nav)
      yellow: {
        5:   "#EBF2FF",
        25:  "#60A5FA",  // Sky Blue — active nav link color ← BRAND COLOR (sky)
        50:  "#2563EB",  // Royal Blue — CTA button background ← BRAND COLOR (primary)
        100: "#1D55D0",
        200: "#1547B5",
        300: "#0D399A",
        400: "#05287F",
        500: "#001764",
        600: "#000649",
        700: "#00002E",
        800: "#000013",
        900: "#000000",
      },

      // Light Grey tonal scale — unchanged (already light, works as-is)
      "pure-greys": {
        5:   "#F3F4F6",  // Light Grey ← BRAND COLOR (exact match)
        25:  "#E4E6ED",
        50:  "#D2D5E0",
        100: "#BFC3D0",
        200: "#ACB1C0",
        300: "#9A9FB0",
        400: "#878DA0",
        500: "#757B90",
        600: "#5E6478",
        700: "#474C60",
        800: "#303548",
        900: "#1A1E30",
      },
    },
    extend: {
      maxWidth: {
        maxContent: "1260px",
        maxContentTab: "650px"
      },
    },
  },
  plugins: [],
};