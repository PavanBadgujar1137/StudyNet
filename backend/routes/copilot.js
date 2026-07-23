const express = require("express")
const router = express.Router()
const { generateDraftNotes, approveDraftNotes } = require("../controllers/copilot")
const { auth, isPractitioner } = require("../middleware/auth")

router.post("/suggest", auth, isPractitioner, generateDraftNotes)
router.post("/approve-draft", auth, isPractitioner, approveDraftNotes)

module.exports = router
