/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      // Brand font: Poppins (replaces Inter — key kept as "inter" so font-inter class still works)
      inter: ["Poppins", "sans-serif"],
      "edu-sa": ["Edu SA Beginner", "cursive"],
      mono: ["Roboto Mono", "monospace"],
    },
    colors: {
      white: "#fff",
      black: "#000",
      transparent: "#ffffff00",

      // ─────────────────────────────────────────────────────────────────
      // OPENHAND BRAND PALETTE  (brand identity, July 2026)
      //   #0D1B3D  Deep Navy   → richblack  (backgrounds, surfaces, borders)
      //   #2563EB  Royal Blue  → richblue   (primary interactive)
      //   #7C3AED  Violet      → caribbeangreen (secondary / gradient)
      //   #60A5FA  Sky Blue    → blue       (lighter accents, highlights)
      //   #F3F4F6  Light Grey  → pure-greys (light surfaces, muted text)
      //   yellow  scale → Royal Blue family (CTA buttons, active nav)
      //   pink    scale → Violet family     (secondary accents, badges)
      //   brown   scale → Navy-grey neutral (subtle surfaces)
      // ─────────────────────────────────────────────────────────────────

      // Deep Navy tonal scale — main bg, navbar, footer, card surfaces, borders
      richblack: {
        5:   "#EEF0F8",  // lightest navy tint — primary text on dark
        25:  "#D5D9EF",  // light navy — secondary text
        50:  "#B8BEE4",  // soft navy — disabled text
        100: "#9BA3D9",  // medium-light navy
        200: "#7D88CE",  // medium navy
        300: "#606DC3",  // medium-dark navy
        400: "#3F4EA0",  // dark navy
        500: "#263385",  // darker navy
        600: "#1A2468",  // deep
        700: "#10184D",  // very deep — subtle borders
        800: "#0D1B3D",  // Deep Navy — navbar, footer, card surface ← BRAND COLOR
        900: "#060C1E",  // darkest navy — main app background
      },

      // Royal Blue tonal scale — primary interactive elements, links, focus rings
      richblue: {
        5:   "#EBF2FF",  // lightest blue tint
        25:  "#C4D8FD",  // very light blue
        50:  "#9DBEFB",  // light blue
        100: "#76A4F9",  // medium-light blue
        200: "#4F8AF7",  // medium blue
        300: "#2563EB",  // Royal Blue — primary interactive ← BRAND COLOR
        400: "#1D55D0",  // slightly darker
        500: "#1547B5",  // darker blue
        600: "#0D399A",  // deep blue
        700: "#052B7F",  // very deep blue
        800: "#001D64",  // near-navy blue
        900: "#000F49",  // darkest blue
      },

      // Sky Blue tonal scale — lighter accents, code highlights, icon fills
      blue: {
        5:   "#EEF7FF",  // almost white sky
        25:  "#D5EAFE",  // very light sky
        50:  "#BBDCFD",  // light sky
        100: "#A2CFFC",  // soft sky
        200: "#60A5FA",  // Sky Blue — lighter accents ← BRAND COLOR
        300: "#4A90E8",  // medium sky
        400: "#347BD6",  // deeper sky
        500: "#1E66C4",  // dark sky
        600: "#0851B2",  // deep sky
        700: "#003C9A",  // very deep
        800: "#002782",  // near-navy
        900: "#00126A",  // darkest sky
      },

      // Violet tonal scale — secondary brand color, gradient end, badges, highlights
      // (Token key "caribbeangreen" kept to avoid breaking component classes)
      caribbeangreen: {
        5:   "#F4F0FF",  // lightest violet tint
        25:  "#E3D5FD",  // very light violet
        50:  "#D0BBFB",  // light violet
        100: "#7C3AED",  // Violet — secondary accent ← BRAND COLOR
        200: "#6B2FD4",  // medium-dark violet
        300: "#5A24BB",  // dark violet
        400: "#4919A2",  // deeper violet
        500: "#380E89",  // very deep violet
        600: "#270370",  // near-indigo
        700: "#180058",  // deepest violet
        800: "#0A0040",  // ultra deep
        900: "#020028",  // darkest
      },

      // Neutral navy-grey scale — subtle dividers, inactive states, muted containers
      brown: {
        5:   "#F0F2F8",  // near-white navy-grey
        25:  "#D8DCF0",  // very light
        50:  "#C0C6E8",  // light
        100: "#A8B0E0",  // medium-light
        200: "#909AD8",  // medium
        300: "#7884D0",  // medium-dark
        400: "#5C6AB8",  // dark
        500: "#4050A0",  // deeper
        600: "#2A3688",  // deep
        700: "#1A2470",  // very deep
        800: "#0E1458",  // near-navy
        900: "#060840",  // darkest navy-grey
      },

      // Violet-pink scale — secondary badges, alerts, gradient accents
      // (Token key "pink" kept to avoid breaking component classes)
      pink: {
        5:   "#F5F0FF",  // lightest violet-pink
        25:  "#E8D8FF",  // very light
        50:  "#DAC0FF",  // light
        100: "#CCA8FF",  // medium-light
        200: "#BE90FF",  // medium
        300: "#A060F0",  // medium-dark — violet-pink
        400: "#7C3AED",  // Violet (matches caribbeangreen-100) ← BRAND COLOR
        500: "#6B2FD4",  // dark
        600: "#5A24BB",  // deeper
        700: "#4919A2",  // very deep
        800: "#380E89",  // near-indigo
        900: "#270370",  // darkest
      },

      // Royal Blue action scale — CTA buttons (bg-yellow-50), active nav (text-yellow-25)
      // (Token key "yellow" kept so yellowButton class and active nav links auto-update)
      yellow: {
        5:   "#EBF2FF",  // lightest — subtle highlights
        25:  "#60A5FA",  // Sky Blue — active nav link color ← BRAND COLOR (sky)
        50:  "#2563EB",  // Royal Blue — CTA button background ← BRAND COLOR (primary)
        100: "#1D55D0",  // slightly darker — hover state
        200: "#1547B5",  // dark blue
        300: "#0D399A",  // deeper blue
        400: "#05287F",  // very deep
        500: "#001764",  // near-navy
        600: "#000649",  // darkest interactive
        700: "#00002E",  // ultra deep
        800: "#000013",  // near-black
        900: "#000000",  // black
      },

      // Light Grey tonal scale — light backgrounds, muted labels, form borders
      "pure-greys": {
        5:   "#F3F4F6",  // Light Grey ← BRAND COLOR (exact match)
        25:  "#E4E6ED",  // very light
        50:  "#D2D5E0",  // light
        100: "#BFC3D0",  // medium-light
        200: "#ACB1C0",  // medium
        300: "#9A9FB0",  // medium-dark
        400: "#878DA0",  // dark
        500: "#757B90",  // darker
        600: "#5E6478",  // deep
        700: "#474C60",  // very deep
        800: "#303548",  // near-dark
        900: "#1A1E30",  // darkest grey
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
