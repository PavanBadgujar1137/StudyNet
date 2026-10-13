const express = require("express")
const router = express.Router()

const { auth } = require("../middleware/auth")
const {
  getGoogleAuthUrl,
  googleAuthCallback,
  disconnectCalendar,
  getAvailability,
  updateAvailability,
  getAvailableSlots,
} = require("../controllers/calendar")

router.get("/auth/google", auth, getGoogleAuthUrl)
router.get("/auth/callback", googleAuthCallback)
router.post("/disconnect", auth, disconnectCalendar)

router.get("/availability", auth, getAvailability)
router.put("/availability", auth, updateAvailability)

router.get("/slots/:practitionerId", getAvailableSlots)

module.exports = router
