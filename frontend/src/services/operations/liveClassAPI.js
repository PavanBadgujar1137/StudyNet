import { apiConnector } from "../apiConnector"
import { liveClassEndpoints } from "../apis"
import toast from "react-hot-toast"

const {
  SCHEDULE_CLASS_API,
  GET_UPCOMING_API,
  GET_INSTRUCTOR_SCHEDULE_API,
  GET_CLASS_BY_ID_API,
  START_CLASS_API,
  END_CLASS_API,
  JOIN_CLASS_API,
  LEAVE_CLASS_API,
  RESCHEDULE_CLASS_API,
  CANCEL_CLASS_API,
  PUBLISH_RECORDING_API,
} = liveClassEndpoints

// ── Instructor ────────────────────────────────────────────────────────────────

export const scheduleLiveClass = async (token, data) => {
  const toastId = toast.loading("Scheduling class...")
  try {
    const response = await apiConnector("POST", SCHEDULE_CLASS_API, data, {
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) throw new Error(response?.data?.message)
    toast.success(response.data.message || "Class scheduled!", { id: toastId })
    return response.data.data
  } catch (error) {
    toast.error(error.message || "Failed to schedule class", { id: toastId })
    return null
  }
}

export const getInstructorSchedule = async (token, from, to) => {
  try {
    const params = new URLSearchParams({ from: from || "", to: to || "" }).toString()
    const response = await apiConnector(
      "GET",
      `${GET_INSTRUCTOR_SCHEDULE_API}?${params}`,
      null,
      { Authorization: `Bearer ${token}` }
    )
    if (!response?.data?.success) throw new Error(response?.data?.message)
    return { classes: response.data.data, stats: response.data.stats }
  } catch (error) {
    console.error("getInstructorSchedule error:", error)
    return { classes: [], stats: {} }
  }
}

export const startClass = async (token, classId) => {
  const toastId = toast.loading("Starting class...")
  try {
    const response = await apiConnector("POST", `${START_CLASS_API}/${classId}/start`, {}, {
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) throw new Error(response?.data?.message)
    toast.success("Class is now LIVE!", { id: toastId })
    return response.data.data
  } catch (error) {
    toast.error(error.message || "Failed to start class", { id: toastId })
    return null
  }
}

export const endClass = async (token, classId) => {
  const toastId = toast.loading("Ending class...")
  try {
    const response = await apiConnector("POST", `${END_CLASS_API}/${classId}/end`, {}, {
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) throw new Error(response?.data?.message)
    toast.success("Class ended.", { id: toastId })
    return true
  } catch (error) {
    toast.error(error.message || "Failed to end class", { id: toastId })
    return false
  }
}

export const rescheduleClass = async (token, classId, scheduledStart, scheduledEnd) => {
  const toastId = toast.loading("Rescheduling...")
  try {
    const response = await apiConnector(
      "POST",
      `${RESCHEDULE_CLASS_API}/${classId}/reschedule`,
      { scheduledStart, scheduledEnd },
      { Authorization: `Bearer ${token}` }
    )
    if (!response?.data?.success) throw new Error(response?.data?.message)
    toast.success("Class rescheduled. Students notified.", { id: toastId })
    return response.data.data
  } catch (error) {
    toast.error(error.message || "Failed to reschedule", { id: toastId })
    return null
  }
}

export const cancelClass = async (token, classId) => {
  const toastId = toast.loading("Cancelling class...")
  try {
    const response = await apiConnector("POST", `${CANCEL_CLASS_API}/${classId}/cancel`, {}, {
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) throw new Error(response?.data?.message)
    toast.success("Class cancelled. Students notified.", { id: toastId })
    return true
  } catch (error) {
    toast.error(error.message || "Failed to cancel class", { id: toastId })
    return false
  }
}

export const publishRecording = async (token, classId, recordingUrl) => {
  const toastId = toast.loading("Publishing recording...")
  try {
    const response = await apiConnector(
      "POST",
      `${PUBLISH_RECORDING_API}/${classId}/publish-recording`,
      { recordingUrl },
      { Authorization: `Bearer ${token}` }
    )
    if (!response?.data?.success) throw new Error(response?.data?.message)
    toast.success("Recording published!", { id: toastId })
    return response.data.data
  } catch (error) {
    toast.error(error.message || "Failed to publish recording", { id: toastId })
    return null
  }
}

// ── Student ───────────────────────────────────────────────────────────────────

export const getUpcomingClasses = async (token) => {
  try {
    const response = await apiConnector("GET", GET_UPCOMING_API, null, {
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) throw new Error(response?.data?.message)
    return response.data.data
  } catch (error) {
    console.error("getUpcomingClasses error:", error)
    return []
  }
}

export const joinClass = async (token, classId) => {
  try {
    const response = await apiConnector("POST", `${JOIN_CLASS_API}/${classId}/join`, {}, {
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) {
      toast.error(response?.data?.message || "Cannot join class yet.")
      return null
    }
    return response.data.data
  } catch (error) {
    toast.error(error.message || "Failed to join class")
    return null
  }
}

export const leaveClass = async (token, classId) => {
  try {
    await apiConnector("POST", `${LEAVE_CLASS_API}/${classId}/leave`, {}, {
      Authorization: `Bearer ${token}`,
    })
  } catch (_) {}
}

export const getClassById = async (token, classId) => {
  try {
    const response = await apiConnector("GET", `${GET_CLASS_BY_ID_API}/${classId}`, null, {
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) throw new Error(response?.data?.message)
    return response.data.data
  } catch (error) {
    console.error("getClassById error:", error)
    return null
  }
}
