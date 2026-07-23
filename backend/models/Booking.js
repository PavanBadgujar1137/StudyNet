const mongoose = require("mongoose")

const bookingSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    practitioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      required: true,
    },
    offerType: {
      type: String,
      enum: ["session", "circle", "program"],
      required: true,
    },
    amount: { type: Number, required: true },
    commission: { type: Number, default: 0 },
    netPayout: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    scheduledAt: { type: Date },
    paymentGateway: {
      type: String,
      enum: ["razorpay", "stripe", "manual"],
      default: "razorpay",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    stripePaymentIntentId: { type: String },
    settlementStatus: {
      type: String,
      enum: ["unsettled", "pending_t2", "settled"],
      default: "unsettled",
    },
    settledAt: { type: Date },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Booking", bookingSchema)
