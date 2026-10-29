const { describe, it, beforeEach, afterEach } = require("node:test")
const assert = require("node:assert/strict")
const jwt = require("jsonwebtoken")
const { canAccessCourseMedia, sanitizeCourseForPublic } = require("../utils/courseAccess")
const { getAllCourses, getCourseDetail, getCourseVideos } = require("../controllers/course")
const { optionalAuth } = require("../middleware/auth")
const Course = require("../models/Course")
const CourseVideo = require("../models/CourseVideo")

describe("course entitlement policy (canAccessCourseMedia)", () => {
  const creatorId = "672000000000000000000010"
  const enrolledUserId = "672000000000000000000020"
  const unenrolledUserId = "672000000000000000000030"
  const adminId = "672000000000000000000099"

  const samplePaidCourse = {
    _id: "672000000000000000000100",
    title: "Advanced Ayurvedic Practice",
    price: 1999,
    isFree: false,
    practitioner: creatorId,
    enrolledClients: [enrolledUserId],
  }

  const sampleFreeCourse = {
    _id: "672000000000000000000200",
    title: "Introduction to Wellness",
    price: 0,
    isFree: true,
    practitioner: creatorId,
    enrolledClients: [],
  }

  it("fails closed on missing, null, or invalid course objects", () => {
    assert.equal(canAccessCourseMedia(null, { id: enrolledUserId }), false)
    assert.equal(canAccessCourseMedia(undefined, { id: enrolledUserId }), false)
    assert.equal(canAccessCourseMedia("not-a-course", { id: enrolledUserId }), false)
    assert.equal(canAccessCourseMedia({}, { id: enrolledUserId }), false)
  })

  it("fails closed on missing, null, non-finite, and negative course pricing", () => {
    const user = { id: unenrolledUserId, accountType: "Learner" }

    // Missing / undefined price
    assert.equal(
      canAccessCourseMedia({ _id: "c1", title: "Missing Price", isFree: false }, user),
      false
    )

    // Null price
    assert.equal(
      canAccessCourseMedia({ _id: "c2", title: "Null Price", price: null, isFree: false }, user),
      false
    )

    // Non-finite string or NaN price
    assert.equal(
      canAccessCourseMedia({ _id: "c3", title: "NaN Price", price: "not-a-number", isFree: false }, user),
      false
    )
    assert.equal(
      canAccessCourseMedia({ _id: "c4", title: "Infinity Price", price: Infinity, isFree: false }, user),
      false
    )

    // Negative prices must fail closed
    assert.equal(
      canAccessCourseMedia({ _id: "c5", title: "Negative Price", price: -100, isFree: false }, user),
      false
    )
    assert.equal(
      canAccessCourseMedia({ _id: "c6", title: "Negative Price", price: -0.01, isFree: false }, user),
      false
    )

    // Even an enrolled user or creator fails closed on corrupted/negative pricing if not explicitly free
    assert.equal(
      canAccessCourseMedia(
        { _id: "c7", title: "Corrupt", price: -50, isFree: false, enrolledClients: [enrolledUserId] },
        { id: enrolledUserId }
      ),
      false
    )
  })

  it("preserves access for explicitly free courses even with non-positive or missing price", () => {
    const user = { id: unenrolledUserId, accountType: "Learner" }

    // Explicitly free flag (isFree === true)
    assert.equal(
      canAccessCourseMedia({ _id: "c8", title: "Explicit Free", price: 0, isFree: true }, user),
      true
    )
    assert.equal(
      canAccessCourseMedia({ _id: "c9", title: "Explicit Free Missing Price", isFree: true }, user),
      true
    )

    // Valid zero-price course (price === 0, isFree === false)
    assert.equal(
      canAccessCourseMedia({ _id: "c10", title: "Zero Price Course", price: 0, isFree: false }, user),
      true
    )
  })

  it("denies unauthenticated guests access to paid course media", () => {
    assert.equal(canAccessCourseMedia(samplePaidCourse, null), false)
    assert.equal(canAccessCourseMedia(samplePaidCourse, undefined), false)
    assert.equal(canAccessCourseMedia(samplePaidCourse, {}), false)
  })

  it("denies unauthenticated guests direct media access to free courses", () => {
    assert.equal(canAccessCourseMedia(sampleFreeCourse, null), false)
    assert.equal(canAccessCourseMedia(sampleFreeCourse, undefined), false)
  })

  it("denies authenticated but unenrolled users access to paid course media", () => {
    const user = { id: unenrolledUserId, accountType: "Learner" }
    assert.equal(canAccessCourseMedia(samplePaidCourse, user), false)
  })

  it("grants enrolled users access to paid course media", () => {
    const user = { id: enrolledUserId, accountType: "Learner" }
    assert.equal(canAccessCourseMedia(samplePaidCourse, user), true)

    // Also supports user._id
    const userWithUnderscoreId = { _id: enrolledUserId, accountType: "Learner" }
    assert.equal(canAccessCourseMedia(samplePaidCourse, userWithUnderscoreId), true)
  })

  it("grants course creators access to their own paid courses", () => {
    const creatorUser = { id: creatorId, accountType: "Practitioner" }
    assert.equal(canAccessCourseMedia(samplePaidCourse, creatorUser), true)

    // Handles populated practitioner object
    const courseWithPopulatedPractitioner = {
      ...samplePaidCourse,
      practitioner: { _id: creatorId, firstName: "Ayush", lastName: "Sharma" },
    }
    assert.equal(canAccessCourseMedia(courseWithPopulatedPractitioner, creatorUser), true)
  })

  it("grants administrators access to any valid course", () => {
    const adminUser = { id: adminId, accountType: "Admin" }
    assert.equal(canAccessCourseMedia(samplePaidCourse, adminUser), true)
    assert.equal(canAccessCourseMedia(sampleFreeCourse, adminUser), true)

    // Case-insensitive role check
    const adminWithRole = { id: adminId, role: "admin" }
    assert.equal(canAccessCourseMedia(samplePaidCourse, adminWithRole), true)
  })

  it("grants any authenticated registered learner access to free courses", () => {
    const learner = { id: unenrolledUserId, accountType: "Learner" }
    assert.equal(canAccessCourseMedia(sampleFreeCourse, learner), true)
  })
})

