import { createSlice } from "@reduxjs/toolkit";

// Safely parse local storage token
let tokenVal = null;
try {
  const storedToken = localStorage.getItem("token");
  if (storedToken) {
    tokenVal = JSON.parse(storedToken);
  }
} catch (e) {
  // If parsing fails (e.g. it's a plain JWT string), fall back to using it directly
  const storedToken = localStorage.getItem("token");
  if (storedToken) {
    tokenVal = storedToken;
  }
}

const initialState = {
  signupData: null,
  loading: false,
  token: tokenVal,
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
    },
  },
});

export const { setSignupData, setLoading, setToken } = authSlice.actions;

export default authSlice.reducer;
