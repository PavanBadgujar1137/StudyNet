const express = require("express")
const router = express.Router()

const { auth } = require("../middleware/auth")
const {
  getGlobalMessages,
  sendGlobalMessage,
  getPractitionerGroupMessages,
  sendPractitionerGroupMessage,
  getDirectMessages,
  sendDirectMessage,
  getChatContacts,
  presignChatMediaUpload,
} = require("../controllers/chat")

// All chat routes require authentication
router.use(auth)

// Direct S3 presigned upload for chat media (up to 3GB)
router.post("/presign-media", presignChatMediaUpload)

// Global Community Chat
router.get("/global", getGlobalMessages)
router.post("/global", sendGlobalMessage)

// Practitioner Group Chat
router.get("/group/:practitionerId", getPractitionerGroupMessages)
router.post("/group/:practitionerId", sendPractitionerGroupMessage)

// 1-on-1 Direct Chat
router.get("/direct/:targetUserId", getDirectMessages)
router.post("/direct/:targetUserId", sendDirectMessage)

// Contacts / Direct Message user list
router.get("/contacts", getChatContacts)

module.exports = router
