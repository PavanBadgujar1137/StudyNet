const express = require("express")
const router = express.Router()
const { getMyMilestones, createMilestone } = require("../controllers/milestone")
const { auth } = require("../middleware/auth")

router.get("/mine", auth, getMyMilestones)
router.post("/", auth, createMilestone)

module.exports = router
