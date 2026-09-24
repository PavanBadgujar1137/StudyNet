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
  getLiveClassToken,
} = require("../controllers/liveClass")

// ── Static Routes First (Express Best Practice to avoid param collisions) ───────
router.get("/upcoming", auth, getUpcomingClasses)
router.get("/instructor/schedule", auth, isInstructor, getInstructorSchedule)
router.post("/schedule", auth, isInstructor, scheduleLiveClass)

// ── Parameterized /:classId Routes ───────────────────────────────────────────
router.get("/:classId/token", auth, getLiveClassToken)
router.post("/:classId/join", auth, joinClass)
router.post("/:classId/leave", auth, leaveClass)
router.post("/:classId/start", auth, isInstructor, startClass)
router.post("/:classId/end", auth, isInstructor, endClass)
router.post("/:classId/reschedule", auth, isInstructor, rescheduleClass)
router.post("/:classId/cancel", auth, isInstructor, cancelClass)
router.post("/:classId/publish-recording", auth, isInstructor, publishRecording)
router.get("/:classId", auth, getClassById)

module.exports = router
