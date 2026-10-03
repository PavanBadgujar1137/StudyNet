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
  getPractitionerPaymentHistory,
  deleteUserAdmin,
  getAllAdminRatings,
  verifyAdminRating,
  deleteAdminRating,
} = require("../controllers/admin")

// ─── Admin Account Setup (one-time, no auth required) ────────────────────────
// POST /api/v1/admin/seed-admin
router.post("/seed-admin", seedAdminAccount)

// ─── All Admin Routes (require auth + isAdmin) ────────────────────────────────
// Dashboard statistics
router.get("/stats", auth, isAdmin, getAdminDashboardStats)

// User / Client / Practitioner Management & Hard Deletion
router.get("/clients", auth, isAdmin, getAllClients)
router.patch("/clients/:id/plan", auth, isAdmin, updateClientPlan)
router.delete("/users/:id", auth, isAdmin, deleteUserAdmin)

// Course Management & Plan Tier Assignment (Admin exclusive)
router.get("/courses", auth, isAdmin, getAllCoursesAdmin)
router.patch("/courses/:id", auth, isAdmin, updateCourseAdmin)

// Practitioner management
router.get("/practitioners", auth, isAdmin, getAllPractitioners)
router.get("/practitioners/:practitionerId/payment-history", auth, isAdmin, getPractitionerPaymentHistory)

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

// Ratings & Reviews Moderation
router.get("/ratings", auth, isAdmin, getAllAdminRatings)
router.put("/ratings/:id/verify", auth, isAdmin, verifyAdminRating)
router.delete("/ratings/:id", auth, isAdmin, deleteAdminRating)

module.exports = router
