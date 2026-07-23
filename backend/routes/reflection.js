const express = require("express")
const router = express.Router()
const { getClientPrompts, answerPrompt } = require("../controllers/reflection")
const { auth, isClient } = require("../middleware/auth")

router.get("/", auth, isClient, getClientPrompts)
router.post("/answer", auth, isClient, answerPrompt)

module.exports = router
