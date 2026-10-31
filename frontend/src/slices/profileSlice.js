import { createSlice } from "@reduxjs/toolkit"

let userVal = null
try {
  const storedUser = localStorage.getItem("user")
  if (storedUser) {
    userVal = JSON.parse(storedUser)
  }
} catch (e) {
  userVal = null
}

const initialState = {
  user: userVal,
  loading: false,
}

const profileSlice = createSlice({
  name: "profile",
  initialState: initialState,
  reducers: {
    setUser(state, value) {
      state.user = value.payload
      if (value.payload) {
        localStorage.setItem("user", JSON.stringify(value.payload))
      } else {
        localStorage.removeItem("user")
      }
    },
    setLoading(state, value) {
      state.loading = value.payload
    },
  },
})

export const { setUser, setLoading } = profileSlice.actions

export default profileSlice.reducer
