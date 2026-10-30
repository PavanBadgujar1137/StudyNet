const { describe, it, beforeEach, afterEach } = require("node:test")
const assert = require("node:assert/strict")
const { canAccessLiveClass, sanitizeLiveClassForClient, toIdString } = require("../utils/liveClassAccess")
const { getClassById, getLiveClassToken, joinClass } = require("../controllers/liveClass")
const LiveClass = require("../models/LiveClass")
const User = require("../models/User")

describe("live class authorization policy (canAccessLiveClass)", () => {
  const instructorId = "671000000000000000000001"
  const clientId = "671000000000000000000002"
  const attendeeId = "671000000000000000000003"
  const enrolledStudentId = "671000000000000000000004"
  const courseCreatorId = "671000000000000000000005"
  const unauthorizedUserId = "671000000000000000000099"
  const adminId = "671000000000000000000777"

  const oneOnOneClass = {
    _id: "671000000000000000000101",
    title: "1:1 Confidential Therapy Session",
    sessionType: "1-on-1",
    instructor: instructorId,
    client: clientId,
    attendees: [],
  }

  const groupClass = {
    _id: "671000000000000000000102",
    title: "Weekend Guided Meditation Group",
    sessionType: "group",
    instructor: instructorId,
    attendees: [
      { user: attendeeId, joinedAt: new Date() },
    ],
  }

  const courseLinkedClass = {
    _id: "671000000000000000000103",
    title: "Live Q&A for Nutrition Course",
    sessionType: "group",
    instructor: instructorId,
    course: {
      _id: "671000000000000000000201",
      title: "Nutrition Fundamentals",
      practitioner: courseCreatorId,
      enrolledClients: [enrolledStudentId],
    },
    attendees: [],
  }

  it("fails closed on missing, null, or invalid user identity", () => {
    assert.equal(canAccessLiveClass(oneOnOneClass, null), false)
    assert.equal(canAccessLiveClass(oneOnOneClass, undefined), false)
    assert.equal(canAccessLiveClass(oneOnOneClass, {}), false)
    assert.equal(canAccessLiveClass(oneOnOneClass, { id: "" }), false)
    assert.equal(canAccessLiveClass(oneOnOneClass, "invalid-user"), false)
  })

  it("fails closed on missing or invalid live class objects", () => {
    const user = { id: clientId }
    assert.equal(canAccessLiveClass(null, user), false)
    assert.equal(canAccessLiveClass(undefined, user), false)
    assert.equal(canAccessLiveClass({}, user), false)
    assert.equal(canAccessLiveClass("invalid-class", user), false)
  })

  it("denies access to an unauthorized user attempting to access another person's 1-on-1 class", () => {
    assert.equal(
      canAccessLiveClass(oneOnOneClass, { id: unauthorizedUserId, accountType: "Learner" }),
      false
    )
    assert.equal(
      canAccessLiveClass(oneOnOneClass, { id: unauthorizedUserId, accountType: "Practitioner" }),
      false
    )
  })

  it("allows the assigned instructor/host for 1-on-1 sessions", () => {
    assert.equal(
      canAccessLiveClass(oneOnOneClass, { id: instructorId, accountType: "Practitioner" }),
      true
    )
  })

  it("allows the booked client for a 1-on-1 session", () => {
    assert.equal(
      canAccessLiveClass(oneOnOneClass, { id: clientId, accountType: "Learner" }),
      true
    )
  })

  it("allows administrators to access any live class according to existing policy", () => {
    assert.equal(
      canAccessLiveClass(oneOnOneClass, { id: adminId, accountType: "Admin" }),
      true
    )
    assert.equal(
      canAccessLiveClass(groupClass, { id: adminId, accountType: "admin" }),
      true
    )
    assert.equal(
      canAccessLiveClass(courseLinkedClass, { id: adminId, role: "admin" }),
      true
    )
  })

  it("allows authorized group-session attendees and denies unenrolled non-attendees", () => {
    // Registered attendee
    assert.equal(
      canAccessLiveClass(groupClass, { id: attendeeId, accountType: "Learner" }),
      true
    )

    // Unregistered / unauthorized user
    assert.equal(
      canAccessLiveClass(groupClass, { id: unauthorizedUserId, accountType: "Learner" }),
      false
    )
  })

  it("verifies course-linked sessions for enrolled and unenrolled users", () => {
    // Enrolled learner
    assert.equal(
      canAccessLiveClass(courseLinkedClass, { id: enrolledStudentId, accountType: "Learner" }),
      true
    )

    // Course practitioner / creator
    assert.equal(
      canAccessLiveClass(courseLinkedClass, { id: courseCreatorId, accountType: "Practitioner" }),
      true
    )

    // Unenrolled learner attempting access
    assert.equal(
      canAccessLiveClass(courseLinkedClass, { id: unauthorizedUserId, accountType: "Learner" }),
      false
    )
  })

  it("handles object and string IDs correctly via toIdString", () => {
    assert.equal(toIdString("123"), "123")
    assert.equal(toIdString({ _id: "456" }), "456")
    assert.equal(toIdString({ id: "789" }), "789")
    assert.equal(toIdString(null), "")
    assert.equal(toIdString(undefined), "")
  })
})

