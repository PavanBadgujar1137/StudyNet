const RecordedLecture = require("../models/RecordedLecture")
const cloudinary = require("cloudinary").v2

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTOR: Create a recorded lecture (or link from ended live class)
// ─────────────────────────────────────────────────────────────────────────────
exports.createRecordedLecture = async (req, res) => {
  try {
    const instructorId = req.user.id
    const {
      title,
      description,
      videoUrl,
      thumbnail,
      durationSeconds,
      courseId,
      sectionId,
      subsectionId,
      watermarkEnabled,
    } = req.body

    if (!title || !videoUrl || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Title, videoUrl, and courseId are required.",
      })
    }

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." })
    }

    if (String(course.instructor) !== String(instructorId)) {
      return res.status(403).json({ success: false, message: "Unauthorized." })
    }

    const lecture = await RecordedLecture.create({
      title,
      description: description || "",
      videoUrl,
      thumbnail: thumbnail || "",
      durationSeconds: Number(durationSeconds || 0),
      course: courseId,
      section: sectionId || undefined,
      subsection: subsectionId || undefined,
      watermarkEnabled: watermarkEnabled !== false,
    })

    return res.status(201).json({
      success: true,
      message: "Recorded lecture created successfully.",
      data: lecture,
    })
  } catch (error) {
    console.error("createRecordedLecture error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT / INSTRUCTOR: Get all recorded lectures for a course
// ─────────────────────────────────────────────────────────────────────────────
exports.getLecturesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params

    const lectures = await RecordedLecture.find({ course: courseId })
      .populate("resources")
      .sort({ createdAt: 1 })
      .lean()

    return res.status(200).json({ success: true, data: lectures })
  } catch (error) {
    console.error("getLecturesByCourse error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT / INSTRUCTOR: Get signed video playback details + telemetry views
// ─────────────────────────────────────────────────────────────────────────────
exports.getLecturePlayback = async (req, res) => {
  try {
    const userId = req.user.id
    const { lectureId } = req.params

    const lecture = await RecordedLecture.findById(lectureId).populate("resources")
    if (!lecture) {
      return res.status(404).json({ success: false, message: "Lecture not found." })
    }

    // Verify enrollment if student
    if (req.user.accountType === "Student") {
      const course = await Course.findById(lecture.course)
      const isEnrolled = course?.studentsEnroled.map(String).includes(String(userId))
      if (!isEnrolled) {
        return res.status(403).json({
          success: false,
          message: "You must enroll in the course to view this lecture.",
        })
      }
    }

    // Generate signed / expiring video URL (best effort, falls back to direct URL)
    let signedUrl = lecture.videoUrl
    if (lecture.videoUrl.includes("cloudinary.com")) {
      try {
        // Extract public ID from Cloudinary URL
        const parts = lecture.videoUrl.split("/")
        const uploadIndex = parts.indexOf("upload")
        if (uploadIndex !== -1) {
          const publicIdWithExtension = parts.slice(uploadIndex + 2).join("/")
          const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "") // strip extension
          
          signedUrl = cloudinary.url(publicId, {
            resource_type: "video",
            sign_url: true,
            type: "authenticated",
            expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
          })
        }
      } catch (err) {
        console.warn("Cloudinary URL signing failed, using fallback:", err.message)
      }
    }

    // Telemetry: increment view count
    lecture.views += 1
    await lecture.save()

    return res.status(200).json({
      success: true,
      data: {
        _id: lecture._id,
        title: lecture.title,
        description: lecture.description,
        videoUrl: signedUrl,
        thumbnail: lecture.thumbnail,
        durationSeconds: lecture.durationSeconds,
        watermarkEnabled: lecture.watermarkEnabled,
        resources: lecture.resources,
      },
    })
  } catch (error) {
    console.error("getLecturePlayback error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}
