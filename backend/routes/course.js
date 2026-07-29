const express = require("express")
const router = express.Router()
const { auth, isInstructor } = require("../middleware/auth")
const {
  createCourse,
  updateCourse,
  deleteCourse,
  addVideoToCourse,
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
router.post("/:id/videos", auth, isInstructor, addVideoToCourse)
router.delete("/:courseId/videos/:videoId", auth, isInstructor, deleteVideo)

module.exports = router
