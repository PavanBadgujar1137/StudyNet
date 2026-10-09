import { toast } from "react-hot-toast"

import { setLoading, setUser } from "../../slices/profileSlice"
import { apiConnector } from "../apiConnector"
import { profileEndpoints } from "../apis"
import { clearAllCache } from "../../utils/clearAllCache"
import { getInitialsAvatar } from "../../utils/getInitialsAvatar"

const {
  GET_USER_DETAILS_API,
} = profileEndpoints

export function getUserDetails(token, navigate) {
  return async (dispatch, getState) => {
    const currentUser = getState()?.profile?.user
    if (!currentUser) {
      dispatch(setLoading(true))
    }
    try {
      const response = await apiConnector("GET", GET_USER_DETAILS_API, null, {
        Authorization: `Bearer ${token}`,
      })

      if (!response?.data?.success || !response?.data?.data) {
        throw new Error(response?.data?.message || "Failed to fetch user details")
      }
      const userData = response.data.data
      const userImage = (userData.image && !userData.image.includes("dicebear"))
        ? userData.image
        : getInitialsAvatar(userData.firstName, userData.lastName)
      dispatch(setUser({ ...userData, image: userImage }))
    } catch (error) {
      console.log("GET_USER_DETAILS API ERROR............", error)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        // Session expired — nuke everything and force re-login
        await clearAllCache()
        dispatch({ type: "auth/RESET_ALL_STATE" })
        toast.error("Session expired. Please log in again.", { id: "session-expired-toast" })
        // Hard reload to "/" — clears all in-memory state
        window.location.href = "/"
      }
    } finally {
      dispatch(setLoading(false))
    }
  }
}

