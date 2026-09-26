import { apiConnector } from '../apiConnector'
import toast from 'react-hot-toast'

export const getAllCourses = async () => {
  try {
    const res = await apiConnector('GET', '/api/v1/courses')
    if (res?.data?.success) return res.data.courses
  } catch (error) {
    console.error('getAllCourses error:', error)
  }
  return []
}

export const getCourseDetail = async (courseId, token = null) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const res = await apiConnector('GET', `/api/v1/courses/${courseId}`, null, headers)
    if (res?.data?.success) return res.data
  } catch (error) {
    console.error('getCourseDetail error:', error)
  }
  return null
}

export const getCourseVideos = async (courseId, token) => {
  try {
    const res = await apiConnector('GET', `/api/v1/courses/${courseId}/videos`, null, { Authorization: `Bearer ${token}` })
    if (res?.data?.success) return res.data.videos
    toast.error(res?.data?.message || 'Access restricted')
  } catch (error) {
    console.error('getCourseVideos error:', error)
    toast.error('Failed to load course videos')
  }
  return []
}

export const createCourse = async (token, formData) => {
  try {
    const res = await apiConnector('POST', '/api/v1/courses', formData, {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    })
    if (res?.data?.success) {
      toast.success('Course created successfully!')
      return res.data.course
    }
    toast.error(res?.data?.message || 'Failed to create course')
  } catch (error) {
    console.error('createCourse error:', error)
    toast.error('Failed to create course')
  }
  return null
}

export const addVideoToCourse = async (token, courseId, formData) => {
  try {
    const res = await apiConnector('POST', `/api/v1/courses/${courseId}/videos`, formData, {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    })
    if (res?.data?.success) {
      toast.success('Video uploaded successfully!')
      return res.data.video
    }
    toast.error(res?.data?.message || 'Video upload failed')
  } catch (error) {
    console.error('addVideoToCourse error:', error)
    toast.error('Video upload failed')
  }
  return null
}
