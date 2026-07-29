const express = require("express")
const router = express.Router()
const {
  capturePayment,
  verifyPayment,
  sendPaymentSuccessEmail,
  bookOffer,
  verifyOfferBooking,
  createPractitionerOrder,
} = require("../controllers/Payments")
const { auth } = require("../middleware/auth")

router.post("/capturePayment", auth, capturePayment)
router.post("/verifyPayment", auth, verifyPayment)
router.post("/sendPaymentSuccessEmail", auth, sendPaymentSuccessEmail)

// Practitioner Session Order Creation via Razorpay
router.post("/create-practitioner-order", auth, createPractitionerOrder)

// OpenHand Offer Bookings (Razorpay + Stripe)
router.post("/book-offer", auth, bookOffer)
router.post("/verify-offer-booking", auth, verifyOfferBooking)

module.exports = router

