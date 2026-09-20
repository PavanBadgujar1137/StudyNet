const BASE_URL =
  process.env.REACT_APP_BASE_URL || "http://localhost:4000/api/v1"

// AUTH ENDPOINTS
export const endpoints = {
  SENDOTP_API: BASE_URL + "/auth/sendotp",
  SIGNUP_API: BASE_URL + "/auth/signup",
  LOGIN_API: BASE_URL + "/auth/login",
  SOCIAL_LOGIN_API: BASE_URL + "/auth/social-login",
  RESETPASSTOKEN_API: BASE_URL + "/auth/reset-password-token",
  RESETPASSWORD_API: BASE_URL + "/auth/reset-password",
}

// PROFILE ENDPOINTS
export const profileEndpoints = {
  GET_USER_DETAILS_API: BASE_URL + "/profile/getUserDetails",
  GET_CLIENT_DASHBOARD_API: BASE_URL + "/profile/client-dashboard",
  GET_PRACTITIONER_DASHBOARD_API: BASE_URL + "/profile/practitioner-dashboard",
}
// CONTACT-US API
export const contactusEndpoint = {
  CONTACT_US_API: BASE_URL + "/reach/contact",
}

// SETTINGS PAGE API
export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: BASE_URL + "/profile/updateDisplayPicture",
  DELETE_DISPLAY_PICTURE_API: BASE_URL + "/profile/deleteDisplayPicture",
  UPDATE_PROFILE_API: BASE_URL + "/profile/updateProfile",
  CHANGE_PASSWORD_API: BASE_URL + "/auth/changepassword",
  DELETE_PROFILE_API: BASE_URL + "/profile/deleteProfile",
}

// LIVE CLASS ENDPOINTS (Phase 2)
export const liveClassEndpoints = {
  SCHEDULE_CLASS_API: BASE_URL + "/live/schedule",
  GET_UPCOMING_API: BASE_URL + "/live/upcoming",
  GET_INSTRUCTOR_SCHEDULE_API: BASE_URL + "/live/instructor/schedule",
  GET_CLASS_BY_ID_API: BASE_URL + "/live",                // + "/:classId"
  START_CLASS_API: BASE_URL + "/live",                    // + "/:classId/start"
  END_CLASS_API: BASE_URL + "/live",                      // + "/:classId/end"
  JOIN_CLASS_API: BASE_URL + "/live",                     // + "/:classId/join"
  LEAVE_CLASS_API: BASE_URL + "/live",                    // + "/:classId/leave"
  RESCHEDULE_CLASS_API: BASE_URL + "/live",               // + "/:classId/reschedule"
  CANCEL_CLASS_API: BASE_URL + "/live",                   // + "/:classId/cancel"
  PUBLISH_RECORDING_API: BASE_URL + "/live",              // + "/:classId/publish-recording"
}

// LECTURE ENDPOINTS (Phase 3)
export const lectureEndpoints = {
  CREATE_LECTURE_API: BASE_URL + "/lecture/create",
  GET_LECTURES_BY_COURSE_API: BASE_URL + "/lecture/course", // + "/:courseId"
  GET_LECTURE_PLAYBACK_API: BASE_URL + "/lecture",          // + "/:lectureId/playback"
}

// NOTE ENDPOINTS (Phase 3)
export const noteEndpoints = {
  UPLOAD_NOTE_API: BASE_URL + "/note/upload",
  GET_NOTES_BY_COURSE_API: BASE_URL + "/note/course",       // + "/:courseId"
  TRACK_DOWNLOAD_API: BASE_URL + "/note",                   // + "/:noteId/download"
}

