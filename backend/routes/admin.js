const express = require("express")
const router = express.Router()
const { auth, isAdmin } = require("../middleware/auth")
const {
  getAdminDashboardStats,
  getAllClients,
  getAllPractitioners,
  getAllPayments,
  getAllSubscriptions,
  getAllBookings,
  getOrgConversations,
  updateOrgConversation,
  processMonthlyPayout,
  seedAdminAccount,
  updateClientPlan,
  getAllCoursesAdmin,
  updateCourseAdmin,
} = require("../controllers/admin")

// ─── Admin Account Setup (one-time, no auth required) ────────────────────────
// POST /api/v1/admin/seed-admin
router.post("/seed-admin", seedAdminAccount)

// ─── All Admin Routes (require auth + isAdmin) ────────────────────────────────
// Dashboard statistics
router.get("/stats", auth, isAdmin, getAdminDashboardStats)

// Client management
router.get("/clients", auth, isAdmin, getAllClients)
router.patch("/clients/:id/plan", auth, isAdmin, updateClientPlan)

// Course Management & Plan Tier Assignment (Admin exclusive)
router.get("/courses", auth, isAdmin, getAllCoursesAdmin)
router.patch("/courses/:id", auth, isAdmin, updateCourseAdmin)

// Practitioner management
router.get("/practitioners", auth, isAdmin, getAllPractitioners)

// Payment ledger
router.get("/payments", auth, isAdmin, getAllPayments)

// Subscriptions
router.get("/subscriptions", auth, isAdmin, getAllSubscriptions)

// Bookings
router.get("/bookings", auth, isAdmin, getAllBookings)

// Organization conversations
router.get("/org-conversations", auth, isAdmin, getOrgConversations)
router.patch("/org-conversations/:id", auth, isAdmin, updateOrgConversation)

// Payouts (admin manually marks salary as paid)
router.post("/payout", auth, isAdmin, processMonthlyPayout)

module.exports = router
