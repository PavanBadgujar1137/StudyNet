const express = require("express")
const router = express.Router()
const { generateDraftNotes, approveDraftNotes, chatWithAura } = require("../controllers/aura")
const { auth, isPractitioner } = require("../middleware/auth")

// Optional auth middleware so AURA chat works seamlessly
const optionalAuth = (req, res, next) => {
  const authHeader = req.header("Authorization") || req.header("authorization") || req.headers?.authorization
  let rawToken = (authHeader ? authHeader.replace(/^Bearer\s+/i, "") : null) || req.cookies?.token || req.body?.userToken || req.body?.authToken || req.body?.token
  if (rawToken) {
    let cleanToken = String(rawToken).trim()
    if ((cleanToken.startsWith('"') && cleanToken.endsWith('"')) || (cleanToken.startsWith("'") && cleanToken.endsWith("'"))) {
      cleanToken = cleanToken.slice(1, -1).trim()
    }
    if (cleanToken.split(".").length === 3) {
      try {
        const jwt = require("jsonwebtoken")
        const decode = jwt.verify(cleanToken, process.env.JWT_SECRET)
        req.user = decode
      } catch (e) {
        // Proceed gracefully
      }
    }
  }
  next()
}

router.post("/chat", optionalAuth, chatWithAura)
router.post("/suggest", auth, isPractitioner, generateDraftNotes)
router.post("/approve-draft", auth, isPractitioner, approveDraftNotes)

module.exports = router
