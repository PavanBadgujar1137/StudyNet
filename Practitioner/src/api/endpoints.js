/**
 * OpenHand Practitioner API Endpoints Configuration
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

  // Practitioner Profile & Practice
  PROFILE: {
    GET_USER_DETAILS: `${BASE_URL}/profile/getUserDetails`,
    UPDATE_PROFILE: `${BASE_URL}/profile/updateProfile`,
    UPDATE_PRACTITIONER_DETAILS: `${BASE_URL}/profile/practitioner-details`,
    UPDATE_DISPLAY_PICTURE: `${BASE_URL}/profile/updateDisplayPicture`,
    DELETE_DISPLAY_PICTURE: `${BASE_URL}/profile/deleteDisplayPicture`,
    DELETE_ACCOUNT: `${BASE_URL}/profile/deleteProfile`,
  },

  // Practitioner Dashboard & Practice Telemetry
  PRACTITIONER: {
    DASHBOARD: `${BASE_URL}/profile/practitioner-dashboard`,
    BOOKINGS: `${BASE_URL}/payment/practitioner-bookings`,
    CONNECTED_CLIENTS: `${BASE_URL}/practitioners/connected-clients`,
    APPROVE_CONNECTION: (connectionId) => `${BASE_URL}/practitioners/connection-approval/${connectionId}`,
    INVITE_CLIENT: `${BASE_URL}/practitioners/invite-client`,
    OFFERS: `${BASE_URL}/offers`,
    CIRCLES: `${BASE_URL}/circle/all`,
    CREATE_CIRCLE: `${BASE_URL}/circle/create`,
    SUBSCRIPTION_STATUS: `${BASE_URL}/payments/subscription/mine`,
  },

  // Course Management Studio
  COURSES: {
    GET_INSTRUCTOR_COURSES: `${BASE_URL}/courses/instructor-courses`,
    CREATE_COURSE: `${BASE_URL}/courses/createCourse`,
    ADD_SECTION: `${BASE_URL}/courses/addSection`,
    ADD_SUBSECTION: `${BASE_URL}/courses/addSubSection`,
  },

  // Coupons & Learner Discounts
  COUPONS: {
    GET_MINE: `${BASE_URL}/coupons/practitioner/mine`,
    CREATE_COUPON: `${BASE_URL}/coupons/practitioner/create`,
    LOOKUP_LEARNER: `${BASE_URL}/coupons/lookup-learner`,
    CREATE_LEARNER_DISCOUNT: `${BASE_URL}/coupons/learner-discount/create`,
    GET_MY_LEARNER_DISCOUNTS: `${BASE_URL}/coupons/learner-discount/mine`,
  },

  // AURA AI Practice Assistant
  AURA: {
    CHAT: `${BASE_URL}/aura/chat`,
  },

  // Live Sessions & WebRTC Classrooms
  LIVE: {
    SCHEDULE: `${BASE_URL}/live/schedule`,
    START_CLASS: (classId) => `${BASE_URL}/live/${classId}/start`,
    END_CLASS: (classId) => `${BASE_URL}/live/${classId}/end`,
    JOIN_CLASS: (classId) => `${BASE_URL}/live/${classId}/join`,
  },

  // Reflections
  REFLECTIONS: {
    CREATE: `${BASE_URL}/reflections/create`,
    GET_BY_LEARNER: (clientId) => `${BASE_URL}/reflections/learner/${clientId}`,
  },

  // Community & Chat Hub
  CHAT: {
    GLOBAL: `${BASE_URL}/chat/global`,
    GROUP: (groupId) => `${BASE_URL}/chat/group/${groupId}`,
    DIRECT: (targetUserId) => `${BASE_URL}/chat/direct/${targetUserId}`,
    CONTACTS: `${BASE_URL}/chat/contacts`,
    PRESIGN_MEDIA: `${BASE_URL}/chat/presign-media`,
  },
};

export default ENDPOINTS;
