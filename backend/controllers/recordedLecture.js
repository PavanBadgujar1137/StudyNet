const RecordedLecture = require("../models/RecordedLecture")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")
const { GetObjectCommand } = require("@aws-sdk/client-s3")
const s3Client = require("../config/s3")

const BUCKET = process.env.AWS_S3_BUCKET_NAME
const REGION = process.env.AWS_REGION || "ap-south-1"

/**
 * Extracts the S3 object key from a full S3 URL.
 * URL format: https://<bucket>.s3.<region>.amazonaws.com/<key>
 */
function extractS3Key(url) {
  try {
    const urlObj = new URL(url)
    // Remove leading slash from pathname to get the key
    return urlObj.pathname.replace(/^\//, "")
  } catch {
    return null
  }
}

/**
 * Generates a presigned URL for private S3 objects (1-hour expiry).
 * Falls back to the original URL if signing fails.
 */
async function generatePresignedUrl(objectUrl) {
  const key = extractS3Key(objectUrl)
  if (!key || !BUCKET) return objectUrl

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    })
    return presignedUrl
  } catch (err) {
    console.warn("S3 presigned URL generation failed, using direct URL:", err.message)
    return objectUrl
  }
}

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

    // Generate S3 presigned URL for secure, time-limited video playback
    const signedUrl = await generatePresignedUrl(lecture.videoUrl)

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
