import { toast } from "react-hot-toast"

import { setUser } from "../../slices/profileSlice"
import { apiConnector } from "../apiConnector"
import { settingsEndpoints } from "../apis"

const {
  UPDATE_DISPLAY_PICTURE_API,
  DELETE_DISPLAY_PICTURE_API,
  UPDATE_PROFILE_API,
  CHANGE_PASSWORD_API,
  DELETE_PROFILE_API,
  GET_NOTIFICATION_PREFERENCES_API,
  UPDATE_NOTIFICATION_PREFERENCES_API,
  SEND_TEST_NOTIFICATION_API,
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

export function deleteDisplayPicture(token) {
  return async (dispatch) => {
    const toastId = toast.loading("Removing profile picture...")
    try {
      const response = await apiConnector(
        "DELETE",
        DELETE_DISPLAY_PICTURE_API,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      )

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Could not remove profile picture")
      }
      toast.success("Profile picture removed successfully", { id: toastId })
      dispatch(setUser(response.data.data))
    } catch (error) {
      console.log("DELETE_DISPLAY_PICTURE_API API ERROR............", error)
      const errorMsg = error?.response?.data?.message || error?.message || "Could Not Remove Profile Picture"
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
      const userImage = (response.data.updatedUserDetails.image && !response.data.updatedUserDetails.image.includes('dicebear'))
        ? response.data.updatedUserDetails.image
        : ''
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

export function deleteProfile(token, onSuccess) {
  return async (dispatch) => {
    const toastId = toast.loading("Processing deletion request...")
    try {
      const response = await apiConnector("DELETE", DELETE_PROFILE_API, null, {
        Authorization: `Bearer ${token}`,
      })

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Could not schedule account deletion")
      }
      toast.dismiss(toastId)
      if (typeof onSuccess === "function") {
        onSuccess(response.data)
      }
      return response.data
    } catch (error) {
      console.log("DELETE_PROFILE_API API ERROR............", error)
      const errorMsg = error?.response?.data?.message || error?.message || "Could Not Delete Profile"
      toast.error(errorMsg, { id: toastId })
      throw error
    }
  }
}

export async function getNotificationPreferences(token) {
  try {
    const response = await apiConnector(
      "GET",
      GET_NOTIFICATION_PREFERENCES_API,
      null,
      { Authorization: `Bearer ${token}` }
    )
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not fetch notification preferences")
    }
    return response.data.data
  } catch (error) {
    console.error("getNotificationPreferences error:", error)
    return null
  }
}

export function updateNotificationPreferences(token, data) {
  return async (dispatch) => {
    const toastId = toast.loading("Saving notification preferences...")
    try {
      const response = await apiConnector(
        "PUT",
        UPDATE_NOTIFICATION_PREFERENCES_API,
        data,
        { Authorization: `Bearer ${token}` }
      )

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Could not update notification preferences")
      }

      if (response.data.data) {
        const userImage = (response.data.data.image && !response.data.data.image.includes('dicebear'))
          ? response.data.data.image
          : ''
        dispatch(setUser({ ...response.data.data, image: userImage }))
      }

      toast.success("Notification preferences saved!", { id: toastId })
      return response.data
    } catch (error) {
      console.error("updateNotificationPreferences error:", error)
      const errorMsg = error?.response?.data?.message || error?.message || "Failed to save preferences"
      toast.error(errorMsg, { id: toastId })
      throw error
    }
  }
}

export async function sendTestNotification(token, channel = "all") {
  const toastId = toast.loading(`Sending test ${channel} notification...`)
  try {
    const response = await apiConnector(
      "POST",
      SEND_TEST_NOTIFICATION_API,
      { channel },
      { Authorization: `Bearer ${token}` }
    )

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Test notification failed")
    }

    toast.success("Test notification dispatched! Check your device.", { id: toastId, duration: 4500 })
    return response.data
  } catch (error) {
    console.error("sendTestNotification error:", error)
    const errorMsg = error?.response?.data?.message || error?.message || "Could not send test notification"
    toast.error(errorMsg, { id: toastId })
    throw error
  }
}

