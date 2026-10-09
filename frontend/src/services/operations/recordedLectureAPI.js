import { apiConnector } from "../apiConnector"
import { lectureEndpoints } from "../apis"
import toast from "react-hot-toast"

const {
  CREATE_LECTURE_API,
  GET_LECTURES_BY_COURSE_API,
  GET_LECTURE_PLAYBACK_API,
} = lectureEndpoints

export const createRecordedLecture = async (token, formData) => {
  const toastId = toast.loading("Publishing lecture...")
  try {
    const response = await apiConnector("POST", CREATE_LECTURE_API, formData, {
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) throw new Error(response?.data?.message)
    toast.success("Lecture published successfully!", { id: toastId })
    return response.data.data
  } catch (error) {
    console.error("createRecordedLecture error:", error)
    toast.error(error.message || "Failed to publish lecture", { id: toastId })
    return null
  }
}

export const getLecturesByCourse = async (token, courseId) => {
  try {
    const response = await apiConnector("GET", `${GET_LECTURES_BY_COURSE_API}/${courseId}`, null, {
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) throw new Error(response?.data?.message)
    return response.data.data
  } catch (error) {
    console.error("getLecturesByCourse error:", error)
    return []
  }
}

export const getLecturePlayback = async (token, lectureId) => {
  try {
    const response = await apiConnector("GET", `${GET_LECTURE_PLAYBACK_API}/${lectureId}/playback`, null, {
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) throw new Error(response?.data?.message)
    return response.data.data
  } catch (error) {
    console.error("getLecturePlayback error:", error)
    toast.error(error.message || "Could not fetch playback details")
    return null
  }
}
