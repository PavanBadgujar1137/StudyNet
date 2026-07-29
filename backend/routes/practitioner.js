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
} = require("../controllers/practitioner")
const { auth, isPractitioner } = require("../middleware/auth")

// Public routes
router.get("/", getPractitioners)
router.get("/handle/:handle", getPractitionerByHandle)

// Client connection (Payment & approval flow)
router.post("/connect", auth, connectClientWithPractitioner)
router.get("/my-connections", auth, getClientConnections)

// Practitioner approval routes
router.post("/approve-connection", auth, isPractitioner, approveClientConnection)
router.get("/dashboard", auth, isPractitioner, getPractitionerDashboard)
router.get("/payouts", auth, isPractitioner, getPayoutsAndInvoices)
router.get("/connected-clients", auth, isPractitioner, getConnectedClients)

// Bank & Payout details for Admin salary transfers
router.get("/bank-details", auth, isPractitioner, getBankDetails)
router.put("/bank-details", auth, isPractitioner, updateBankDetails)

module.exports = router
