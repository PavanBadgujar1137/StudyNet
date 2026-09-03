const express = require("express")
const router = express.Router()
const { auth, isInstructor, isStudent } = require("../middleware/auth")
const {
  scheduleLiveClass,
  getInstructorSchedule,
  getUpcomingClasses,
  startClass,
  endClass,
  joinClass,
  leaveClass,
  rescheduleClass,
  cancelClass,
  publishRecording,
  getClassById,
} = require("../controllers/liveClass")

// ── Shared (auth required for Students and Practitioners) ────────────────────
router.get("/upcoming", auth, getUpcomingClasses)
router.post("/:classId/join", auth, joinClass)
router.post("/:classId/leave", auth, leaveClass)
router.get("/:classId", auth, getClassById)

// ── Instructor / Practitioner Routes ──────────────────────────────────────────
router.post("/schedule", auth, isInstructor, scheduleLiveClass)
router.get("/instructor/schedule", auth, isInstructor, getInstructorSchedule)
router.post("/:classId/start", auth, isInstructor, startClass)
router.post("/:classId/end", auth, isInstructor, endClass)
router.post("/:classId/reschedule", auth, isInstructor, rescheduleClass)
router.post("/:classId/cancel", auth, isInstructor, cancelClass)
router.post("/:classId/publish-recording", auth, isInstructor, publishRecording)

module.exports = router