describe("public course data sanitization (sanitizeCourseForPublic)", () => {
  const fullCourse = {
    _id: "672000000000000000000100",
    title: "Holistic Health Masterclass",
    description: "In-depth course on holistic living",
    thumbnail: "https://cdn.openhand.live/thumb.jpg",
    price: 2499,
    isFree: false,
    status: "published",
    enrolledClients: ["672000000000000000000020", "672000000000000000000021"],
    __v: 0,
    videos: [
      {
        _id: "672000000000000000000501",
        title: "Lecture 1: Foundations",
        description: "Overview of core principles",
        videoUrl: "https://openhand-bucket.s3.ap-south-1.amazonaws.com/openhand/uat/course_videos/lec1.mp4",
        s3Key: "openhand/uat/course_videos/lec1.mp4",
        thumbnail: "https://cdn.openhand.live/lec1_thumb.jpg",
        durationSeconds: 1800,
        order: 0,
        attachments: [
          {
            name: "syllabus.pdf",
            url: "https://openhand-bucket.s3.ap-south-1.amazonaws.com/openhand/uat/course_attachments/syllabus.pdf",
            s3Key: "openhand/uat/course_attachments/syllabus.pdf",
            fileType: "pdf",
            size: 204800,
          },
        ],
      },
    ],
  }

  it("preserves full video URLs and attachments when hasAccess is true, while removing internal fields", () => {
    const result = sanitizeCourseForPublic(fullCourse, true)
    // Media preserved
    assert.equal(result.videos[0].videoUrl, fullCourse.videos[0].videoUrl)
    assert.equal(result.videos[0].s3Key, fullCourse.videos[0].s3Key)
    assert.equal(result.videos[0].attachments.length, 1)
    assert.equal(result.videos[0].attachments[0].url, fullCourse.videos[0].attachments[0].url)

    // Internal fields must be removed even when hasAccess is true
    assert.equal(result.enrolledClients, undefined)
    assert.equal(result.__v, undefined)
  })

  it("redacts videoUrl, s3Key, and attachments when hasAccess is false", () => {
    const result = sanitizeCourseForPublic(fullCourse, false)

    // Protected fields must not be present or must be empty
    assert.equal(result.videos[0].videoUrl, undefined)
    assert.equal(result.videos[0].s3Key, undefined)
    assert.deepEqual(result.videos[0].attachments, [])

    // Public syllabus metadata must be preserved
    assert.equal(result.videos[0]._id, "672000000000000000000501")
    assert.equal(result.videos[0].title, "Lecture 1: Foundations")
    assert.equal(result.videos[0].description, "Overview of core principles")
    assert.equal(result.videos[0].durationSeconds, 1800)
    assert.equal(result.videos[0].order, 0)
    assert.equal(result.videos[0].thumbnail, "https://cdn.openhand.live/lec1_thumb.jpg")

    // Public course metadata must be preserved
    assert.equal(result.title, "Holistic Health Masterclass")
    assert.equal(result.price, 2499)
    assert.equal(result.isFree, false)
    assert.equal(result.thumbnail, "https://cdn.openhand.live/thumb.jpg")

    // Internal fields removed
    assert.equal(result.enrolledClients, undefined)
    assert.equal(result.__v, undefined)
  })

  it("removes internal enrolledClients array and __v from all client-facing responses", () => {
    const unauthorizedResult = sanitizeCourseForPublic(fullCourse, false)
    assert.equal(unauthorizedResult.enrolledClients, undefined)
    assert.equal(unauthorizedResult.__v, undefined)

    const authorizedResult = sanitizeCourseForPublic(fullCourse, true)
    assert.equal(authorizedResult.enrolledClients, undefined)
    assert.equal(authorizedResult.__v, undefined)
  })
})

