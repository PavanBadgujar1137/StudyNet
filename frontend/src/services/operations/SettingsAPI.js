import { toast } from "react-hot-toast"

import { setUser } from "../../slices/profileSlice"
import { apiConnector } from "../apiConnector"
import { settingsEndpoints } from "../apis"
import { logout } from "./authAPI"

const {
  UPDATE_DISPLAY_PICTURE_API,
  UPDATE_PROFILE_API,
  CHANGE_PASSWORD_API,
  DELETE_PROFILE_API,
} = settingsEndpoints

export function updateDisplayPicture(token, formData) {
  return async (dispatch) => {
    const toastId = toast.loading("Updating display picture...")
    try {
      const response = await apiConnector(
        "PUT",
        UPDATE_DISPLAY_PICTURE_API,
        formData,
        {
          Authorization: `Bearer ${token}`,
        }
      )

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Could not update display picture")
      }
      toast.success("Display Picture Updated Successfully", { id: toastId })
      dispatch(setUser(response.data.data))
    } catch (error) {
      console.log("UPDATE_DISPLAY_PICTURE_API API ERROR............", error)
      const errorMsg = error?.response?.data?.message || error?.message || "Could Not Update Display Picture"
      toast.error(errorMsg, { id: toastId })
    }
  }
}

export function updateProfile(token, formData) {
  return async (dispatch) => {
    const toastId = toast.loading("Updating profile...")
    try {
      const response = await apiConnector("PUT", UPDATE_PROFILE_API, formData, {
        Authorization: `Bearer ${token}`,
      })

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Could not update profile")
      }
      const userImage = response.data.updatedUserDetails.image
        ? response.data.updatedUserDetails.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.updatedUserDetails.firstName} ${response.data.updatedUserDetails.lastName}`
      dispatch(
        setUser({ ...response.data.updatedUserDetails, image: userImage })
      )
      toast.success("Profile Updated Successfully", { id: toastId })
    } catch (error) {
      console.log("UPDATE_PROFILE_API API ERROR............", error)
      const errorMsg = error?.response?.data?.message || error?.message || "Could Not Update Profile"
      toast.error(errorMsg, { id: toastId })
    }
  }
}

export async function changePassword(token, formData) {
  const toastId = toast.loading("Changing password...")
  try {
    const response = await apiConnector("POST", CHANGE_PASSWORD_API, formData, {
      Authorization: `Bearer ${token}`,
    })

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not change password")
    }
    toast.success("Password Changed Successfully", { id: toastId })
  } catch (error) {
    console.log("CHANGE_PASSWORD_API API ERROR............", error)
    const errorMsg = error?.response?.data?.message || error?.message || "Could Not Change Password"
    toast.error(errorMsg, { id: toastId })
  }
}

export function deleteProfile(token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Deleting account...")
    try {
      const response = await apiConnector("DELETE", DELETE_PROFILE_API, null, {
        Authorization: `Bearer ${token}`,
      })

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Could not delete profile")
      }
      toast.success("Profile Deleted Successfully", { id: toastId })
      dispatch(logout(navigate))
    } catch (error) {
      console.log("DELETE_PROFILE_API API ERROR............", error)
      const errorMsg = error?.response?.data?.message || error?.message || "Could Not Delete Profile"
      toast.error(errorMsg, { id: toastId })
    }
  }
}
