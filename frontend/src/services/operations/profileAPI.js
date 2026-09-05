import { toast } from "react-hot-toast"

import { setLoading, setUser } from "../../slices/profileSlice"
import { apiConnector } from "../apiConnector"
import { profileEndpoints } from "../apis"
import { logout } from "./authAPI"
import { getInitialsAvatar } from "../../utils/getInitialsAvatar"

const {
  GET_USER_DETAILS_API,
} = profileEndpoints

export function getUserDetails(token, navigate) {
  return async (dispatch) => {
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("GET", GET_USER_DETAILS_API, null, {
        Authorization: `Bearer ${token}`,
      })
      console.log("GET_USER_DETAILS API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      const userImage = (response.data.data.image && !response.data.data.image.includes("dicebear"))
        ? response.data.data.image
        : getInitialsAvatar(response.data.data.firstName, response.data.data.lastName)
      dispatch(setUser({ ...response.data.data, image: userImage }))
    } catch (error) {
      console.log("GET_USER_DETAILS API ERROR............", error)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        dispatch(logout(navigate, false))
        toast.error("Session expired. Please log in again.", { id: "session-expired-toast" })
      }
    }
    dispatch(setLoading(false))
  }
}
