import { apiConnector } from "../apiConnector"
import { profileEndpoints } from "../apis"

const { GET_CLIENT_DASHBOARD_API, GET_PRACTITIONER_DASHBOARD_API } = profileEndpoints

export const fetchClientDashboardData = async (token) => {
  if (!token) return null
  try {
    const response = await apiConnector("GET", GET_CLIENT_DASHBOARD_API, null, {
      Authorization: `Bearer ${token}`,
    })
    if (response?.data?.success && response?.data?.data) {
      return response.data.data
    }
    return {
      checkIns: [],
      reflections: [],
      upcomingClasses: [],
      joinedCircles: [],
      milestones: [],
      streak: 0,
      checkInCount: 0,
    }
  } catch (error) {
    console.error("fetchClientDashboardData error:", error)
    return {
      checkIns: [],
      reflections: [],
      upcomingClasses: [],
      joinedCircles: [],
      milestones: [],
      streak: 0,
      checkInCount: 0,
    }
  }
}

export const fetchPractitionerDashboardData = async (token) => {
  if (!token) return null
  try {
    const response = await apiConnector("GET", GET_PRACTITIONER_DASHBOARD_API, null, {
      Authorization: `Bearer ${token}`,
    })
    if (response?.data?.success && response?.data?.data) {
      return response.data.data
    }
    return null
  } catch (error) {
    console.error("fetchPractitionerDashboardData error:", error)
    return null
  }
}