describe("getCourseDetail controller integration", () => {
  const creatorId = "672000000000000000000010"
  const enrolledUserId = "672000000000000000000020"
  const unenrolledUserId = "672000000000000000000030"

  const mockDbCourse = {
    _id: "672000000000000000000100",
    title: "Holistic Health Masterclass",
    description: "In-depth course on holistic living",
    thumbnail: "https://cdn.openhand.live/thumb.jpg",
    price: 2499,
    isFree: false,
    practitioner: { _id: creatorId, firstName: "Dr. Ayush", lastName: "Sharma" },
    enrolledClients: [enrolledUserId],
    __v: 0,
    videos: [
      {
        _id: "672000000000000000000501",
        title: "Lecture 1: Foundations",
        description: "Overview of core principles",
        videoUrl: "https://openhand-bucket.s3.ap-south-1.amazonaws.com/openhand/uat/course_videos/lec1.mp4",
        s3Key: "openhand/uat/course_videos/lec1.mp4",
        durationSeconds: 1800,
        order: 0,
        attachments: [
          {
            name: "syllabus.pdf",
            url: "https://openhand-bucket.s3.ap-south-1.amazonaws.com/openhand/uat/course_attachments/syllabus.pdf",
            s3Key: "openhand/uat/course_attachments/syllabus.pdf",
          },
        ],
      },
    ],
  }

  const origFindById = Course.findById
  afterEach(() => {
    Course.findById = origFindById
  })

  function mockFindById(returnedCourse) {
    Course.findById = () => ({
      populate: () => ({
        populate: () => ({
          lean: async () => (returnedCourse ? JSON.parse(JSON.stringify(returnedCourse)) : null),
        }),
      }),
    })
  }

  it("returns 404 when course does not exist", async () => {
    mockFindById(null)
    const req = { params: { id: "nonexistent" } }
    let resStatus = null
    let resJson = null
    const res = {
      status: (code) => {
        resStatus = code
        return {
          json: (data) => {
            resJson = data
          },
        }
      },
    }

    await getCourseDetail(req, res)
    assert.equal(resStatus, 404)
    assert.equal(resJson.success, false)
    assert.equal(resJson.message, "Course not found")
  })

  it("redacts media and internal fields for anonymous visitors on paid courses", async () => {
    mockFindById(mockDbCourse)
    const req = { params: { id: mockDbCourse._id }, user: undefined }
    let resStatus = null
    let resJson = null
    const res = {
      status: (code) => {
        resStatus = code
        return {
          json: (data) => {
            resJson = data
          },
        }
      },
    }

    await getCourseDetail(req, res)
    assert.equal(resStatus, 200)
    assert.equal(resJson.success, true)
    assert.equal(resJson.hasAccess, false)
    assert.match(resJson.accessNotice, /Please purchase to unlock access/)
    assert.equal(resJson.course.videos[0].videoUrl, undefined)
    assert.deepEqual(resJson.course.videos[0].attachments, [])
    assert.equal(resJson.course.enrolledClients, undefined)
    assert.equal(resJson.course.__v, undefined)
    assert.equal(resJson.course.title, mockDbCourse.title)
  })

  it("redacts media and internal fields for authenticated but unenrolled users on paid courses", async () => {
    mockFindById(mockDbCourse)
    const req = {
      params: { id: mockDbCourse._id },
      user: { id: unenrolledUserId, accountType: "Learner" },
    }
    let resStatus = null
    let resJson = null
    const res = {
      status: (code) => {
        resStatus = code
        return {
          json: (data) => {
            resJson = data
          },
        }
      },
    }

    await getCourseDetail(req, res)
    assert.equal(resStatus, 200)
    assert.equal(resJson.hasAccess, false)
    assert.equal(resJson.course.videos[0].videoUrl, undefined)
    assert.deepEqual(resJson.course.videos[0].attachments, [])
    assert.equal(resJson.course.enrolledClients, undefined)
    assert.equal(resJson.course.__v, undefined)
  })

  it("returns full media for enrolled clients on paid courses while withholding internal fields", async () => {
    mockFindById(mockDbCourse)
    const req = {
      params: { id: mockDbCourse._id },
      user: { id: enrolledUserId, accountType: "Learner" },
    }
    let resStatus = null
    let resJson = null
    const res = {
      status: (code) => {
        resStatus = code
        return {
          json: (data) => {
            resJson = data
          },
        }
      },
    }

    await getCourseDetail(req, res)
    assert.equal(resStatus, 200)
    assert.equal(resJson.hasAccess, true)
    assert.equal(resJson.accessNotice, null)
    assert.equal(resJson.course.videos[0].videoUrl, mockDbCourse.videos[0].videoUrl)
    assert.equal(resJson.course.videos[0].attachments.length, 1)
    // Internal fields must be stripped from authorized client responses as well
    assert.equal(resJson.course.enrolledClients, undefined)
    assert.equal(resJson.course.__v, undefined)
  })

  it("returns full media for course creator while withholding internal fields", async () => {
    mockFindById(mockDbCourse)
    const req = {
      params: { id: mockDbCourse._id },
      user: { id: creatorId, accountType: "Practitioner" },
    }
    let resStatus = null
    let resJson = null
    const res = {
      status: (code) => {
        resStatus = code
        return {
          json: (data) => {
            resJson = data
          },
        }
      },
    }

    await getCourseDetail(req, res)
    assert.equal(resStatus, 200)
    assert.equal(resJson.hasAccess, true)
    assert.equal(resJson.course.videos[0].videoUrl, mockDbCourse.videos[0].videoUrl)
    assert.equal(resJson.course.enrolledClients, undefined)
    assert.equal(resJson.course.__v, undefined)
  })

  it("returns full media for administrator while withholding internal fields", async () => {
    mockFindById(mockDbCourse)
    const req = {
      params: { id: mockDbCourse._id },
      user: { id: "admin-id", accountType: "Admin" },
    }
    let resStatus = null
    let resJson = null
    const res = {
      status: (code) => {
        resStatus = code
        return {
          json: (data) => {
            resJson = data
          },
        }
      },
    }

    await getCourseDetail(req, res)
    assert.equal(resStatus, 200)
    assert.equal(resJson.hasAccess, true)
    assert.equal(resJson.course.videos[0].videoUrl, mockDbCourse.videos[0].videoUrl)
    assert.equal(resJson.course.enrolledClients, undefined)
    assert.equal(resJson.course.__v, undefined)
  })
})

