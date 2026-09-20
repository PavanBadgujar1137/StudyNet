const express = require("express")
const router = express.Router()
const {
  getPractitioners,
  getPractitionerByHandle,
  getPractitionerDashboard,
  getPayoutsAndInvoices,
  connectClientWithPractitioner,
  approveClientConnection,
  getClientConnections,
  getConnectedClients,
  getBankDetails,
  updateBankDetails,
  updatePractitionerProfile,
  getIntakeQuestions,
  updateIntakeQuestions,
  submitIntakeAnswers,
  getIntakeAnswers,
  requestClientReview,
} = require("../controllers/practitioner")
const { auth, isPractitioner } = require("../middleware/auth")

// Public routes
router.get("/", getPractitioners)
router.get("/handle/:handle", getPractitionerByHandle)
router.get("/intake-questions/:practitionerId", getIntakeQuestions)

// Client connection (Payment & approval flow)
router.post("/connect", auth, connectClientWithPractitioner)
router.get("/my-connections", auth, getClientConnections)
router.post("/intake-answers", auth, submitIntakeAnswers)
router.get("/intake-answers/:bookingId", auth, getIntakeAnswers)

// Practitioner approval routes
router.post("/approve-connection", auth, isPractitioner, approveClientConnection)
router.post("/request-review", auth, isPractitioner, requestClientReview)
router.get("/dashboard", auth, isPractitioner, getPractitionerDashboard)

router.get("/payouts", auth, isPractitioner, getPayoutsAndInvoices)
router.get("/connected-clients", auth, isPractitioner, getConnectedClients)

// Bank & Payout details for Admin salary transfers
router.get("/bank-details", auth, isPractitioner, getBankDetails)
router.put("/bank-details", auth, isPractitioner, updateBankDetails)
router.put("/profile", auth, isPractitioner, updatePractitionerProfile)
router.put("/intake-questions", auth, isPractitioner, updateIntakeQuestions)

module.exports = router
