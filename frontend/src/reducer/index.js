import { combineReducers } from "@reduxjs/toolkit"

import authReducer from "../slices/authSlice"
import profileReducer from "../slices/profileSlice"
import liveClassReducer from "../slices/liveClassSlice"

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  liveClass: liveClassReducer,
})

export default rootReducer