describe("getCourseVideos playback endpoint protection", () => {
  const creatorId = "672000000000000000000010"
  const enrolledUserId = "672000000000000000000020"
  const unenrolledUserId = "672000000000000000000030"

  const mockDbCourse = {
    _id: "672000000000000000000100",
    title: "Holistic Health Masterclass",
    price: 2499,
    isFree: false,
    practitioner: creatorId,
    enrolledClients: [enrolledUserId],
  }

  const origFindById = Course.findById
  const origFindVideos = CourseVideo.find
  const origUpdateMany = CourseVideo.updateMany

  afterEach(() => {
    Course.findById = origFindById
    CourseVideo.find = origFindVideos
    CourseVideo.updateMany = origUpdateMany
  })

  it("returns 403 when user is not entitled to paid course videos", async () => {
    Course.findById = () => ({
      lean: async () => JSON.parse(JSON.stringify(mockDbCourse)),
    })

    const req = {
      params: { id: mockDbCourse._id },
      user: { id: unenrolledUserId, accountType: "Learner" },
    }
    let resStatus = null
    let resJson = null
    const res = {
      status: (code) => {
        resStatus = code
        return {
          json: (data) => {
            resJson = data
          },
        }
      },
    }

    await getCourseVideos(req, res)
    assert.equal(resStatus, 403)
    assert.equal(resJson.success, false)
    assert.match(resJson.message, /Please buy the course to view videos/)
  })

  it("returns 200 with video playback list for entitled user", async () => {
    Course.findById = () => ({
      lean: async () => JSON.parse(JSON.stringify(mockDbCourse)),
    })
    CourseVideo.find = () => ({
      sort: () => ({
        lean: async () => [
          { _id: "v1", title: "Vid 1", videoUrl: "https://s3.example.com/v1.mp4" },
        ],
      }),
    })
    CourseVideo.updateMany = async () => ({ acknowledged: true })

    const req = {
      params: { id: mockDbCourse._id },
      user: { id: enrolledUserId, accountType: "Learner" },
    }
    let resStatus = null
    let resJson = null
    const res = {
      status: (code) => {
        resStatus = code
        return {
          json: (data) => {
            resJson = data
          },
        }
      },
    }

    await getCourseVideos(req, res)
    assert.equal(resStatus, 200)
    assert.equal(resJson.success, true)
    assert.equal(resJson.videos.length, 1)
    assert.equal(resJson.videos[0].videoUrl, "https://s3.example.com/v1.mp4")
  })
})

