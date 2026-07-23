const express = require("express")
const router = express.Router()
const {
  getPractitioners,
  getPractitionerByHandle,
  getPractitionerDashboard,
  getPayoutsAndInvoices,
} = require("../controllers/practitioner")
const { auth, isPractitioner } = require("../middleware/auth")

// Public routes
router.get("/", getPractitioners)
router.get("/handle/:handle", getPractitionerByHandle)

// Authenticated practitioner routes
router.get("/dashboard", auth, isPractitioner, getPractitionerDashboard)
router.get("/payouts", auth, isPractitioner, getPayoutsAndInvoices)

module.exports = router
