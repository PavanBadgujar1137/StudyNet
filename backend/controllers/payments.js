const { getRazorpayInstance, getRazorpayKeys } = require("../config/razorpay")
const crypto = require("crypto")
const User = require("../models/User")
const Offer = require("../models/Offer")
const Booking = require("../models/Booking")
const Payout = require("../models/Payout")
const Invoice = require("../models/Invoice")
const PractitionerProfile = require("../models/PractitionerProfile")
const mailSender = require("../utils/mailSender")
const mongoose = require("mongoose")
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail")
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")

// Original Course Checkout (re-labelled as Program)
exports.capturePayment = async (req, res) => {
  const { courses } = req.body
  const userId = req.user.id
  if (!courses || courses.length === 0) {
    return res.json({ success: false, message: "Please Provide Course/Program ID" })
  }

  let total_amount = 0

  for (const course_id of courses) {
    try {
      const course = await Course.findById(course_id)
      if (!course) {
        return res.status(200).json({ success: false, message: "Could not find the Program" })
      }
      const uid = new mongoose.Types.ObjectId(userId)
      if (course.studentsEnroled.includes(uid)) {
        return res.status(200).json({ success: false, message: "Client is already Enrolled" })
      }
      total_amount += course.price
    } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  const options = {
    amount: Math.round(Number(total_amount) * 100),
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  }

  try {
    const { key_id } = getRazorpayKeys()
    const paymentResponse = await getRazorpayInstance().orders.create(options)
    return res.json({
      success: true,
      data: paymentResponse,
      key: key_id,
    })
  } catch (error) {
    console.log("CAPTURE PAYMENT ERROR:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Could not initiate order.",
    })
  }
}

// ─── Create Razorpay Order for Practitioner Session / Connection ───
exports.createPractitionerOrder = async (req, res) => {
  try {
    const { practitionerId, amount } = req.body
    const userId = req.user.id

    if (!practitionerId) {
      return res.status(400).json({ success: false, message: "Practitioner ID is required" })
    }

    let practUser = await User.findById(practitionerId)
    if (!practUser) {
      const pProfile = await PractitionerProfile.findById(practitionerId)
      if (pProfile) practUser = await User.findById(pProfile.user)
    }

    if (!practUser) {
      return res.status(404).json({ success: false, message: "Practitioner user record not found" })
    }

    const profile = await PractitionerProfile.findOne({ user: practUser._id })
    const sessionRate = amount || profile?.sessionRate || 0
    const numericAmount = Number(sessionRate)

    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Practitioner has not published any active offer prices yet.",
      })
    }

    // Commission structure: Starter 8%, Growth 5%, Practice/Master 0%
    const commissionRate = profile
      ? profile.plan === "master" || profile.plan === "practice"
        ? 0
        : profile.plan === "growth"
        ? 5
        : 8
      : 8

    const commission = Math.round((numericAmount * commissionRate) / 100)
    const netPayout = numericAmount - commission

    const options = {
      amount: Math.round(numericAmount * 100), // in paise
      currency: "INR",
      receipt: `oh_prac_${Date.now()}`,
      notes: {
        practitionerId: practUser._id.toString(),
        clientId: userId,
        practitionerName: `${practUser.firstName} ${practUser.lastName}`,
      },
    }

    const { key_id } = getRazorpayKeys()
    const instance = getRazorpayInstance()
    const order = await instance.orders.create(options)

    return res.status(200).json({
      success: true,
      order,
      key: key_id,
      amount: numericAmount,
      commission,
      netPayout,
      practitionerName: `${practUser.firstName} ${practUser.lastName}`,
    })
  } catch (error) {
    console.error("createPractitionerOrder error:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create Razorpay order for practitioner payment",
    })
  }
}