describe("optionalAuth middleware behavior", () => {
  const secret = "test-jwt-secret-course-access-12345"
  const prevSecret = process.env.JWT_SECRET

  beforeEach(() => {
    process.env.JWT_SECRET = secret
  })

  afterEach(() => {
    process.env.JWT_SECRET = prevSecret
  })

  it("attaches decoded user when valid bearer token is provided", async () => {
    const payload = { id: "user-123", email: "user@example.com", accountType: "Learner" }
    const token = jwt.sign(payload, secret)

    const req = {
      header: (name) => (name.toLowerCase() === "authorization" ? `Bearer ${token}` : null),
      cookies: {},
    }
    let nextCalled = false
    await optionalAuth(req, {}, () => {
      nextCalled = true
    })

    assert.equal(nextCalled, true)
    assert.equal(req.user.id, "user-123")
    assert.equal(req.user.accountType, "Learner")
  })

  it("attaches decoded user when valid cookie token is provided", async () => {
    const payload = { id: "user-456", email: "cookie@example.com", accountType: "Practitioner" }
    const token = jwt.sign(payload, secret)

    const req = {
      header: () => null,
      cookies: { token },
    }
    let nextCalled = false
    await optionalAuth(req, {}, () => {
      nextCalled = true
    })

    assert.equal(nextCalled, true)
    assert.equal(req.user.id, "user-456")
    assert.equal(req.user.accountType, "Practitioner")
  })

  it("ignores tokens in query strings (?token=...) to prevent URL credential leakage", async () => {
    const payload = { id: "user-query", email: "query@example.com", accountType: "Learner" }
    const token = jwt.sign(payload, secret)

    const req = {
      header: () => null,
      cookies: {},
      query: { token },
    }
    let nextCalled = false
    await optionalAuth(req, {}, () => {
      nextCalled = true
    })

    assert.equal(nextCalled, true)
    assert.equal(req.user, undefined)
  })

  it("ignores tokens in request body to prevent body smuggling", async () => {
    const payload = { id: "user-body", email: "body@example.com", accountType: "Learner" }
    const token = jwt.sign(payload, secret)

    const req = {
      header: () => null,
      cookies: {},
      body: { token },
    }
    let nextCalled = false
    await optionalAuth(req, {}, () => {
      nextCalled = true
    })

    assert.equal(nextCalled, true)
    assert.equal(req.user, undefined)
  })

  it("proceeds with undefined user when token is missing", async () => {
    const req = {
      header: () => null,
      cookies: {},
    }
    let nextCalled = false
    await optionalAuth(req, {}, () => {
      nextCalled = true
    })

    assert.equal(nextCalled, true)
    assert.equal(req.user, undefined)
  })

  it("proceeds with undefined user when token is invalid", async () => {
    const req = {
      header: (name) => (name.toLowerCase() === "authorization" ? "Bearer invalid.token.payload" : null),
      cookies: {},
    }
    let nextCalled = false
    await optionalAuth(req, {}, () => {
      nextCalled = true
    })

    assert.equal(nextCalled, true)
    assert.equal(req.user, undefined)
  })

  it("proceeds with undefined user when token is expired", async () => {
    const payload = { id: "user-expired", email: "expired@example.com", accountType: "Learner" }
    const expiredToken = jwt.sign(payload, secret, { expiresIn: -1 })

    const req = {
      header: (name) => (name.toLowerCase() === "authorization" ? `Bearer ${expiredToken}` : null),
      cookies: {},
    }
    let nextCalled = false
    await optionalAuth(req, {}, () => {
      nextCalled = true
    })

    assert.equal(nextCalled, true)
    assert.equal(req.user, undefined)
  })
})

