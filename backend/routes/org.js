const express = require("express")
const router = express.Router()
const { getOrgAggregateTelemetry, bookConversation } = require("../controllers/org")
const { auth, isOrgAdmin } = require("../middleware/auth")

// Public route — "Book a Conversation" from For Organizations page
router.post("/book-conversation", bookConversation)

// Protected org admin routes
router.get("/aggregate-stats", auth, isOrgAdmin, getOrgAggregateTelemetry)

module.exports = router
