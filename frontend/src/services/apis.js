const BASE_URL =
  process.env.REACT_APP_BASE_URL || "http://localhost:4000/api/v1"

// AUTH ENDPOINTS
export const endpoints = {
  SENDOTP_API: BASE_URL + "/auth/sendotp",
  SIGNUP_API: BASE_URL + "/auth/signup",
  LOGIN_API: BASE_URL + "/auth/login",
  RESETPASSTOKEN_API: BASE_URL + "/auth/reset-password-token",
  RESETPASSWORD_API: BASE_URL + "/auth/reset-password",
}

// PROFILE ENDPOINTS
export const profileEndpoints = {
  GET_USER_DETAILS_API: BASE_URL + "/profile/getUserDetails",
  GET_USER_ENROLLED_COURSES_API: BASE_URL + "/profile/getEnrolledCourses",
  GET_INSTRUCTOR_DATA_API: BASE_URL + "/profile/instructorDashboard",
}

// STUDENTS ENDPOINTS
export const studentEndpoints = {
  COURSE_PAYMENT_API: BASE_URL + "/payment/capturePayment",
  COURSE_VERIFY_API: BASE_URL + "/payment/verifyPayment",
  SEND_PAYMENT_SUCCESS_EMAIL_API: BASE_URL + "/payment/sendPaymentSuccessEmail",
}

// COURSE ENDPOINTS
export const courseEndpoints = {
  GET_ALL_COURSE_API: BASE_URL + "/course/getAllCourses",
  COURSE_DETAILS_API: BASE_URL + "/course/getCourseDetails",
  EDIT_COURSE_API: BASE_URL + "/course/editCourse",
  COURSE_CATEGORIES_API: BASE_URL + "/course/showAllCategories",
  CREATE_COURSE_API: BASE_URL + "/course/createCourse",
  CREATE_SECTION_API: BASE_URL + "/course/addSection",
  CREATE_SUBSECTION_API: BASE_URL + "/course/addSubSection",
  UPDATE_SECTION_API: BASE_URL + "/course/updateSection",
  UPDATE_SUBSECTION_API: BASE_URL + "/course/updateSubSection",
  GET_ALL_INSTRUCTOR_COURSES_API: BASE_URL + "/course/getInstructorCourses",
  DELETE_SECTION_API: BASE_URL + "/course/deleteSection",
  DELETE_SUBSECTION_API: BASE_URL + "/course/deleteSubSection",
  DELETE_COURSE_API: BASE_URL + "/course/deleteCourse",
  GET_FULL_COURSE_DETAILS_AUTHENTICATED:
    BASE_URL + "/course/getFullCourseDetails",
  LECTURE_COMPLETION_API: BASE_URL + "/course/updateCourseProgress",
  CREATE_RATING_API: BASE_URL + "/course/createRating",
}

// RATINGS AND REVIEWS
export const ratingsEndpoints = {
  REVIEWS_DETAILS_API: BASE_URL + "/course/getReviews",
}

// CATAGORIES API
export const categories = {
  CATEGORIES_API: BASE_URL + "/course/showAllCategories",
}

// CATALOG PAGE DATA
export const catalogData = {
  CATALOGPAGEDATA_API: BASE_URL + "/course/getCategoryPageDetails",
}
// CONTACT-US API
export const contactusEndpoint = {
  CONTACT_US_API: BASE_URL + "/reach/contact",
}

// SETTINGS PAGE API
export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: BASE_URL + "/profile/updateDisplayPicture",
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

// SOCKET BASE URL (for Socket.io client)
export const SOCKET_BASE_URL = process.env.REACT_APP_BASE_URL
  ? process.env.REACT_APP_BASE_URL.replace("/api/v1", "")
  : "http://localhost:4000"