describe("getAllCourses catalogue protection", () => {
  const origFind = Course.find

  afterEach(() => {
    Course.find = origFind
  })

  it("does not expose video URLs, attachments, enrolledClients, or __v in public catalogue", async () => {
    const rawCatalogCourses = [
      {
        _id: "c-101",
        title: "Ayurvedic Foundations",
        description: "Public catalogue entry",
        price: 999,
        isFree: false,
        enrolledClients: ["user-1", "user-2"],
        __v: 3,
        practitioner: { firstName: "Dr. Ayush", lastName: "Sharma" },
        videos: [
          {
            _id: "v-1",
            title: "Intro Lecture",
            durationSeconds: 1200,
            order: 0,
            thumbnail: "thumb.jpg",
          },
        ],
      },
    ]

    Course.find = () => ({
      select: () => ({
        populate: () => ({
          populate: () => ({
            sort: () => ({
              lean: async () => JSON.parse(JSON.stringify(rawCatalogCourses)),
            }),
          }),
        }),
      }),
    })

    let resStatus = null
    let resJson = null
    const res = {
      status: (code) => {
        resStatus = code
        return {
          json: (data) => {
            resJson = data
          },
        }
      },
    }

    await getAllCourses({}, res)
    assert.equal(resStatus, 200)
    assert.equal(resJson.success, true)
    assert.equal(resJson.courses.length, 1)

    const course = resJson.courses[0]
    // Internal fields must be removed
    assert.equal(course.enrolledClients, undefined)
    assert.equal(course.__v, undefined)

    // Public course metadata must be intact
    assert.equal(course.title, "Ayurvedic Foundations")
    assert.equal(course.price, 999)
    assert.equal(course.practitioner.firstName, "Dr. Ayush")

    // Videos overview must be present without protected URLs
    assert.equal(course.videos.length, 1)
    assert.equal(course.videos[0].title, "Intro Lecture")
    assert.equal(course.videos[0].durationSeconds, 1200)
    assert.equal(course.videos[0].videoUrl, undefined)
    assert.equal(course.videos[0].attachments, undefined)
  })
})