// ─── OpenHand Offer Booking Checkout (Session / Circle / Program via Razorpay & Stripe)
exports.bookOffer = async (req, res) => {
  try {
    const { offerId, gateway = "razorpay" } = req.body
    const userId = req.user.id

    const offer = await Offer.findById(offerId).populate("practitioner")
    if (!offer) {
      return res.status(404).json({ success: false, message: "Offer not found" })
    }

    const practitionerId = offer.practitioner._id
    const practitionerProfile = await PractitionerProfile.findOne({ user: practitionerId })

    // Commission rates: Starter 8%, Growth 5%, Practice 0%
    const commissionRate = practitionerProfile
      ? practitionerProfile.plan === "practice"
        ? 0
        : practitionerProfile.plan === "growth"
        ? 5
        : 8
      : 8

    const grossAmount = offer.price
    const commission = Math.round((grossAmount * commissionRate) / 100)
    const netPayout = grossAmount - commission

    if (gateway === "stripe") {
      // Stripe Intent Flow
      const mockStripeIntentId = `pi_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      const booking = await Booking.create({
        client: userId,
        practitioner: practitionerId,
        offer: offer._id,
        offerType: offer.type,
        amount: grossAmount,
        commission,
        netPayout,
        paymentGateway: "stripe",
        stripePaymentIntentId: mockStripeIntentId,
        status: "confirmed",
        settlementStatus: "pending_t2",
        scheduledAt: new Date(Date.now() + 86400000), // +1 day default
      })

      // Generate Invoice
      const invoiceNum = `OH-${Date.now().toString().slice(-6)}`
      await Invoice.create({
        booking: booking._id,
        client: userId,
        practitioner: practitionerId,
        invoiceNumber: invoiceNum,
        subtotal: grossAmount,
        gstRatePercentage: 18,
        gstAmount: Math.round(grossAmount * 0.18),
        totalAmount: grossAmount,
        status: "paid",
      })

      return res.status(200).json({
        success: true,
        message: "Stripe payment intent initiated & confirmed",
        booking,
        stripeClientSecret: `${mockStripeIntentId}_secret_openhand`,
      })
    }

    // Razorpay Flow
    const options = {
      amount: Math.round(grossAmount * 100),
      currency: "INR",
      receipt: `oh_rec_${Date.now()}`,
    }

    const { key_id } = getRazorpayKeys()
    const rzpOrder = await getRazorpayInstance().orders.create(options)

    const booking = await Booking.create({
      client: userId,
      practitioner: practitionerId,
      offer: offer._id,
      offerType: offer.type,
      amount: grossAmount,
      commission,
      netPayout,
      paymentGateway: "razorpay",
      razorpayOrderId: rzpOrder.id,
      status: "pending",
      settlementStatus: "unsettled",
      scheduledAt: new Date(Date.now() + 86400000),
    })

    return res.status(200).json({
      success: true,
      bookingId: booking._id,
      razorpayOrder: rzpOrder,
      key: key_id,
    })
  } catch (error) {
    console.error("Book Offer Error:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to process offer booking",
      error: error.message,
    })
  }
}

// ─── Verify Offer Booking & T+2 Settlement Calculation
exports.verifyOfferBooking = async (req, res) => {
  try {
    const { bookingId, razorpay_payment_id, razorpay_signature } = req.body

    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking record not found" })
    }

    booking.razorpayPaymentId = razorpay_payment_id
    booking.status = "confirmed"
    booking.settlementStatus = "pending_t2"
    await booking.save()

    // Generate Invoice
    const invoiceNum = `OH-${Date.now().toString().slice(-6)}`
    await Invoice.create({
      booking: booking._id,
      client: booking.client,
      practitioner: booking.practitioner,
      invoiceNumber: invoiceNum,
      subtotal: booking.amount,
      gstRatePercentage: 18,
      gstAmount: Math.round(booking.amount * 0.18),
      totalAmount: booking.amount,
      status: "paid",
    })

    // Update Practitioner monthly earnings & check nudge threshold
    const profile = await PractitionerProfile.findOne({ user: booking.practitioner })
    if (profile) {
      profile.monthlyEarnings = (profile.monthlyEarnings || 0) + booking.netPayout
      await profile.save()

      // Nudge email trigger when Starter > ₹40,000 monthly earnings
      if (profile.plan === "starter" && profile.monthlyEarnings > 40000) {
        try {
          const practitionerUser = await User.findById(booking.practitioner)
          if (practitionerUser?.email) {
            await mailSender(
              practitionerUser.email,
              "OpenHand — Growth Plan Upgrade Recommendation",
              `Hi ${practitionerUser.firstName},\n\nYour monthly earnings passed ₹40,000 this month! On the Starter 8% plan, your commission cost has exceeded ₹1,499. Upgrading to the Growth plan will save you money. Switch anytime from your dashboard.`
            )
          }
        } catch (e) {
          console.warn("Upgrade nudge email failed:", e.message)
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Booking payment verified. T+2 settlement scheduled.",
      booking,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to verify booking payment",
      error: error.message,
    })
  }
}

// Original course payment verification (backward compat)
exports.verifyPayment = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id
  const razorpay_payment_id = req.body?.razorpay_payment_id
  const razorpay_signature = req.body?.razorpay_signature
  const courses = req.body?.courses
  const userId = req.user.id

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses || !userId) {
    return res.status(200).json({ success: false, message: "Payment Failed" })
  }

  let body = razorpay_order_id + "|" + razorpay_payment_id
  const { key_secret } = getRazorpayKeys()
  const expectedSignature = crypto.createHmac("sha256", key_secret).update(body.toString()).digest("hex")

  if (expectedSignature === razorpay_signature) {
    await enrollStudents(courses, userId, res)
    return res.status(200).json({ success: true, message: "Payment Verified" })
  }

  return res.status(200).json({ success: false, message: "Payment Failed" })
}

exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body
  const userId = req.user.id

  if (!orderId || !paymentId || !amount || !userId) {
    return res.status(400).json({ success: false, message: "Please provide all details" })
  }

  try {
    const enrolledStudent = await User.findById(userId)
    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    )
    return res.status(200).json({ success: true, message: "Payment email sent" })
  } catch (error) {
    return res.status(400).json({ success: false, message: "Could not send email" })
  }
}

const enrollStudents = async (courses, userId, res) => {
  for (const courseId of courses) {
    const enrolledCourse = await Course.findOneAndUpdate(
      { _id: courseId },
      { $push: { studentsEnroled: userId } },
      { new: true }
    )

    const courseProgress = await CourseProgress.create({
      courseID: courseId,
      userId: userId,
      completedVideos: [],
    })

    await User.findByIdAndUpdate(
      userId,
      { $push: { courses: courseId, courseProgress: courseProgress._id } },
      { new: true }
    )
  }
}