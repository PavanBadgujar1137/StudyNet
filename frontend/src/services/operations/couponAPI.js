import { apiConnector } from "../apiConnector"
import { couponEndpoints } from "../apis"
import toast from "react-hot-toast"

const {
  ADMIN_CREATE_COUPON_API,
  ADMIN_GET_ALL_COUPONS_API,
  ADMIN_UPDATE_COUPON_API,
  ADMIN_DELETE_COUPON_API,
  ADMIN_ANALYTICS_API,
  ADMIN_UPDATE_SETTINGS_API,
  ADMIN_USAGES_API,
  PRACTITIONER_CREATE_COUPON_API,
  PRACTITIONER_GET_MINE_API,
  PRACTITIONER_UPDATE_COUPON_API,
  PRACTITIONER_TOGGLE_COUPON_API,
  PRACTITIONER_DELETE_COUPON_API,
  LOOKUP_LEARNER_API,
  CREATE_LEARNER_DISCOUNT_API,
  GET_MY_LEARNER_DISCOUNTS_API,
  TOGGLE_LEARNER_DISCOUNT_API,
  DELETE_LEARNER_DISCOUNT_API,
  CALCULATE_CHECKOUT_DISCOUNTS_API,
  GET_MY_PERSONAL_DISCOUNT_API,
  ENROLL_FREE_DISCOUNT_COURSE_API,
  CONFIRM_FREE_DISCOUNT_BOOKING_API,
} = couponEndpoints

// ─── ADMIN OPERATIONS ─────────────────────────────────────────────────────────

export const createAdminCoupon = async (data, token) => {
  try {
    const res = await apiConnector("POST", ADMIN_CREATE_COUPON_API, data, {
      Authorization: `Bearer ${token}`,
    })
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to create coupon")
    toast.success(res.data.message || "Admin coupon created successfully")
    return res.data
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message || "Failed to create coupon")
    return null
  }
}

export const getAllAdminCoupons = async (params, token) => {
  try {
    const query = new URLSearchParams(params || {}).toString()
    const res = await apiConnector("GET", `${ADMIN_GET_ALL_COUPONS_API}?${query}`, null, {
      Authorization: `Bearer ${token}`,
    })
    return res?.data || { coupons: [], total: 0 }
  } catch (error) {
    toast.error("Failed to load coupons")
    return { coupons: [], total: 0 }
  }
}

export const updateAdminCoupon = async (couponId, data, token) => {
  try {
    const res = await apiConnector("PUT", `${ADMIN_UPDATE_COUPON_API}/${couponId}`, data, {
      Authorization: `Bearer ${token}`,
    })
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to update coupon")
    toast.success(res.data.message || "Coupon updated successfully")
    return res.data
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message || "Failed to update coupon")
    return null
  }
}

export const deleteAdminCoupon = async (couponId, token) => {
  try {
    const res = await apiConnector("DELETE", `${ADMIN_DELETE_COUPON_API}/${couponId}`, null, {
      Authorization: `Bearer ${token}`,
    })
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to delete coupon")
    toast.success(res.data.message || "Coupon deleted")
    return res.data
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message || "Failed to delete coupon")
    return null
  }
}

export const getAdminCouponAnalytics = async (token) => {
  try {
    const res = await apiConnector("GET", ADMIN_ANALYTICS_API, null, {
      Authorization: `Bearer ${token}`,
    })
    return res?.data || null
  } catch (error) {
    return null
  }
}

export const updateCouponSettings = async (data, token) => {
  try {
    const res = await apiConnector("POST", ADMIN_UPDATE_SETTINGS_API, data, {
      Authorization: `Bearer ${token}`,
    })
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to update settings")
    toast.success(res.data.message || "Settings updated")
    return res.data
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message || "Failed to update settings")
    return null
  }
}

export const getAllCouponUsages = async (params, token) => {
  try {
    const query = new URLSearchParams(params || {}).toString()
    const res = await apiConnector("GET", `${ADMIN_USAGES_API}?${query}`, null, {
      Authorization: `Bearer ${token}`,
    })
    return res?.data?.usages || []
  } catch (error) {
    return []
  }
}

// ─── PRACTITIONER OPERATIONS ──────────────────────────────────────────────────

export const createPractitionerCoupon = async (data, token) => {
  try {
    const res = await apiConnector("POST", PRACTITIONER_CREATE_COUPON_API, data, {
      Authorization: `Bearer ${token}`,
    })
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to create coupon")
    toast.success(res.data.message || "Practitioner coupon created successfully")
    return res.data
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message || "Failed to create coupon")
    return null
  }
}

export const getMyPractitionerCoupons = async (token) => {
  try {
    const res = await apiConnector("GET", PRACTITIONER_GET_MINE_API, null, {
      Authorization: `Bearer ${token}`,
    })
    return res?.data || { coupons: [], stats: {} }
  } catch (error) {
    return { coupons: [], stats: {} }
  }
}