describe("live class data sanitization (sanitizeLiveClassForClient)", () => {
  const instructorId = "671000000000000000000001"
  const clientId = "671000000000000000000002"
  const attendeeId = "671000000000000000000003"
  const enrolledStudentId = "671000000000000000000004"
  const adminId = "671000000000000000000777"

  const fullLiveClass = {
    _id: "671000000000000000000101",
    title: "1:1 Deep Healing Consultation",
    description: "Private one-on-one session",
    sessionType: "1-on-1",
    status: "ended",
    scheduledStart: new Date("2026-11-01T10:00:00Z"),
    scheduledEnd: new Date("2026-11-01T11:00:00Z"),
    streamProvider: "livekit",
    livekitRoomName: "room-abc-123",
    livekitServerUrl: "wss://livekit.openhand.live",
    chatEnabled: true,
    recordingUrl: "https://openhand-recordings.s3.ap-south-1.amazonaws.com/rec-101.mp4",
    isRecordingPublished: false,
    instructor: {
      _id: instructorId,
      firstName: "Dr. Aarti",
      lastName: "Nair",
      image: "https://cdn.openhand.live/aarti.png",
      email: "aarti.private@clinic.com",
    },
    client: {
      _id: clientId,
      firstName: "Rohan",
      lastName: "Verma",
      image: "https://cdn.openhand.live/rohan.png",
      email: "rohan.personal@gmail.com",
    },
    attendees: [
      {
        user: {
          _id: attendeeId,
          firstName: "Sneha",
          lastName: "Patel",
          image: "https://cdn.openhand.live/sneha.png",
          email: "sneha.private@yahoo.com",
        },
        joinedAt: new Date("2026-11-01T10:05:00Z"),
        durationMinutes: 45,
      },
    ],
    course: {
      _id: "671000000000000000000201",
      title: "Nutrition Fundamentals",
      practitioner: instructorId,
      enrolledClients: [clientId, attendeeId],
      __v: 0,
    },
    reminderSent: true,
    reminderPurchaseSent: true,
    reminder1hSent: true,
    reminder15mSent: false,
    reminder2mSent: false,
    __v: 1,
  }

  it("redacts sensitive contact emails and internal fields from responses", () => {
    const sanitized = sanitizeLiveClassForClient(fullLiveClass, {
      id: instructorId,
      accountType: "Practitioner",
    })

    // Private email addresses must be stripped even for instructor/admin
    assert.equal(sanitized.instructor.email, undefined)
    assert.equal(sanitized.client.email, undefined)
    assert.equal(sanitized.attendees[0].user.email, undefined)

    // Enrolled client IDs from course must be stripped to prevent user enumeration
    assert.equal(sanitized.course.enrolledClients, undefined)

    // Internal schema version and reminder service flags must be stripped
    assert.equal(sanitized.__v, undefined)
    assert.equal(sanitized.reminderSent, undefined)
    assert.equal(sanitized.reminderPurchaseSent, undefined)
    assert.equal(sanitized.reminder1hSent, undefined)
    assert.equal(sanitized.reminder15mSent, undefined)
    assert.equal(sanitized.reminder2mSent, undefined)

    // Legitimate public and session fields must be preserved
    assert.equal(sanitized.title, "1:1 Deep Healing Consultation")
    assert.equal(sanitized.sessionType, "1-on-1")
    assert.equal(sanitized.streamProvider, "livekit")
    assert.equal(sanitized.livekitRoomName, "room-abc-123")
    assert.equal(sanitized.livekitServerUrl, "wss://livekit.openhand.live")
    assert.equal(sanitized.instructor.firstName, "Dr. Aarti")
    assert.equal(sanitized.client.firstName, "Rohan")
    assert.equal(sanitized.attendees[0].user.firstName, "Sneha")
  })

  it("withholds unpublished recordingUrl from ordinary participants", () => {
    const participantSanitized = sanitizeLiveClassForClient(fullLiveClass, {
      id: clientId,
      accountType: "Learner",
    })
    assert.equal(participantSanitized.isRecordingPublished, false)
    assert.equal(participantSanitized.recordingUrl, undefined)
  })

  it("preserves unpublished recordingUrl for the instructor host", () => {
    const instructorSanitized = sanitizeLiveClassForClient(fullLiveClass, {
      id: instructorId,
      accountType: "Practitioner",
    })
    assert.equal(instructorSanitized.isRecordingPublished, false)
    assert.equal(
      instructorSanitized.recordingUrl,
      "https://openhand-recordings.s3.ap-south-1.amazonaws.com/rec-101.mp4"
    )
  })

  it("preserves unpublished recordingUrl for administrators", () => {
    const adminSanitized = sanitizeLiveClassForClient(fullLiveClass, {
      id: adminId,
      accountType: "Admin",
    })
    assert.equal(adminSanitized.isRecordingPublished, false)
    assert.equal(
      adminSanitized.recordingUrl,
      "https://openhand-recordings.s3.ap-south-1.amazonaws.com/rec-101.mp4"
    )
  })

  it("preserves published recordingUrl for all authorized participants", () => {
    const publishedClass = { ...fullLiveClass, isRecordingPublished: true }
    const participantSanitized = sanitizeLiveClassForClient(publishedClass, {
      id: clientId,
      accountType: "Learner",
    })
    assert.equal(participantSanitized.isRecordingPublished, true)
    assert.equal(
      participantSanitized.recordingUrl,
      "https://openhand-recordings.s3.ap-south-1.amazonaws.com/rec-101.mp4"
    )
  })

  it("allows assigned instructor to receive the sanitized attendee roster with email redacted", () => {
    const sanitized = sanitizeLiveClassForClient(fullLiveClass, {
      id: instructorId,
      accountType: "Practitioner",
    })
    assert.ok(Array.isArray(sanitized.attendees))
    assert.equal(sanitized.attendees.length, 1)
    assert.equal(sanitized.attendees[0].user.firstName, "Sneha")
    assert.equal(sanitized.attendees[0].user.email, undefined)
    assert.equal(sanitized.attendees[0].durationMinutes, 45)
  })

  it("allows platform administrator to receive the sanitized attendee roster with email redacted", () => {
    const sanitized = sanitizeLiveClassForClient(fullLiveClass, {
      id: adminId,
      accountType: "Admin",
    })
    assert.ok(Array.isArray(sanitized.attendees))
    assert.equal(sanitized.attendees.length, 1)
    assert.equal(sanitized.attendees[0].user.firstName, "Sneha")
    assert.equal(sanitized.attendees[0].user.email, undefined)
  })

  it("withholds attendee roster from booked 1-on-1 client", () => {
    const sanitized = sanitizeLiveClassForClient(fullLiveClass, {
      id: clientId,
      accountType: "Learner",
    })
    assert.deepEqual(sanitized.attendees, [])
  })

  it("withholds attendee roster from registered group participant", () => {
    const sanitized = sanitizeLiveClassForClient(fullLiveClass, {
      id: attendeeId,
      accountType: "Learner",
    })
    assert.deepEqual(sanitized.attendees, [])
  })

  it("withholds attendee roster from enrolled course learner", () => {
    const sanitized = sanitizeLiveClassForClient(fullLiveClass, {
      id: enrolledStudentId,
      accountType: "Learner",
    })
    assert.deepEqual(sanitized.attendees, [])
  })
})

