const { getRazorpayInstance, getRazorpayKeys } = require("../config/razorpay")
const crypto = require("crypto")
const User = require("../models/User")
const Offer = require("../models/Offer")
const Booking = require("../models/Booking")
const Payout = require("../models/Payout")
const Invoice = require("../models/Invoice")
const Subscription = require("../models/Subscription")
const AdminPaymentLog = require("../models/AdminPaymentLog")
const PractitionerProfile = require("../models/PractitionerProfile")
const mailSender = require("../utils/mailSender")
const mongoose = require("mongoose")
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")

// ─── CORRECT PAYMENT FLOW ─────────────────────────────────────────────────────
// ALL payments from clients go to the PLATFORM ADMIN.
// Admin then pays practitioners their monthly salary manually.
// This file handles:
// 1. Subscription plan payments (from Pricing page)
// 2. Practitioner offer bookings (ALL offer types: session, circle, program)
// ─────────────────────────────────────────────────────────────────────────────

// ─── 1. CREATE SUBSCRIPTION PAYMENT ORDER ─────────────────────────────────────
exports.createSubscriptionOrder = async (req, res) => {
  try {
    const { planKey } = req.body
    const userId = req.user.id

    const planPrices = {
      starter: 999,
      growth: 2999,
      practice: 5999,
      master: 9999,
    }
    const planNames = {
      starter: "Starter Plan",
      growth: "Growth Plan",
      practice: "Practice Plan",
      master: "Master Plan",
    }

    if (!planKey || !planPrices[planKey]) {
      return res.status(400).json({ success: false, message: "Invalid plan key" })
    }

    const amount = planPrices[planKey]
    const { key_id } = getRazorpayKeys()

    const options = {
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `sub_${planKey}_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        planKey,
        planName: planNames[planKey],
      },
    }

    const order = await getRazorpayInstance().orders.create(options)

    return res.status(200).json({
      success: true,
      order,
      key: key_id,
      amount,
      planKey,
      planName: planNames[planKey],
    })
  } catch (error) {
    console.error("createSubscriptionOrder error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── 2. VERIFY SUBSCRIPTION PAYMENT ──────────────────────────────────────────
exports.verifySubscriptionPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planKey } = req.body
    const userId = req.user.id

    // Signature verification
    const { key_secret } = getRazorpayKeys()
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto.createHmac("sha256", key_secret).update(body).digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" })
    }

    const planPrices = { starter: 999, growth: 2999, practice: 5999, master: 9999 }
    const planNames = { starter: "Starter Plan", growth: "Growth Plan", practice: "Practice Plan", master: "Master Plan" }
    const amount = planPrices[planKey] || 0

    // Deactivate any existing active subscription for this client
    await Subscription.updateMany({ client: userId, status: "active" }, { status: "expired" })

    // Create new subscription record
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1)

    const subscription = await Subscription.create({
      client: userId,
      planKey,
      planName: planNames[planKey],
      amount,
      status: "active",
      startDate,
      endDate,
      paymentGateway: "razorpay",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    })

    // Log to admin payment ledger
    const clientUser = await User.findById(userId).select("firstName lastName email")
    const adminLog = await AdminPaymentLog.create({
      paymentType: "subscription",
      client: userId,
      clientName: `${clientUser.firstName} ${clientUser.lastName}`,
      description: `${planNames[planKey]} Subscription`,
      planKey,
      amount,
      currency: "INR",
      amountOwedToPractitioner: 0, // Subscription fees are pure platform revenue
      paymentGateway: "razorpay",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      subscriptionId: subscription._id,
      status: "received",
    })

    // Update subscription with admin log ref
    subscription.adminPaymentLog = adminLog._id
    await subscription.save()

    // Send payment success email
    try {
      await mailSender(
        clientUser.email,
        `Welcome to OpenHand ${planNames[planKey]}!`,
        paymentSuccessEmail(
          `${clientUser.firstName} ${clientUser.lastName}`,
          amount,
          razorpay_order_id,
          razorpay_payment_id
        )
      )
    } catch (emailErr) {
      console.warn("Subscription email failed:", emailErr.message)
    }

    return res.status(200).json({
      success: true,
      message: `${planNames[planKey]} activated successfully!`,
      subscription,
    })
  } catch (error) {
    console.error("verifySubscriptionPayment error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── 3. GET CLIENT SUBSCRIPTION STATUS ───────────────────────────────────────
exports.getMySubscription = async (req, res) => {
  try {
    const userId = req.user.id
    const subscription = await Subscription.findOne({
      client: userId,
      status: "active",
    })
      .sort({ createdAt: -1 })
      .lean()

    return res.status(200).json({ success: true, subscription })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── 4. BOOK PRACTITIONER OFFER (ALL types: session / circle / program) ────────
// This replaces the old bookOffer. ALL payment goes to admin.
exports.bookOffer = async (req, res) => {
  try {
    const { offerId, scheduledAt, gateway = "razorpay" } = req.body
    const userId = req.user.id

    const offer = await Offer.findById(offerId).populate("practitioner", "firstName lastName email")
    if (!offer) {
      return res.status(404).json({ success: false, message: "Offer not found" })
    }
    if (offer.status !== "published") {
      return res.status(400).json({ success: false, message: "This offer is not currently available" })
    }

    const practitionerId = offer.practitioner._id
    const practitionerUser = offer.practitioner
    const grossAmount = offer.price

    // Track what admin owes the practitioner as salary for this booking
    // Default: 80% to practitioner (admin keeps 20% platform fee) — this is just a tracking number
    // Admin still pays manually; this is just for admin visibility
    const practitionerPortion = Math.round(grossAmount * 0.8)

    if (gateway === "stripe") {
      // Stripe mock flow
      const mockStripeIntentId = `pi_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      const booking = await Booking.create({
        client: userId,
        practitioner: practitionerId,
        offer: offer._id,
        offerType: offer.type,
        amount: grossAmount,
        commission: 0, // Admin handles commission manually
        netPayout: practitionerPortion,
        paymentGateway: "stripe",
        stripePaymentIntentId: mockStripeIntentId,
        status: "confirmed",
        settlementStatus: "pending_t2",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(Date.now() + 86400000),
      })

      await _createInvoiceAndAdminLog({
        booking,
        clientId: userId,
        practitionerId,
        practitionerUser,
        offer,
        grossAmount,
        practitionerPortion,
        gateway: "stripe",
        paymentId: mockStripeIntentId,
        orderId: null,
      })

      return res.status(200).json({
        success: true,
        message: "Offer booked successfully",
        booking,
        stripeClientSecret: `${mockStripeIntentId}_secret_openhand`,
      })
    }

    // Razorpay flow — create order first, confirm on verify
    const options = {
      amount: Math.round(grossAmount * 100),
      currency: "INR",
      receipt: `oh_offer_${Date.now()}`,
      notes: {
        offerId: offerId.toString(),
        clientId: userId.toString(),
        practitionerId: practitionerId.toString(),
        offerType: offer.type,
      },
    }

    const { key_id } = getRazorpayKeys()
    const rzpOrder = await getRazorpayInstance().orders.create(options)

    const booking = await Booking.create({
      client: userId,
      practitioner: practitionerId,
      offer: offer._id,
      offerType: offer.type,
      amount: grossAmount,
      commission: 0,
      netPayout: practitionerPortion,
      paymentGateway: "razorpay",
      razorpayOrderId: rzpOrder.id,
      status: "pending",
      settlementStatus: "unsettled",
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(Date.now() + 86400000),
    })

    return res.status(200).json({
      success: true,
      bookingId: booking._id,
      razorpayOrder: rzpOrder,
      key: key_id,
      offerTitle: offer.title,
      offerType: offer.type,
      amount: grossAmount,
      practitionerName: `${practitionerUser.firstName} ${practitionerUser.lastName}`,
    })
  } catch (error) {
    console.error("bookOffer error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── 5. VERIFY OFFER BOOKING PAYMENT ─────────────────────────────────────────
exports.verifyOfferBooking = async (req, res) => {
  try {
    const { bookingId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body

    const booking = await Booking.findById(bookingId)
      .populate("offer", "title type price")
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" })
    }

    // Verify Razorpay signature
    const { key_secret } = getRazorpayKeys()
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSig = crypto.createHmac("sha256", key_secret).update(body).digest("hex")

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" })
    }

    booking.razorpayPaymentId = razorpay_payment_id
    booking.status = "confirmed"
    booking.settlementStatus = "pending_t2"
    await booking.save()

    const [clientUser, practitionerUser] = await Promise.all([
      User.findById(booking.client).select("firstName lastName email"),
      User.findById(booking.practitioner).select("firstName lastName email"),
    ])

    await _createInvoiceAndAdminLog({
      booking,
      clientId: booking.client,
      practitionerId: booking.practitioner,
      practitionerUser,
      offer: booking.offer,
      grossAmount: booking.amount,
      practitionerPortion: booking.netPayout,
      gateway: "razorpay",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    })

    // Email client
    try {
      await mailSender(
        clientUser.email,
        `Booking Confirmed — ${booking.offer?.title || "Session"}`,
        paymentSuccessEmail(
          `${clientUser.firstName} ${clientUser.lastName}`,
          booking.amount,
          razorpay_order_id,
          razorpay_payment_id
        )
      )
    } catch (emailErr) {
      console.warn("Booking email failed:", emailErr.message)
    }

    return res.status(200).json({
      success: true,
      message: "Booking confirmed! Your session is scheduled.",
      booking,
    })
  } catch (error) {
    console.error("verifyOfferBooking error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── 6. GET CLIENT BOOKINGS ───────────────────────────────────────────────────
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id
    const bookings = await Booking.find({
      client: userId,
      status: { $in: ["pending", "confirmed", "completed"] },
    })
      .populate("practitioner", "firstName lastName image email")
      .populate("offer", "title type price durationMinutes")
      .sort({ scheduledAt: 1 })
      .lean()

    return res.status(200).json({ success: true, bookings })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── 7. GET PRACTITIONER'S UPCOMING BOOKINGS (who is connecting with me) ───────
exports.getPractitionerBookings = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const bookings = await Booking.find({
      practitioner: practitionerId,
      status: { $in: ["confirmed", "completed"] },
    })
      .populate("client", "firstName lastName image email")
      .populate("offer", "title type price durationMinutes")
      .sort({ scheduledAt: 1 })
      .lean()

    return res.status(200).json({ success: true, bookings })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─── 8. SEND PAYMENT SUCCESS EMAIL ───────────────────────────────────────────
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body
  const userId = req.user.id

  if (!orderId || !paymentId || !amount || !userId) {
    return res.status(400).json({ success: false, message: "Please provide all details" })
  }

  try {
    const user = await User.findById(userId)
    await mailSender(
      user.email,
      "Payment Received — OpenHand",
      paymentSuccessEmail(`${user.firstName} ${user.lastName}`, amount / 100, orderId, paymentId)
    )
    return res.status(200).json({ success: true, message: "Payment email sent" })
  } catch (error) {
    return res.status(400).json({ success: false, message: "Could not send email" })
  }
}

// ─── HELPER: Create Invoice + Admin Payment Log ───────────────────────────────
async function _createInvoiceAndAdminLog({
  booking,
  clientId,
  practitionerId,
  practitionerUser,
  offer,
  grossAmount,
  practitionerPortion,
  gateway,
  paymentId,
  orderId,
}) {
  try {
    const clientUser = await User.findById(clientId).select("firstName lastName")
    const invoiceNum = `OH-${Date.now().toString().slice(-8)}`

    // Create Invoice
    await Invoice.create({
      booking: booking._id,
      client: clientId,
      practitioner: practitionerId,
      invoiceNumber: invoiceNum,
      subtotal: grossAmount,
      gstRatePercentage: 18,
      gstAmount: Math.round(grossAmount * 0.18),
      totalAmount: grossAmount,
      status: "paid",
    })

    // Log to admin payment ledger (THE core record)
    await AdminPaymentLog.create({
      paymentType: "offer_booking",
      client: clientId,
      clientName: clientUser ? `${clientUser.firstName} ${clientUser.lastName}` : "Unknown",
      practitioner: practitionerId,
      practitionerName: practitionerUser ? `${practitionerUser.firstName} ${practitionerUser.lastName}` : "Unknown",
      description: offer?.title
        ? `${offer.title} (${offer.type})`
        : `Practitioner Offer Booking`,
      offerTitle: offer?.title || "",
      offerType: offer?.type || "",
      amount: grossAmount,
      amountOwedToPractitioner: practitionerPortion,
      paymentGateway: gateway,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      bookingId: booking._id,
      status: "received",
    })
  } catch (err) {
    console.error("_createInvoiceAndAdminLog error:", err)
  }
}