import { combineReducers } from "@reduxjs/toolkit"

import authReducer from "../slices/authSlice"
import profileReducer from "../slices/profileSlice"
import liveClassReducer from "../slices/liveClassSlice"

const appReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  liveClass: liveClassReducer,
})

/**
 * Root reducer wraps the combined reducer.
 * On the special "auth/RESET_ALL_STATE" action it passes `undefined` as state
 * to every slice, which forces them all back to their initialState.
 * This is the only reliable way to flush ALL Redux-cached dashboard data
 * when a user switches between Learner and Practitioner accounts.
 */
const rootReducer = (state, action) => {
  if (action.type === "auth/RESET_ALL_STATE") {
    // Pass undefined so every slice rehydrates from its own initialState
    return appReducer(undefined, action)
  }
  return appReducer(state, action)
}

export default rootReducer
