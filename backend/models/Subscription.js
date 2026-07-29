const mongoose = require("mongoose")

const subscriptionSchema = new mongoose.Schema(
  {
    // The client who subscribed
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    // Plan they subscribed to (matches Pricing page)
    planKey: {
      type: String,
      enum: ["starter", "growth", "practice", "master"],
      required: true,
    },

    planName: { type: String }, // e.g. "Starter", "Growth"
    amount: { type: Number, required: true }, // amount paid in INR

    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },

    startDate: { type: Date, default: Date.now },
    endDate: { type: Date }, // 1 month from startDate

    // Payment details
    paymentGateway: {
      type: String,
      enum: ["razorpay", "stripe", "manual"],
      default: "razorpay",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },

    // Link to admin payment log
    adminPaymentLog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminPaymentLog",
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Subscription", subscriptionSchema)
