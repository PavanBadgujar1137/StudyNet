const express = require("express")
const router = express.Router()
const { grantConsent, revokeConsent, checkConsentStatus } = require("../controllers/consent")
const { auth } = require("../middleware/auth")

router.post("/grant", auth, grantConsent)
router.post("/revoke", auth, revokeConsent)
router.get("/status/:clientId", auth, checkConsentStatus)

module.exports = router
