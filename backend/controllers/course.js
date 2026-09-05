const Course = require("../models/Course")
const CourseVideo = require("../models/CourseVideo")
const Subscription = require("../models/Subscription")
const User = require("../models/User")
const cloudinary = require("cloudinary").v2

// ─── CREATE COURSE (Practitioner) ─────────────────────────────────────────────
exports.createCourse = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const { title, description, tags, price = 0, isFree = true } = req.body

    if (!title) {
      return res.status(400).json({ success: false, message: "Course title is required" })
    }

    let thumbnailUrl = ""
    if (req.files?.thumbnail) {
      const uploaded = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath, {
        folder: "openhand/course_thumbnails",
        resource_type: "image",
      })
      thumbnailUrl = uploaded.secure_url
    }

    const numPrice = Number(price) || 0
    const courseIsFree = numPrice === 0 || isFree === true || isFree === "true"

    const course = await Course.create({
      title,
      description: description || "",
      thumbnail: thumbnailUrl,
      practitioner: practitionerId,
      tags: tags ? (typeof tags === "string" ? JSON.parse(tags) : tags) : [],
      price: numPrice,
      isFree: courseIsFree,
      requiredPlan: null,
      status: "draft",
    })

    return res.status(201).json({ success: true, message: "Course created successfully", course })
  } catch (error) {
    console.error("createCourse error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── UPDATE COURSE (Practitioner) ─────────────────────────────────────────────
exports.updateCourse = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const { id } = req.params
    const { title, description, tags, status, price, isFree } = req.body

    const course = await Course.findOne({ _id: id, practitioner: practitionerId })
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found or not authorized" })
    }

    if (title) course.title = title
    if (description !== undefined) course.description = description
    if (tags) course.tags = typeof tags === "string" ? JSON.parse(tags) : tags
    if (status) course.status = status
    if (price !== undefined) {
      course.price = Number(price) || 0
      course.isFree = course.price === 0
    }
    if (isFree !== undefined) {
      course.isFree = isFree === true || isFree === "true"
      if (course.isFree) course.price = 0
    }

    if (req.files?.thumbnail) {
      const uploaded = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath, {
        folder: "openhand/course_thumbnails",
        resource_type: "image",
      })
      course.thumbnail = uploaded.secure_url
    }

    await course.save()
    return res.status(200).json({ success: true, message: "Course updated successfully", course })
  } catch (error) {
    console.error("updateCourse error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE COURSE (Practitioner) ─────────────────────────────────────────────
exports.deleteCourse = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const { id } = req.params

    const course = await Course.findOne({ _id: id, practitioner: practitionerId })
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found or not authorized" })
    }

    // ITEM 23 FIX: Published courses cannot be deleted directly
    if (course.status === "published") {
      return res.status(400).json({
        success: false,
        message: "Published courses cannot be deleted directly while live. Please unpublish the course to draft mode first, notify enrolled learners, and handle refund processing if applicable.",
      })
    }

    // Remove all videos in this course
    await CourseVideo.deleteMany({ course: id })
    await Course.findByIdAndDelete(id)


    return res.status(200).json({ success: true, message: "Course deleted" })
  } catch (error) {
    console.error("deleteCourse error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── ADD VIDEO TO COURSE (Practitioner) ───────────────────────────────────────
exports.addVideoToCourse = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const { id: courseId } = req.params
    const { title, description, durationSeconds, order } = req.body

    if (!title) {
      return res.status(400).json({ success: false, message: "Video title is required" })
    }
    if (!req.files?.video) {
      return res.status(400).json({ success: false, message: "Video file is required" })
    }

    const course = await Course.findOne({ _id: courseId, practitioner: practitionerId })
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found or not authorized" })
    }

    // Upload video to Cloudinary using upload_large for large files (MP4, MOV, AVI)
    const uploadResult = await cloudinary.uploader.upload_large(req.files.video.tempFilePath, {
      folder: "openhand/course_videos",
      resource_type: "video",
      chunk_size: 6000000, // 6MB chunking for large video files
    })


    let thumbnailUrl = ""
    if (req.files?.thumbnail) {
      const thumbResult = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath, {
        folder: "openhand/video_thumbnails",
        resource_type: "image",
      })
      thumbnailUrl = thumbResult.secure_url
    }

    // Auto-generate thumbnail from video if not provided
    if (!thumbnailUrl && uploadResult.public_id) {
      thumbnailUrl = cloudinary.url(uploadResult.public_id, {
        resource_type: "video",
        format: "jpg",
        transformation: [{ start_offset: "1" }],
      })
    }

    const video = await CourseVideo.create({
      title,
      description: description || "",
      videoUrl: uploadResult.secure_url,
      thumbnail: thumbnailUrl,
      durationSeconds: Number(durationSeconds || uploadResult.duration || 0),
      order: Number(order || course.videos.length),
      course: courseId,
    })

    // Add video to course's videos array
    course.videos.push(video._id)
    await course.save()

    return res.status(201).json({ success: true, message: "Video uploaded successfully", video })
  } catch (error) {
    console.error("addVideoToCourse error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── DELETE VIDEO FROM COURSE (Practitioner) ──────────────────────────────────
exports.deleteVideo = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const { courseId, videoId } = req.params

    const course = await Course.findOne({ _id: courseId, practitioner: practitionerId })
    if (!course) return res.status(404).json({ success: false, message: "Not authorized" })

    await CourseVideo.findByIdAndDelete(videoId)
    course.videos = course.videos.filter((v) => String(v) !== String(videoId))
    await course.save()

    return res.status(200).json({ success: true, message: "Video deleted" })
  } catch (error) {
    console.error("deleteVideo error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET MY COURSES (Practitioner) ────────────────────────────────────────────
exports.getPractitionerCourses = async (req, res) => {
  try {
    const practitionerId = req.user.id

    const courses = await Course.find({ practitioner: practitionerId })
      .populate("videos", "title durationSeconds order thumbnail views")
      .sort({ createdAt: -1 })
      .lean()

    return res.status(200).json({ success: true, courses })
  } catch (error) {
    console.error("getPractitionerCourses error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET ALL PUBLISHED COURSES (Client / Public) ──────────────────────────────
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: "published" })
      .populate("practitioner", "firstName lastName image")
      .populate("videos", "title durationSeconds order thumbnail")
      .sort({ createdAt: -1 })
      .lean()

    return res.status(200).json({ success: true, courses })
  } catch (error) {
    console.error("getAllCourses error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

const PLAN_RANKS = { beginner: 1, advance: 2, champion: 3, starter: 1, growth: 2, practice: 3, master: 3 }

async function getUserAccessContext(userId) {
  if (!userId) return { planKey: null, isTrialActive: false, isExpired: true }

  const now = new Date()
  const sub = await Subscription.findOne({ client: userId, status: "active" }).sort({ createdAt: -1 }).lean()

  if (sub && new Date(sub.endDate) > now) {
    return { planKey: sub.planKey, isTrialActive: false, isExpired: false }
  }

  const userObj = await User.findById(userId).select("trialStartedAt trialExpiresAt createdAt activePlan accountType").lean()
  const trialDays = (userObj?.accountType === "Learner" || userObj?.accountType === "Client") ? 7 : 14
  const trialExpiresAt = userObj?.trialExpiresAt || (userObj?.createdAt ? new Date(new Date(userObj.createdAt).getTime() + trialDays * 24 * 60 * 60 * 1000) : null)

  const isTrialActive = trialExpiresAt && now < new Date(trialExpiresAt)
  if (isTrialActive) {
    return { planKey: "advance", isTrialActive: true, isExpired: false }
  }

  return { planKey: "none", isTrialActive: false, isExpired: true }
}

function checkAccess(accessCtx, requiredPlanKey) {
  if (!requiredPlanKey) return true // Free course open to all
  if (accessCtx.isExpired && accessCtx.planKey === "none") return false // Trial expired & no subscription

  const userRank = PLAN_RANKS[String(accessCtx.planKey).toLowerCase()] || 0
  const reqRank = PLAN_RANKS[String(requiredPlanKey).toLowerCase()] || 0
  return userRank >= reqRank
}

// ─── GET COURSE DETAIL with ACCESS CHECK (Client) ─────────────────────────────
exports.getCourseDetail = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    const course = await Course.findById(id)
      .populate("practitioner", "firstName lastName image email")
      .populate("videos", "title durationSeconds order thumbnail")
      .lean()

    if (!course) return res.status(404).json({ success: false, message: "Course not found" })

    let hasAccess = false
    let accessNotice = null

    if (userId) {
      const isEnrolled = (course.enrolledClients || []).map(String).includes(String(userId))
      const isCreator = String(course.practitioner?._id || course.practitioner) === String(userId)

      if (isCreator || isEnrolled) {
        hasAccess = true
      } else if (course.price > 0 && !course.isFree) {
        // Paid Course: requires separate purchase
        hasAccess = false
        accessNotice = `This is a premium paid course (₹${course.price}). Please purchase to unlock access.`
      } else {
        // Free Course created by practitioner:
        // Available during 14-day free trial OR with an active Learner subscription plan
        const accessCtx = await getUserAccessContext(userId)
        if (!accessCtx.isExpired || accessCtx.planKey !== "none") {
          hasAccess = true
        } else {
          hasAccess = false
          accessNotice = "Your free trial has expired. Subscribe to a Learner Plan to unlock practitioner free courses."
        }
      }
    }

    return res.status(200).json({ success: true, course, hasAccess, accessNotice })
  } catch (error) {
    console.error("getCourseDetail error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET COURSE VIDEOS for PLAYBACK (Client with Access) ──────────────────────
exports.getCourseVideos = async (req, res) => {
  try {
    const { id: courseId } = req.params
    const userId = req.user.id

    const course = await Course.findById(courseId).lean()
    if (!course) return res.status(404).json({ success: false, message: "Course not found" })

    const isEnrolled = (course.enrolledClients || []).map(String).includes(String(userId))
    const isCreator = String(course.practitioner) === String(userId)

    let hasAccess = isCreator || isEnrolled

    if (!hasAccess) {
      if (course.price > 0 && !course.isFree) {
        return res.status(403).json({
          success: false,
          message: `This is a premium paid course (₹${course.price}). Please buy the course to view videos.`,
        })
      }

      const accessCtx = await getUserAccessContext(userId)
      if (!accessCtx.isExpired || accessCtx.planKey !== "none") {
        hasAccess = true
      } else {
        return res.status(403).json({
          success: false,
          message: "Your 7-day free trial has expired. Please subscribe to a Learner Plan to access practitioner free courses.",
        })
      }
    }

    const videos = await CourseVideo.find({ course: courseId }).sort({ order: 1 }).lean()
    await CourseVideo.updateMany({ course: courseId }, { $inc: { views: 1 } })

    return res.status(200).json({ success: true, videos })
  } catch (error) {
    console.error("getCourseVideos error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