// CHAT ENDPOINTS
export const chatEndpoints = {
  GET_GLOBAL_CHAT_API: BASE_URL + "/chat/global",
  SEND_GLOBAL_CHAT_API: BASE_URL + "/chat/global",
  GET_GROUP_CHAT_API: BASE_URL + "/chat/group",           // + "/:practitionerId"
  SEND_GROUP_CHAT_API: BASE_URL + "/chat/group",          // + "/:practitionerId"
  GET_DIRECT_CHAT_API: BASE_URL + "/chat/direct",         // + "/:targetUserId"
  SEND_DIRECT_CHAT_API: BASE_URL + "/chat/direct",        // + "/:targetUserId"
  GET_CHAT_CONTACTS_API: BASE_URL + "/chat/contacts",
  PRESIGN_CHAT_MEDIA_API: BASE_URL + "/chat/presign-media",
}

// SOCIAL POST ENDPOINTS
export const socialPostEndpoints = {
  CREATE_POST_API: BASE_URL + "/social-posts/create",
  GET_POSTS_API: BASE_URL + "/social-posts/mine",
  PUBLISH_POST_API: BASE_URL + "/social-posts", // + "/:postId/publish"
  DELETE_POST_API: BASE_URL + "/social-posts",  // + "/:postId"
  GET_ACCOUNTS_API: BASE_URL + "/social-posts/accounts",
  TOGGLE_ACCOUNT_API: BASE_URL + "/social-posts/accounts/toggle",
  TRACK_SHARE_API: BASE_URL + "/social-posts", // + "/:postId/track-share"
}

// ADMIN ENDPOINTS
export const adminEndpoints = {
  DELETE_USER_ADMIN_API: BASE_URL + "/admin/users",
}

// COUPON & DISCOUNT ENDPOINTS
export const couponEndpoints = {
  // Admin
  ADMIN_CREATE_COUPON_API: BASE_URL + "/coupons/admin/create",
  ADMIN_GET_ALL_COUPONS_API: BASE_URL + "/coupons/admin/all",
  ADMIN_UPDATE_COUPON_API: BASE_URL + "/coupons/admin", // + /:couponId
  ADMIN_DELETE_COUPON_API: BASE_URL + "/coupons/admin", // + /:couponId
  ADMIN_ANALYTICS_API: BASE_URL + "/coupons/admin/analytics",
  ADMIN_UPDATE_SETTINGS_API: BASE_URL + "/coupons/admin/settings",
  ADMIN_USAGES_API: BASE_URL + "/coupons/admin/usages",

  // Practitioner
  PRACTITIONER_CREATE_COUPON_API: BASE_URL + "/coupons/practitioner/create",
  PRACTITIONER_GET_MINE_API: BASE_URL + "/coupons/practitioner/mine",
  PRACTITIONER_UPDATE_COUPON_API: BASE_URL + "/coupons/practitioner", // + /:couponId
  PRACTITIONER_TOGGLE_COUPON_API: BASE_URL + "/coupons/toggle", // + /:couponId
  PRACTITIONER_DELETE_COUPON_API: BASE_URL + "/coupons/practitioner", // + /:couponId

  // Learner Personal Discount
  CREATE_LEARNER_DISCOUNT_API: BASE_URL + "/coupons/learner-discount/create",
  GET_MY_LEARNER_DISCOUNTS_API: BASE_URL + "/coupons/learner-discount/mine",
  TOGGLE_LEARNER_DISCOUNT_API: BASE_URL + "/coupons/learner-discount/toggle", // + /:discountId
  DELETE_LEARNER_DISCOUNT_API: BASE_URL + "/coupons/learner-discount", // + /:discountId

  // Checkout & Validation Engine
  CALCULATE_CHECKOUT_DISCOUNTS_API: BASE_URL + "/coupons/calculate-checkout",
  GET_MY_PERSONAL_DISCOUNT_API: BASE_URL + "/coupons/my-personal-discount",
  ENROLL_FREE_DISCOUNT_COURSE_API: BASE_URL + "/payments/enroll-free-discount-course",
  CONFIRM_FREE_DISCOUNT_BOOKING_API: BASE_URL + "/payments/confirm-free-discount-booking",
}

// SOCKET BASE URL (for Socket.io client)
export const SOCKET_BASE_URL = process.env.REACT_APP_BASE_URL
  ? process.env.REACT_APP_BASE_URL.replace("/api/v1", "")
  : "http://localhost:4000"




