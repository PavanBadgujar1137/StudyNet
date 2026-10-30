/**
 * LiveClass entitlement and client sanitization helpers
 * Finding: AUTH-LIVE-001
 */

/**
 * Safely extracts a string ID representation from a string, ObjectId, or populated document.
 *
 * @param {*} idOrDoc
 * @returns {string}
 */
function toIdString(idOrDoc) {
  if (!idOrDoc) return ""
  if (typeof idOrDoc === "object") {
    if (idOrDoc._id) return String(idOrDoc._id)
    if (idOrDoc.id) return String(idOrDoc.id)
  }
  return String(idOrDoc)
}

/**
 * Determines whether the requesting user is entitled to access a live class session.
 *
 * Authorization rules:
 * 1. Platform Administrators (accountType === 'Admin') have access.
 * 2. Assigned Instructor / Host (liveClass.instructor) has access.
 * 3. Booked Client (liveClass.client) has access to their 1-on-1 or designated session.
 * 4. For 1-on-1 sessions, users who are not the instructor, client, or admin are denied.
 * 5. Legitimate Registered Attendees (liveClass.attendees) have access.
 * 6. For course-linked sessions (liveClass.course), enrolled learners in course.enrolledClients
 *    or the course creator/practitioner have access.
 * 7. Fails closed (returns false) if ownership or entitlement cannot be established.
 *
 * @param {Object} liveClass - The LiveClass document or lean object
 * @param {Object} user - The requesting user object (from req.user)
 * @returns {boolean}
 */
function canAccessLiveClass(liveClass, user) {
  if (!liveClass || typeof liveClass !== "object") {
    return false
  }
  if (!user || typeof user !== "object") {
    return false
  }

  const userId = toIdString(user.id || user._id)
  if (!userId) {
    return false
  }

  // 1. Platform Administrators
  const accountType = String(user.accountType || user.role || "").trim().toLowerCase()
  if (accountType === "admin") {
    return true
  }

  // 2. Assigned Instructor / Host
  const instructorId = toIdString(liveClass.instructor)
  if (instructorId && instructorId === userId) {
    return true
  }

  // 3. Booked Client (1-on-1 or designated client session)
  const clientId = toIdString(liveClass.client)
  if (clientId && clientId === userId) {
    return true
  }

  // If this is a private 1-on-1 session, deny anyone who is not host, client, or admin
  const isOneOnOne = liveClass.sessionType === "1-on-1" || Boolean(clientId)
  if (isOneOnOne) {
    return false
  }

  // 4. Legitimate Registered Attendees
  if (Array.isArray(liveClass.attendees)) {
    const isRegisteredAttendee = liveClass.attendees.some((attendee) => {
      const attendeeUserId = toIdString(attendee?.user)
      return attendeeUserId && attendeeUserId === userId
    })
    if (isRegisteredAttendee) {
      return true
    }
  }

  // 5. Course-linked Sessions
  if (liveClass.course) {
    if (typeof liveClass.course === "object") {
      const coursePractitionerId = toIdString(liveClass.course.practitioner)
      if (coursePractitionerId && coursePractitionerId === userId) {
        return true
      }

      const enrolledClients = Array.isArray(liveClass.course.enrolledClients)
        ? liveClass.course.enrolledClients
        : []
      const isEnrolledInCourse = enrolledClients.some((client) => {
        const enrolledId = toIdString(client)
        return enrolledId && enrolledId === userId
      })
      if (isEnrolledInCourse) {
        return true
      }
    }
    // Course-linked session: fail closed if user is neither course owner, enrolled, nor attendee
    return false
  }

  // 6. Fail closed when ownership or entitlement cannot be established
  return false
}

