const express = require("express")
const router = express.Router()
const {
  createSubscriptionOrder,
  verifySubscriptionPayment,
  getMySubscription,
  bookOffer,
  verifyOfferBooking,
  getMyBookings,
  getPractitionerBookings,
  sendPaymentSuccessEmail,
} = require("../controllers/payments")
const { auth, isInstructor } = require("../middleware/auth")

// ─── Subscription Payments (Client pays admin for platform access) ────────────
router.post("/subscription/create", auth, createSubscriptionOrder)
router.post("/subscription/verify", auth, verifySubscriptionPayment)
router.get("/subscription/mine", auth, getMySubscription)

// ─── Practitioner Offer Bookings (ALL types: session / circle / program) ───────
// Client books any practitioner offer → payment goes to admin
router.post("/book-offer", auth, bookOffer)
router.post("/verify-offer-booking", auth, verifyOfferBooking)

// ─── Booking Queries ──────────────────────────────────────────────────────────
router.get("/my-bookings", auth, getMyBookings)
router.get("/practitioner-bookings", auth, isInstructor, getPractitionerBookings)

// ─── Email ────────────────────────────────────────────────────────────────────
router.post("/sendPaymentSuccessEmail", auth, sendPaymentSuccessEmail)

module.exports = router
