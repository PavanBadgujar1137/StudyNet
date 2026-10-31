import { apiConnector } from "../apiConnector"
import { noteEndpoints } from "../apis"
import toast from "react-hot-toast"

const {
  UPLOAD_NOTE_API,
  GET_NOTES_BY_COURSE_API,
  TRACK_DOWNLOAD_API,
} = noteEndpoints

export const uploadNote = async (token, formData) => {
  const toastId = toast.loading("Uploading study material...")
  try {
    const response = await apiConnector("POST", UPLOAD_NOTE_API, formData, {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    })
    if (!response?.data?.success) throw new Error(response?.data?.message)
    toast.success("Study material uploaded!", { id: toastId })
    return response.data.data
  } catch (error) {
    console.error("uploadNote error:", error)
    toast.error(error.message || "Failed to upload file", { id: toastId })
    return null
  }
}

export const getNotesByCourse = async (token, courseId) => {
  try {
    const response = await apiConnector("GET", `${GET_NOTES_BY_COURSE_API}/${courseId}`, null, {
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) throw new Error(response?.data?.message)
    return response.data.data
  } catch (error) {
    console.error("getNotesByCourse error:", error)
    return []
  }
}

export const trackDownload = async (token, noteId) => {
  try {
    const response = await apiConnector("POST", `${TRACK_DOWNLOAD_API}/${noteId}/download`, {}, {
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) throw new Error(response?.data?.message)
    return response.data.data
  } catch (error) {
    console.error("trackDownload error:", error)
    return null
  }
}
