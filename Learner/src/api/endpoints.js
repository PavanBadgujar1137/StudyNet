/**
 * OpenHand API Endpoints Configuration
 * Verified Production Base URL: https://api.openhand.live/api/v1
 */

export const BASE_URL = 'https://api.openhand.live/api/v1';

export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `${BASE_URL}/auth/login`,
    SIGNUP: `${BASE_URL}/auth/signup`,
    SEND_OTP: `${BASE_URL}/auth/sendotp`,
    ACCEPT_CONSENT: `${BASE_URL}/auth/accept-consent`,
    RESET_PASSWORD_TOKEN: `${BASE_URL}/auth/reset-password-token`,
    RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
    CHANGE_PASSWORD: `${BASE_URL}/auth/changepassword`,
  },

  // User Profile & Settings
  PROFILE: {
    GET_USER_DETAILS: `${BASE_URL}/profile/getUserDetails`,
    UPDATE_PROFILE: `${BASE_URL}/profile/updateProfile`,
    UPDATE_DISPLAY_PICTURE: `${BASE_URL}/profile/updateDisplayPicture`,
    DELETE_DISPLAY_PICTURE: `${BASE_URL}/profile/deleteDisplayPicture`,
    DELETE_ACCOUNT: `${BASE_URL}/profile/deleteProfile`,
    GET_ENROLLED_COURSES: `${BASE_URL}/profile/getEnrolledCourses`,
    NOTIFICATION_PREFERENCES: `${BASE_URL}/profile/notification-preferences`,
    SEND_TEST_NOTIFICATION: `${BASE_URL}/profile/test-notification`,
  },

  // Learner Dashboard Specific
  LEARNER: {
    CLIENT_DASHBOARD: `${BASE_URL}/profile/client-dashboard`,
    CHECKINS: `${BASE_URL}/checkins`,
    PRACTITIONERS: `${BASE_URL}/practitioners`,
    MY_CONNECTIONS: `${BASE_URL}/practitioners/my-connections`,
    CIRCLES_ALL: `${BASE_URL}/circle/all`,
    JOIN_CIRCLE: (circleId) => `${BASE_URL}/circle/${circleId}/join`,
    REFLECTIONS: `${BASE_URL}/reflections`,
    ANSWER_REFLECTION: `${BASE_URL}/reflections/answer`,
  },

  // Courses & Learning
  COURSES: {
    GET_ALL_COURSES: `${BASE_URL}/courses`,
    GET_COURSE_DETAILS: (courseId) => `${BASE_URL}/courses/${courseId}`,
    GET_COURSE_VIDEOS: (courseId) => `${BASE_URL}/courses/${courseId}/videos`,
  },

  // AURA AI Counselor
  AURA: {
    CHAT: `${BASE_URL}/aura/chat`,
  },

  // LiveKit Classrooms
  LIVE: {
    JOIN_CLASS: (classId) => `${BASE_URL}/live/${classId}/join`,
    UPCOMING: `${BASE_URL}/live/upcoming`,
  },

  // Community & Chat Hub
  CHAT: {
    GLOBAL: `${BASE_URL}/chat/global`,
    GROUP: (groupId) => `${BASE_URL}/chat/group/${groupId}`,
    DIRECT: (targetUserId) => `${BASE_URL}/chat/direct/${targetUserId}`,
    CONTACTS: `${BASE_URL}/chat/contacts`,
    PRESIGN_MEDIA: `${BASE_URL}/chat/presign-media`,
  },

  // Coupons & Checkout
  COUPONS: {
    CALCULATE_CHECKOUT: `${BASE_URL}/coupons/calculate-checkout`,
    ENROLL_FREE_DISCOUNT_COURSE: `${BASE_URL}/payments/enroll-free-discount-course`,
  },
};

export default ENDPOINTS;
