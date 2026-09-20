const express = require("express")
const router = express.Router()
const { getClientPrompts, answerPrompt, createPractitionerPrompt, getPractitionerReflections } = require("../controllers/reflection")
const { auth, isClient, isPractitioner } = require("../middleware/auth")

router.get("/", auth, isClient, getClientPrompts)
router.post("/answer", auth, isClient, answerPrompt)

router.post("/create", auth, isPractitioner, createPractitionerPrompt)
router.get("/practitioner", auth, isPractitioner, getPractitionerReflections)

module.exports = router
