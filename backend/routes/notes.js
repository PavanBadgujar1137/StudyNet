const express = require("express")
const router = express.Router()
const { auth, isInstructor } = require("../middleware/auth")
const {
  uploadNote,
  getNotesByCourse,
  trackDownload,
} = require("../controllers/notes")

router.post("/upload", auth, isInstructor, uploadNote)
router.get("/course/:courseId", auth, getNotesByCourse)
router.post("/:noteId/download", auth, trackDownload)

module.exports = router
