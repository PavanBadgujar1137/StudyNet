/**
 * Course access entitlement and media sanitization helpers
 * Finding: AUTH-COURSE-001
 */

/**
 * Determines whether a user is entitled to access protected course media (video playback and attachments).
 *
 * Entitlement rules:
 * - Missing or invalid course: false
 * - Pricing validation:
 *     - Explicitly free course (isFree === true) OR valid zero price (price === 0):
 *         - Authenticated users (learners, practitioners, admins) have access
 *         - Unauthenticated guests do not have direct media access
 *     - Paid course (price > 0 && !isFree):
 *         - Course creator (practitioner) has access
 *         - Enrolled clients (enrolledClients array contains user id) have access
 *         - Admins have access
 *         - All other users (unauthenticated or unenrolled) do NOT have access
 *     - Invalid, missing, non-finite, or negative pricing without explicit isFree flag:
 *         - Fails closed (returns false)
 *
 * @param {Object} course - The course document or lean object
 * @param {Object} [user] - The authenticated user object (from req.user)
 * @returns {boolean}
 */
function canAccessCourseMedia(course, user) {
  if (!course || typeof course !== "object" || (!course._id && !course.title)) {
    return false
  }

  const rawPrice = course.price
  const priceNum =
    typeof rawPrice === "number"
      ? rawPrice
      : rawPrice !== null && rawPrice !== undefined && String(rawPrice).trim() !== ""
      ? Number(rawPrice)
      : NaN
  const isFinitePrice = Number.isFinite(priceNum) && priceNum >= 0

  const isExplicitlyFree = course.isFree === true
  const isValidZeroPrice = isFinitePrice && priceNum === 0
  const isFreeCourse = isExplicitlyFree || isValidZeroPrice

  const isPaidCourse = isFinitePrice && priceNum > 0 && course.isFree !== true

  // Fail closed if pricing data is missing, non-finite, or negative, and not explicitly marked free
  if (!isFreeCourse && !isPaidCourse) {
    return false
  }

  const userId = user?.id || user?._id
  const userAccountType = String(user?.accountType || user?.role || "").toLowerCase()
  const isAdmin = userAccountType === "admin"

  // Administrators have access to valid courses
  if (userId && isAdmin) {
    return true
  }

  if (isFreeCourse) {
    // Free course: Registered / authenticated users get access
    return Boolean(userId)
  }

  // Paid course: requires authenticated creator or enrolled client
  if (!userId) {
    return false
  }

  const practitionerId = course.practitioner?._id || course.practitioner
  const isCreator = practitionerId ? String(practitionerId) === String(userId) : false
  if (isCreator) {
    return true
  }

  const enrolledClients = Array.isArray(course.enrolledClients) ? course.enrolledClients : []
  const isEnrolled = enrolledClients.some((client) => {
    const clientId = client?._id || client
    return String(clientId) === String(userId)
  })

  return isEnrolled
}

/**
 * Sanitizes a course object before returning it to the client.
 * Always removes internal fields such as enrolledClients and __v from all client-facing responses.
 * Only strips video URLs, S3 keys, and attachments when hasAccess is false.
 *
 * @param {Object} course - The course object
 * @param {boolean} hasAccess - Whether the user has media access
 * @returns {Object} Sanitized course
 */
function sanitizeCourseForPublic(course, hasAccess) {
  if (!course || typeof course !== "object") {
    return course
  }

  const sanitized = { ...course }

  // Always remove internal/privileged fields from all client responses
  delete sanitized.enrolledClients
  delete sanitized.__v

  if (!hasAccess && Array.isArray(sanitized.videos)) {
    sanitized.videos = sanitized.videos.map((video) => {
      if (!video || typeof video !== "object") {
        return video
      }
      const { videoUrl, s3Key, attachments, ...publicFields } = video
      return {
        ...publicFields,
        attachments: [],
      }
    })
  }

  return sanitized
}

module.exports = {
  canAccessCourseMedia,
  sanitizeCourseForPublic,
}
