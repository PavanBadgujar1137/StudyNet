const Course = require("../models/Course")
const CourseVideo = require("../models/CourseVideo")
const Subscription = require("../models/Subscription")
const User = require("../models/User")
const { uploadFileToS3 } = require("../utils/imageUploader")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3")
const s3Client = require("../config/s3")
const path = require("path")
const mime = require("mime-types")
const mailSender = require("../utils/mailSender")
const { courseUpdatedEmail } = require("../mail/templates/courseUpdatedEmail")
const ClientConnection = require("../models/ClientConnection")

const BUCKET = process.env.AWS_S3_BUCKET_NAME
const REGION = process.env.AWS_REGION || "ap-south-1"
const FOLDER_PREFIX = process.env.AWS_S3_FOLDER || "openhand/uat"
const CLOUDFRONT_DOMAIN = process.env.AWS_CLOUDFRONT_DOMAIN

function buildFileUrl(key) {
  if (CLOUDFRONT_DOMAIN) return `https://${CLOUDFRONT_DOMAIN}/${key}`
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`
}
function buildS3Key(folder, originalName) {
  const ts = Date.now()
  const ext = path.extname(originalName || "file") || ""
  const base = path.basename(originalName || "upload", ext).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80)
  return `${FOLDER_PREFIX}/${folder}/${ts}-${base}${ext}`
}

// ─── Notification Helper: Email Enrolled / Associated Learners ───────────────
const notifyEnrolledLearnersOfCourseUpdate = async (courseId, practitionerId, updateSummary = "") => {
  try {
    const course = await Course.findById(courseId).populate("practitioner", "firstName lastName")
    if (!course) return

    const practitionerName = course.practitioner
      ? `${course.practitioner.firstName || ""} ${course.practitioner.lastName || ""}`.trim()
      : "Your Practitioner"

    // 1. Gather all associated learner IDs:
    const enrolledClientIds = (course.enrolledClients || []).map(id => String(id))

    // Users with this course in their courses array
    const usersWithCourse = await User.find({
      courses: courseId,
      isDeleted: { $ne: true },
      accountType: { $in: ["Learner", "Client", "Student"] },
    }).select("_id email firstName lastName").lean()

    // Clients actively connected with this practitioner
    const activeConnections = await ClientConnection.find({
      practitioner: practitionerId,
      status: { $in: ["approved", "active"] },
    }).select("client").lean()

    const connectedClientIds = activeConnections.map(c => String(c.client)).filter(Boolean)

    // Merge unique client IDs
    const allLearnerIds = Array.from(new Set([...enrolledClientIds, ...connectedClientIds]))

    const additionalLearners = allLearnerIds.length > 0
      ? await User.find({
          _id: { $in: allLearnerIds },
          isDeleted: { $ne: true },
          accountType: { $in: ["Learner", "Client", "Student"] },
        }).select("_id email firstName lastName").lean()
      : []

    // Map unique learners by email
    const learnerMap = new Map()
    usersWithCourse.forEach(u => { if (u.email) learnerMap.set(u.email.toLowerCase(), u) })
    additionalLearners.forEach(u => { if (u.email) learnerMap.set(u.email.toLowerCase(), u) })

    const uniqueLearners = Array.from(learnerMap.values())
    if (uniqueLearners.length === 0) {
      console.log(`[CourseUpdateNotification] No learners found to notify for courseId=${courseId}`)
      return
    }

    console.log(`[CourseUpdateNotification] Sending update emails to ${uniqueLearners.length} learner(s) for course "${course.title}"`)

    const frontendUrl = process.env.FRONTEND_URL || "https://openhand.live"
    const courseUrl = `${frontendUrl}/courses/${courseId}`

    // Send emails in background (non-blocking)
    const emailPromises = uniqueLearners.map(async (learner) => {
      try {
        const learnerName = `${learner.firstName || ""} ${learner.lastName || ""}`.trim() || "Learner"
        const html = courseUpdatedEmail(course.title, learnerName, practitionerName, updateSummary, courseUrl)
        await mailSender(
          learner.email,
          `Course Updated: ${course.title}`,
          html
        )
      } catch (err) {
        console.error(`[CourseUpdateNotification] Error sending to ${learner.email}:`, err.message)
      }
    })

    await Promise.allSettled(emailPromises)
  } catch (err) {
    console.error("[CourseUpdateNotification] Failed to send update notifications:", err.message)
  }
}


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
      const uploaded = await uploadFileToS3(req.files.thumbnail, "course_thumbnails")
      thumbnailUrl = uploaded.url
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
      const uploaded = await uploadFileToS3(req.files.thumbnail, "course_thumbnails")
      course.thumbnail = uploaded.url
    }

    await course.save()

    // Trigger notification emails to all enrolled & associated learners
    notifyEnrolledLearnersOfCourseUpdate(
      course._id,
      practitionerId,
      `Course details, syllabus, or learning overview for "${course.title}" have been updated.`
    )

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

// ─── PRESIGN VIDEO UPLOAD (Practitioner) — Step 1 of direct-to-S3 flow ────────
// Returns a presigned PUT URL so the browser can upload directly to S3.
// No file data touches the Node.js server or Nginx — eliminates size/timeout issues.
exports.presignVideoUpload = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const { id: courseId } = req.params
    const { fileName } = req.body

    if (!fileName) {
      return res.status(400).json({ success: false, message: "fileName is required" })
    }
    if (!BUCKET) {
      return res.status(500).json({ success: false, message: "S3 bucket not configured" })
    }

    const course = await Course.findOne({ _id: courseId, practitioner: practitionerId })
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found or not authorized" })
    }

    const key = buildS3Key("course_videos", fileName)

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })

    // Do not sign Content-Type / checksum headers — browser CORS PUT only uses host.
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 14400 })
    const publicUrl = buildFileUrl(key)

    console.log(`[Presign] courseId=${courseId} key=${key}`)
    return res.status(200).json({ success: true, presignedUrl, publicUrl, key })
  } catch (error) {
    console.error("presignVideoUpload error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── CONFIRM VIDEO UPLOAD (Practitioner) — Step 2 of direct-to-S3 flow ─────────
// Called after the browser has finished uploading directly to S3.
// Creates the CourseVideo DB record and adds it to the course.
exports.confirmVideoUpload = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const { id: courseId } = req.params
    const { title, description, videoUrl, key, durationSeconds, order } = req.body

    if (!title) {
      return res.status(400).json({ success: false, message: "Video title is required" })
    }
    if (!videoUrl) {
      return res.status(400).json({ success: false, message: "videoUrl is required" })
    }

    const course = await Course.findOne({ _id: courseId, practitioner: practitionerId })
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found or not authorized" })
    }

    const video = await CourseVideo.create({
      title,
      description: description || "",
      videoUrl,
      s3Key: key || "",
      thumbnail: "",
      durationSeconds: Number(durationSeconds || 0),
      order: Number(order ?? course.videos.length),
      course: courseId,
    })

    course.videos.push(video._id)
    await course.save()

    notifyEnrolledLearnersOfCourseUpdate(
      courseId,
      practitionerId,
      `A new video lecture "${title}" has been added to the course.`
    )

    console.log(`[Confirm] Video saved courseId=${courseId} videoId=${video._id}`)
    return res.status(201).json({ success: true, message: "Video added successfully", video })
  } catch (error) {
    console.error("confirmVideoUpload error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── ADD VIDEO TO COURSE (Practitioner) — Legacy fallback for URL-only additions ─
// Used when practitioner provides a YouTube / external link (no file upload needed).
exports.addVideoToCourse = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const { id: courseId } = req.params
    const { title, description, videoUrl: bodyVideoUrl, durationSeconds, order } = req.body

    if (!title) {
      return res.status(400).json({ success: false, message: "Video title is required" })
    }
    if (!req.files?.video && !bodyVideoUrl?.trim()) {
      return res.status(400).json({ success: false, message: "Video file or URL is required" })
    }

    const course = await Course.findOne({ _id: courseId, practitioner: practitionerId })
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found or not authorized" })
    }

    let videoUrl = bodyVideoUrl?.trim() || ""
    if (req.files?.video) {
      // Server-side upload fallback (small files only)
      const uploadResult = await uploadFileToS3(req.files.video, "course_videos")
      videoUrl = uploadResult.url
    }

    let thumbnailUrl = ""
    if (req.files?.thumbnail) {
      const thumbResult = await uploadFileToS3(req.files.thumbnail, "video_thumbnails")
      thumbnailUrl = thumbResult.url
    }

    const video = await CourseVideo.create({
      title,
      description: description || "",
      videoUrl,
      thumbnail: thumbnailUrl,
      durationSeconds: Number(durationSeconds || 0),
      order: Number(order || course.videos.length),
      course: courseId,
    })

    course.videos.push(video._id)
    await course.save()

    notifyEnrolledLearnersOfCourseUpdate(
      courseId,
      practitionerId,
      `A new video lecture "${title}" has been added to the course.`
    )

    return res.status(201).json({ success: true, message: "Video added successfully", video })
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

// ─── UPDATE VIDEO IN COURSE (Practitioner) ──────────────────────────────────
exports.updateVideoInCourse = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const { courseId, videoId } = req.params
    const { title, description, durationSeconds, videoUrl } = req.body

    const course = await Course.findOne({ _id: courseId, practitioner: practitionerId })
    if (!course) return res.status(404).json({ success: false, message: "Not authorized or course not found" })

    const updateFields = {}
    if (title !== undefined) updateFields.title = title
    if (description !== undefined) updateFields.description = description
    if (durationSeconds !== undefined) updateFields.durationSeconds = Number(durationSeconds)
    if (videoUrl !== undefined) updateFields.videoUrl = videoUrl

    const updatedVideo = await CourseVideo.findByIdAndUpdate(videoId, updateFields, { new: true })

    notifyEnrolledLearnersOfCourseUpdate(
      courseId,
      practitionerId,
      `Video lecture "${title || updatedVideo?.title || 'content'}" has been updated.`
    )

    return res.status(200).json({ success: true, message: "Video updated", video: updatedVideo })
  } catch (error) {
    console.error("updateVideoInCourse error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── REORDER VIDEOS IN COURSE (Practitioner) ────────────────────────────────
exports.reorderVideos = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const { id: courseId } = req.params
    const { videoIds } = req.body

    if (!Array.isArray(videoIds)) {
      return res.status(400).json({ success: false, message: "videoIds must be an array" })
    }

    const course = await Course.findOne({ _id: courseId, practitioner: practitionerId })
    if (!course) return res.status(404).json({ success: false, message: "Course not found or not authorized" })

    course.videos = videoIds
    await course.save()

    const updateOps = videoIds.map((vidId, index) => ({
      updateOne: {
        filter: { _id: vidId, course: courseId },
        update: { $set: { order: index } },
      },
    }))
    if (updateOps.length > 0) {
      await CourseVideo.bulkWrite(updateOps)
    }

    return res.status(200).json({ success: true, message: "Videos reordered successfully" })
  } catch (error) {
    console.error("reorderVideos error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── GET MY COURSES (Practitioner) ────────────────────────────────────────────
exports.getPractitionerCourses = async (req, res) => {
  try {
    const practitionerId = req.user.id

    const courses = await Course.find({ practitioner: practitionerId })
      .populate("videos", "title description videoUrl durationSeconds order thumbnail views")
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
      .populate("videos", "title description videoUrl durationSeconds order thumbnail")
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
      .populate("videos", "title description videoUrl durationSeconds order thumbnail")
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
