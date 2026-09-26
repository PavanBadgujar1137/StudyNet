import { createSlice } from "@reduxjs/toolkit";

// ── Session version guard ────────────────────────────────────────────────────
// Bump this version string whenever you make breaking changes to the user
// schema or localStorage structure. On next load, stale data is auto-wiped.
const SESSION_VERSION = "oh_v3"

function getValidatedToken() {
  try {
    // Check session version — wipe if outdated or missing
    const savedVersion = localStorage.getItem("oh_session_version")
    if (savedVersion !== SESSION_VERSION) {
      // Stale session — clear all user data silently
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      localStorage.setItem("oh_session_version", SESSION_VERSION)
      return null
    }
    const storedToken = localStorage.getItem("token")
    if (!storedToken) return null
    try {
      return JSON.parse(storedToken)
    } catch {
      return storedToken // plain JWT string fallback
    }
  } catch (e) {
    return null
  }
}

// Stamp the version on first load
try {
  if (!localStorage.getItem("oh_session_version")) {
    localStorage.setItem("oh_session_version", SESSION_VERSION)
  }
} catch (e) {}

const initialState = {
  signupData: null,
  loading: false,
  token: getValidatedToken(),
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setSignupData(state, value) {
      state.signupData = value.payload;
    },
    setLoading(state, value) {
      state.loading = value.payload;
    },
    setToken(state, value) {
      state.token = value.payload;
      if (value.payload) {
        localStorage.setItem("token", JSON.stringify(value.payload));
        localStorage.setItem("oh_session_version", SESSION_VERSION);
      } else {
        localStorage.removeItem("token");
      }
    },
  },
});

export const { setSignupData, setLoading, setToken } = authSlice.actions;

export default authSlice.reducer;