/**
 * Sanitizes a LiveClass document before returning it to the client.
 * Removes sensitive contact emails and internal fields from instructor, client,
 * attendees, and course objects while preserving all fields needed by frontend clients.
 * Withholds unpublished recording URLs from non-host/non-admin participants.
 * Restricts historical attendance roster strictly to host instructor and administrators.
 *
 * @param {Object} liveClass - The LiveClass document or lean object
 * @param {Object} user - The requesting user object
 * @returns {Object} Sanitized live class object
 */
function sanitizeLiveClassForClient(liveClass, user) {
  if (!liveClass || typeof liveClass !== "object") {
    return liveClass
  }

  const raw = typeof liveClass.toObject === "function" ? liveClass.toObject() : { ...liveClass }
  const sanitized = { ...raw }

  // Strip internal mongoose schema version and reminder flags
  delete sanitized.__v
  delete sanitized.reminderSent
  delete sanitized.reminderPurchaseSent
  delete sanitized.reminder1hSent
  delete sanitized.reminder15mSent
  delete sanitized.reminder2mSent

  // User identity and role resolution
  const userId = toIdString(user?.id || user?._id)
  const accountType = String(user?.accountType || user?.role || "").trim().toLowerCase()
  const isAdmin = accountType === "admin"
  const isInstructor = Boolean(userId && toIdString(sanitized.instructor) === userId)

  // 1. Recording visibility policy:
  // - Published recordings (isRecordingPublished === true) are available to authorized participants.
  // - Unpublished recordings are accessible only by the assigned instructor/host and administrators.
  // - For ordinary participants (booked clients, attendees, enrolled students), withhold recordingUrl if unpublished.
  const canViewUnpublished = isAdmin || isInstructor
  if (!sanitized.isRecordingPublished && !canViewUnpublished) {
    delete sanitized.recordingUrl
  }

  // 2. Attendance roster visibility policy:
  // - Only the assigned instructor/host and administrators may receive the sanitized historical attendees array.
  // - For booked clients, ordinary attendees, and enrolled learners, return attendees: [].
  const canViewAttendanceRoster = isAdmin || isInstructor
  if (!canViewAttendanceRoster) {
    sanitized.attendees = []
  }

  // If course is populated, remove internal enrolledClients array to prevent ID harvesting
  if (sanitized.course && typeof sanitized.course === "object") {
    const courseObj =
      typeof sanitized.course.toObject === "function"
        ? sanitized.course.toObject()
        : { ...sanitized.course }
    delete courseObj.enrolledClients
    delete courseObj.__v
    sanitized.course = courseObj
  }

  // Redact instructor email
  if (sanitized.instructor && typeof sanitized.instructor === "object") {
    const instructorObj =
      typeof sanitized.instructor.toObject === "function"
        ? sanitized.instructor.toObject()
        : { ...sanitized.instructor }
    delete instructorObj.email
    delete instructorObj.__v
    sanitized.instructor = instructorObj
  }

  // Redact client email
  if (sanitized.client && typeof sanitized.client === "object") {
    const clientObj =
      typeof sanitized.client.toObject === "function"
        ? sanitized.client.toObject()
        : { ...sanitized.client }
    delete clientObj.email
    delete clientObj.__v
    sanitized.client = clientObj
  }

  // Redact attendee emails when roster is returned to authorized host/admin
  if (Array.isArray(sanitized.attendees)) {
    sanitized.attendees = sanitized.attendees.map((attendee) => {
      if (!attendee || typeof attendee !== "object") return attendee
      const attendeeObj =
        typeof attendee.toObject === "function"
          ? attendee.toObject()
          : { ...attendee }

      if (attendeeObj.user && typeof attendeeObj.user === "object") {
        const userObj =
          typeof attendeeObj.user.toObject === "function"
            ? attendeeObj.user.toObject()
            : { ...attendeeObj.user }
        delete userObj.email
        delete userObj.__v
        attendeeObj.user = userObj
      }
      return attendeeObj
    })
  }

  return sanitized
}

module.exports = {
  toIdString,
  canAccessLiveClass,
  sanitizeLiveClassForClient,
}
