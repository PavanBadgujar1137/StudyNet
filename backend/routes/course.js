const express = require("express")
const router = express.Router()
const { auth, isInstructor } = require("../middleware/auth")
const {
  createCourse,
  updateCourse,
  deleteCourse,
  addVideoToCourse,
  presignVideoUpload,
  confirmVideoUpload,
  updateVideoInCourse,
  deleteVideo,
  getPractitionerCourses,
  getAllCourses,
  getCourseDetail,
  getCourseVideos,
} = require("../controllers/course")

// ─── Public / Client routes ───────────────────────────────────────────────────
router.get("/", getAllCourses)
router.get("/:id", getCourseDetail)
router.get("/:id/videos", auth, getCourseVideos)

// ─── Practitioner routes ──────────────────────────────────────────────────────
router.get("/practitioner/my-courses", auth, isInstructor, getPractitionerCourses)
router.post("/", auth, isInstructor, createCourse)
router.put("/:id", auth, isInstructor, updateCourse)
router.delete("/:id", auth, isInstructor, deleteCourse)

// Direct-to-S3 upload flow (recommended for large video files)
// Step 1: get presigned URL → browser uploads directly to S3
router.post("/:id/videos/presign", auth, isInstructor, presignVideoUpload)
// Step 2: confirm upload → save video record in DB
router.post("/:id/videos/confirm", auth, isInstructor, confirmVideoUpload)

// Legacy: server-side upload (for YouTube URL links only)
router.post("/:id/videos", auth, isInstructor, addVideoToCourse)

router.put("/:courseId/videos/:videoId", auth, isInstructor, updateVideoInCourse)
router.delete("/:courseId/videos/:videoId", auth, isInstructor, deleteVideo)

module.exports = router
