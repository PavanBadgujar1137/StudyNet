const express = require("express")
const router = express.Router()
const { auth, isInstructor } = require("../middleware/auth")
const {
  createRecordedLecture,
  getLecturesByCourse,
  getLecturePlayback,
} = require("../controllers/recordedLecture")

router.post("/create", auth, isInstructor, createRecordedLecture)
router.get("/course/:courseId", auth, getLecturesByCourse)
router.get("/:lectureId/playback", auth, getLecturePlayback)

module.exports = router
