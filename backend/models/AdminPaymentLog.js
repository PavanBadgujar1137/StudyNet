const mongoose = require("mongoose")

/**
 * AdminPaymentLog — The central ledger for ALL payments received by the platform.
 * Every single payment (subscription, practitioner offer booking, org booking)
 * is logged here. Admin is the sole recipient of all funds.
 * Admin then issues monthly salaries to practitioners from this pool.
 */
const adminPaymentLogSchema = new mongoose.Schema(
  {
    // Type of payment
    paymentType: {
      type: String,
      enum: ["subscription", "offer_booking", "org_booking"],
      required: true,
    },

    // Who paid
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    clientName: { type: String }, // denormalized for admin display speed

    // For offer_booking — which practitioner the client booked
    practitioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    practitionerName: { type: String }, // denormalized

    // What was purchased
    description: { type: String }, // e.g. "Growth Plan Subscription", "1:1 Anxiety Session with Dr. Meera"
    planKey: { type: String }, // for subscriptions: starter/growth/practice/master
    offerTitle: { type: String }, // for offer bookings
    offerType: { type: String }, // session / circle / program

    // Money
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    // Platform profit tracking (what admin owes practitioner as salary)
    amountOwedToPractitioner: { type: Number, default: 0 }, // admin's record of what to pay this practitioner

    // Payment details
    paymentGateway: {
      type: String,
      enum: ["razorpay", "stripe", "manual"],
      default: "razorpay",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },

    // Reference to source records
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },

    status: {
      type: String,
      enum: ["received", "refunded"],
      default: "received",
    },

    // Admin payout tracking
    practitionerSalaryPaid: { type: Boolean, default: false },
    salaryPaidAt: { type: Date },
    salaryPayoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payout",
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("AdminPaymentLog", adminPaymentLogSchema)