export const updatePractitionerCoupon = async (couponId, data, token) => {
  try {
    const res = await apiConnector("PUT", `${PRACTITIONER_UPDATE_COUPON_API}/${couponId}`, data, {
      Authorization: `Bearer ${token}`,
    })
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to update coupon")
    toast.success(res.data.message || "Coupon updated")
    return res.data
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message || "Failed to update coupon")
    return null
  }
}

export const toggleCouponStatus = async (couponId, token) => {
  try {
    const res = await apiConnector("PATCH", `${PRACTITIONER_TOGGLE_COUPON_API}/${couponId}`, null, {
      Authorization: `Bearer ${token}`,
    })
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to toggle status")
    toast.success(res.data.message)
    return res.data
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message || "Failed to toggle status")
    return null
  }
}

export const deletePractitionerCoupon = async (couponId, token) => {
  try {
    const res = await apiConnector("DELETE", `${PRACTITIONER_DELETE_COUPON_API}/${couponId}`, null, {
      Authorization: `Bearer ${token}`,
    })
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to delete coupon")
    toast.success(res.data.message || "Coupon deleted")
    return res.data
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message || "Failed to delete coupon")
    return null
  }
}

// ─── LEARNER PERSONAL DISCOUNT & LOOKUP OPERATIONS ────────────────────────────

export const lookupLearnerById = async (learnerId, token) => {
  try {
    const res = await apiConnector(
      "POST",
      LOOKUP_LEARNER_API,
      { learnerId },
      { Authorization: `Bearer ${token}` }
    )
    if (!res?.data?.success) {
      throw new Error(res?.data?.message || "Learner not found")
    }
    return res.data
  } catch (error) {
    console.error("LOOKUP_LEARNER_API ERROR:", error)
    return {
      success: false,
      message: error?.response?.data?.message || error.message || "Failed to look up learner",
    }
  }
}

export const createLearnerDiscount = async (data, token) => {
  try {
    const res = await apiConnector("POST", CREATE_LEARNER_DISCOUNT_API, data, {
      Authorization: `Bearer ${token}`,
    })
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to grant discount")
    toast.success(res.data.message || "Personal discount granted successfully")
    return res.data
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message || "Failed to grant discount")
    return null
  }
}

export const getMyLearnerDiscounts = async (token) => {
  try {
    const res = await apiConnector("GET", GET_MY_LEARNER_DISCOUNTS_API, null, {
      Authorization: `Bearer ${token}`,
    })
    return res?.data?.discounts || []
  } catch (error) {
    return []
  }
}

export const toggleLearnerDiscount = async (discountId, token) => {
  try {
    const res = await apiConnector("PATCH", `${TOGGLE_LEARNER_DISCOUNT_API}/${discountId}`, null, {
      Authorization: `Bearer ${token}`,
    })
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to toggle")
    toast.success(res.data.message)
    return res.data
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message || "Failed to toggle")
    return null
  }
}

export const deleteLearnerDiscount = async (discountId, token) => {
  try {
    const res = await apiConnector("DELETE", `${DELETE_LEARNER_DISCOUNT_API}/${discountId}`, null, {
      Authorization: `Bearer ${token}`,
    })
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to delete")
    toast.success(res.data.message || "Personal discount deleted")
    return res.data
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message || "Failed to delete")
    return null
  }
}

// ─── CHECKOUT & VALIDATION ENGINE OPERATIONS ──────────────────────────────────

export const calculateCheckoutDiscounts = async (data, token) => {
  try {
    const res = await apiConnector("POST", CALCULATE_CHECKOUT_DISCOUNTS_API, data, {
      Authorization: `Bearer ${token}`,
    })
    return res?.data || null
  } catch (error) {
    return null
  }
}

export const getMyPersonalDiscount = async (params, token) => {
  try {
    const query = new URLSearchParams(params || {}).toString()
    const res = await apiConnector("GET", `${GET_MY_PERSONAL_DISCOUNT_API}?${query}`, null, {
      Authorization: `Bearer ${token}`,
    })
    return res?.data || null
  } catch (error) {
    return null
  }
}

export const enrollFreeDiscountCourse = async (data, token) => {
  try {
    const res = await apiConnector("POST", ENROLL_FREE_DISCOUNT_COURSE_API, data, {
      Authorization: `Bearer ${token}`,
    })
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to unlock course")
    toast.success(res.data.message || "Course unlocked successfully!")
    return res.data
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message || "Failed to unlock course")
    return null
  }
}

export const confirmFreeDiscountBooking = async (data, token) => {
  try {
    const res = await apiConnector("POST", CONFIRM_FREE_DISCOUNT_BOOKING_API, data, {
      Authorization: `Bearer ${token}`,
    })
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to confirm session")
    toast.success(res.data.message || "Session booked successfully!")
    return res.data
  } catch (error) {
    toast.error(error?.response?.data?.message || error.message || "Failed to book session")
    return null
  }
}