describe("liveClass controller integration", () => {
  const instructorId = "671000000000000000000001"
  const clientId = "671000000000000000000002"
  const enrolledStudentId = "671000000000000000000004"
  const unauthorizedUserId = "671000000000000000000099"
  const adminId = "671000000000000000000777"

  const mockOneOnOneDb = {
    _id: "671000000000000000000101",
    title: "Private Consultation",
    sessionType: "1-on-1",
    instructor: {
      _id: instructorId,
      firstName: "Dr. Aarti",
      lastName: "Nair",
      email: "aarti@clinic.com",
    },
    client: {
      _id: clientId,
      firstName: "Rohan",
      lastName: "Verma",
      email: "rohan@gmail.com",
    },
    attendees: [],
    livekitRoomName: "room-oneonone-101",
    livekitServerUrl: "wss://livekit.openhand.live",
    status: "scheduled",
    chatEnabled: true,
  }

  const mockCourseLinkedDb = {
    _id: "671000000000000000000103",
    title: "Live Course Workshop",
    sessionType: "group",
    instructor: {
      _id: instructorId,
      firstName: "Dr. Aarti",
      lastName: "Nair",
      email: "aarti@clinic.com",
    },
    course: {
      _id: "671000000000000000000201",
      title: "Nutrition Fundamentals",
      practitioner: instructorId,
      enrolledClients: [enrolledStudentId],
    },
    attendees: [],
    livekitRoomName: "room-course-103",
    livekitServerUrl: "wss://livekit.openhand.live",
    status: "scheduled",
    chatEnabled: true,
  }

  const origFindById = LiveClass.findById
  const origUserFindById = User.findById

  afterEach(() => {
    LiveClass.findById = origFindById
    User.findById = origUserFindById
  })

  function mockFindById(returnedClass) {
    LiveClass.findById = () => {
      const doc = returnedClass ? JSON.parse(JSON.stringify(returnedClass)) : null
      if (doc) {
        doc.populate = async function () {
          return this
        }
        doc.save = async function () {
          return this
        }
      }
      return {
        populate: () => ({
          populate: () => ({
            populate: () => ({
              populate: () => ({
                lean: async () => (doc ? JSON.parse(JSON.stringify(doc)) : null),
              }),
              lean: async () => (doc ? JSON.parse(JSON.stringify(doc)) : null),
            }),
            lean: async () => (doc ? JSON.parse(JSON.stringify(doc)) : null),
          }),
          lean: async () => (doc ? JSON.parse(JSON.stringify(doc)) : null),
        }),
        lean: async () => (doc ? JSON.parse(JSON.stringify(doc)) : null),
        then: (resolve) => resolve(doc),
      }
    }
  }

  function createMockRes() {
    let resStatus = null
    let resJson = null
    const res = {
      status: (code) => {
        resStatus = code
        return {
          json: (data) => {
            resJson = data
            return resJson
          },
        }
      },
    }
    return { res, getStatus: () => resStatus, getJson: () => resJson }
  }

  // ─── getClassById tests ───────────────────────────────────────────────────

  it("getClassById: returns 404 when live class does not exist", async () => {
    mockFindById(null)
    const req = { params: { classId: "nonexistent-id" }, user: { id: clientId } }
    const { res, getStatus, getJson } = createMockRes()

    await getClassById(req, res)
    assert.equal(getStatus(), 404)
    assert.equal(getJson().success, false)
    assert.equal(getJson().message, "Class not found.")
  })

  it("getClassById: returns 403 when authenticated user is not entitled to 1-on-1 session", async () => {
    mockFindById(mockOneOnOneDb)
    const req = {
      params: { classId: mockOneOnOneDb._id },
      user: { id: unauthorizedUserId, accountType: "Learner" },
    }
    const { res, getStatus, getJson } = createMockRes()

    await getClassById(req, res)
    assert.equal(getStatus(), 403)
    assert.equal(getJson().success, false)
    assert.equal(getJson().message, "Not authorized to access this live class.")
    assert.equal(getJson().data, undefined)
  })

  it("getClassById: returns 403 for unenrolled user attempting to access course-linked session", async () => {
    mockFindById(mockCourseLinkedDb)
    const req = {
      params: { classId: mockCourseLinkedDb._id },
      user: { id: unauthorizedUserId, accountType: "Learner" },
    }
    const { res, getStatus, getJson } = createMockRes()

    await getClassById(req, res)
    assert.equal(getStatus(), 403)
    assert.equal(getJson().success, false)
    assert.equal(getJson().message, "Not authorized to access this live class.")
  })

  it("getClassById: returns 200 with sanitized data for the booked 1-on-1 client", async () => {
    mockFindById(mockOneOnOneDb)
    const req = {
      params: { classId: mockOneOnOneDb._id },
      user: { id: clientId, accountType: "Learner" },
    }
    const { res, getStatus, getJson } = createMockRes()

    await getClassById(req, res)
    assert.equal(getStatus(), 200)
    assert.equal(getJson().success, true)
    assert.equal(getJson().data.title, "Private Consultation")
    // Email addresses must be redacted
    assert.equal(getJson().data.instructor.email, undefined)
    assert.equal(getJson().data.client.email, undefined)
  })

  it("getClassById: returns 200 with sanitized data for assigned instructor", async () => {
    mockFindById(mockOneOnOneDb)
    const req = {
      params: { classId: mockOneOnOneDb._id },
      user: { id: instructorId, accountType: "Practitioner" },
    }
    const { res, getStatus, getJson } = createMockRes()

    await getClassById(req, res)
    assert.equal(getStatus(), 200)
    assert.equal(getJson().success, true)
    assert.equal(getJson().data.title, "Private Consultation")
  })

  it("getClassById: returns 200 with sanitized data for enrolled course learner", async () => {
    mockFindById(mockCourseLinkedDb)
    const req = {
      params: { classId: mockCourseLinkedDb._id },
      user: { id: enrolledStudentId, accountType: "Learner" },
    }
    const { res, getStatus, getJson } = createMockRes()

    await getClassById(req, res)
    assert.equal(getStatus(), 200)
    assert.equal(getJson().success, true)
    assert.equal(getJson().data.title, "Live Course Workshop")
    // Enrolled client IDs array from course must be stripped
    assert.equal(getJson().data.course.enrolledClients, undefined)
  })

  it("getClassById: returns 200 with sanitized data for platform administrator", async () => {
    mockFindById(mockOneOnOneDb)
    const req = {
      params: { classId: mockOneOnOneDb._id },
      user: { id: adminId, accountType: "Admin" },
    }
    const { res, getStatus, getJson } = createMockRes()

    await getClassById(req, res)
    assert.equal(getStatus(), 200)
    assert.equal(getJson().success, true)
    assert.equal(getJson().data.title, "Private Consultation")
  })

  // ─── getLiveClassToken tests ──────────────────────────────────────────────

  it("getLiveClassToken: returns 404 when live class does not exist", async () => {
    mockFindById(null)
    const req = { params: { classId: "nonexistent-id" }, user: { id: clientId } }
    const { res, getStatus, getJson } = createMockRes()

    await getLiveClassToken(req, res)
    assert.equal(getStatus(), 404)
    assert.equal(getJson().success, false)
    assert.equal(getJson().message, "Class not found.")
  })

  it("getLiveClassToken: rejects unauthorized user attempting to generate streaming token", async () => {
    mockFindById(mockOneOnOneDb)
    const req = {
      params: { classId: mockOneOnOneDb._id },
      user: { id: unauthorizedUserId, accountType: "Learner" },
    }
    const { res, getStatus, getJson } = createMockRes()

    await getLiveClassToken(req, res)
    assert.equal(getStatus(), 403)
    assert.equal(getJson().success, false)
    assert.equal(getJson().message, "Not authorized to access this live class.")
    assert.equal(getJson().data, undefined)
  })

  it("getLiveClassToken: issues valid LiveKit token for booked 1-on-1 client", async () => {
    mockFindById(mockOneOnOneDb)
    User.findById = () => ({
      lean: async () => ({ firstName: "Rohan", lastName: "Verma", image: "img.png" }),
    })

    const req = {
      params: { classId: mockOneOnOneDb._id },
      user: { id: clientId, accountType: "Learner" },
    }
    const { res, getStatus, getJson } = createMockRes()

    await getLiveClassToken(req, res)
    assert.equal(getStatus(), 200)
    assert.equal(getJson().success, true)
    assert.ok(getJson().data.livekitToken)
    assert.equal(getJson().data.livekitRoomName, "room-oneonone-101")
    assert.equal(getJson().data.streamProvider, "livekit")
  })

  it("getLiveClassToken: issues valid LiveKit token for assigned instructor", async () => {
    mockFindById(mockOneOnOneDb)
    User.findById = () => ({
      lean: async () => ({ firstName: "Dr. Aarti", lastName: "Nair", image: "img.png" }),
    })

    const req = {
      params: { classId: mockOneOnOneDb._id },
      user: { id: instructorId, accountType: "Practitioner" },
    }
    const { res, getStatus, getJson } = createMockRes()

    await getLiveClassToken(req, res)
    assert.equal(getStatus(), 200)
    assert.equal(getJson().success, true)
    assert.ok(getJson().data.livekitToken)
  })

  it("getLiveClassToken: issues valid LiveKit token for enrolled course learner", async () => {
    mockFindById(mockCourseLinkedDb)
    User.findById = () => ({
      lean: async () => ({ firstName: "Enrolled", lastName: "Student", image: "img.png" }),
    })

    const req = {
      params: { classId: mockCourseLinkedDb._id },
      user: { id: enrolledStudentId, accountType: "Learner" },
    }
    const { res, getStatus, getJson } = createMockRes()

    await getLiveClassToken(req, res)
    assert.equal(getStatus(), 200)
    assert.equal(getJson().success, true)
    assert.ok(getJson().data.livekitToken)
  })

  // ─── joinClass tests ──────────────────────────────────────────────────────

  it("joinClass: rejects unauthorized user attempting to join private 1-on-1 session", async () => {
    mockFindById(mockOneOnOneDb)
    const req = {
      params: { classId: mockOneOnOneDb._id },
      user: { id: unauthorizedUserId, accountType: "Learner" },
    }
    const { res, getStatus, getJson } = createMockRes()

    await joinClass(req, res)
    assert.equal(getStatus(), 403)
    assert.equal(getJson().success, false)
    assert.equal(getJson().message, "Not authorized to access this live class.")
  })
})
