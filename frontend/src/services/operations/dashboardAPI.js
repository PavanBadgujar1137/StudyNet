import { apiConnector } from "../apiConnector"
import { profileEndpoints } from "../apis"
import toast from "react-hot-toast"

const { GET_CLIENT_DASHBOARD_API, GET_PRACTITIONER_DASHBOARD_API } = profileEndpoints

export const fetchClientDashboardData = async (token) => {
  try {
    const response = await apiConnector("GET", GET_CLIENT_DASHBOARD_API, null, {
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to load client dashboard")
    }
    return response.data.data
  } catch (error) {
    console.error("fetchClientDashboardData error:", error)
    toast.error("Could not load dashboard data")
    return null
  }
}

export const fetchPractitionerDashboardData = async (token) => {
  try {
    const response = await apiConnector("GET", GET_PRACTITIONER_DASHBOARD_API, null, {
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to load practitioner dashboard")
    }
    return response.data.data
  } catch (error) {
    console.error("fetchPractitionerDashboardData error:", error)
    toast.error("Could not load practitioner telemetry")
    return null
  }
}
