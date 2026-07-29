const Course = require("../models/Course")
const CourseVideo = require("../models/CourseVideo")
const Subscription = require("../models/Subscription")
const User = require("../models/User")
const cloudinary = require("cloudinary").v2

// ─── CREATE COURSE (Practitioner) ─────────────────────────────────────────────
exports.createCourse = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const { title, description, tags, requiredPlan } = req.body

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

    const course = await Course.create({
      title,
      description: description || "",
      thumbnail: thumbnailUrl,
      practitioner: practitionerId,
      tags: tags ? JSON.parse(tags) : [],
      requiredPlan: requiredPlan || null,
      status: "draft",
    })

    return res.status(201).json({ success: true, message: "Course created", course })
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
    const { title, description, tags, requiredPlan, status } = req.body

    const course = await Course.findOne({ _id: id, practitioner: practitionerId })
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found or not authorized" })
    }

    if (title) course.title = title
    if (description !== undefined) course.description = description
    if (tags) course.tags = typeof tags === "string" ? JSON.parse(tags) : tags
    if (requiredPlan !== undefined) course.requiredPlan = requiredPlan
    if (status) course.status = status

    if (req.files?.thumbnail) {
      const uploaded = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath, {
        folder: "openhand/course_thumbnails",
        resource_type: "image",
      })
      course.thumbnail = uploaded.secure_url
    }

    await course.save()
    return res.status(200).json({ success: true, message: "Course updated", course })
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

    // Upload video to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.files.video.tempFilePath, {
      folder: "openhand/course_videos",
      resource_type: "video",
      chunk_size: 6000000, // 6MB chunks for large files
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

const PLAN_RANKS = { starter: 1, growth: 2, practice: 3, master: 3 }

function hasTierAccess(userPlanKey, requiredPlanKey) {
  if (!requiredPlanKey) return true // free course
  if (!userPlanKey) return false
  const userRank = PLAN_RANKS[String(userPlanKey).toLowerCase()] || 0
  const reqRank = PLAN_RANKS[String(requiredPlanKey).toLowerCase()] || 0
  return userRank >= reqRank
}

// ─── GET COURSE DETAIL with ACCESS CHECK (Client) ─────────────────────────────
exports.getCourseDetail = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    const course = await Course.findById(id)
      .populate("practitioner", "firstName lastName image")
      .populate("videos", "title durationSeconds order thumbnail")
      .lean()

    if (!course) return res.status(404).json({ success: false, message: "Course not found" })

    // Check if user has access according to plan tier
    let hasAccess = false
    if (userId) {
      const isEnrolled = course.enrolledClients.map(String).includes(String(userId))
      if (isEnrolled) {
        hasAccess = true
      } else if (!course.requiredPlan) {
        hasAccess = true // Free course
      } else {
        const sub = await Subscription.findOne({ client: userId, status: "active" })
        const userObj = await User.findById(userId).select("activePlan")
        const userPlan = sub?.planKey || userObj?.activePlan || null
        hasAccess = hasTierAccess(userPlan, course.requiredPlan)
      }
    }

    return res.status(200).json({ success: true, course, hasAccess })
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

    // Access check: direct enrollment or plan tier requirement
    const isEnrolled = course.enrolledClients.map(String).includes(String(userId))
    const sub = await Subscription.findOne({ client: userId, status: "active" })
    const userObj = await User.findById(userId).select("activePlan")
    const userPlan = sub?.planKey || userObj?.activePlan || null

    const hasAccess = isEnrolled || hasTierAccess(userPlan, course.requiredPlan)

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: `This course requires a ${course.requiredPlan} plan or higher.`
      })
    }

    const videos = await CourseVideo.find({ course: courseId }).sort({ order: 1 }).lean()

    // Increment views on access
    await CourseVideo.updateMany({ course: courseId }, { $inc: { views: 1 } })

    return res.status(200).json({ success: true, videos })
  } catch (error) {
    console.error("getCourseVideos error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

