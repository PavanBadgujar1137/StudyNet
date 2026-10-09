const mongoose = require("mongoose")

const subscriptionSchema = new mongoose.Schema(
  {
    // The client who subscribed
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    planKey: {
      type: String,
      enum: [
        "open",
        "pro",
        "pro_monthly",
        "pro_yearly",
        "pro_annual",
        "institution",
        "starter",
        "growth",
        "practice",
        "master",
        "beginner",
        "advance",
        "champion",
      ],
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
      enum: ["payglocal", "stripe", "manual"],
      default: "payglocal",
    },
    payglocalOrderId: { type: String },
    payglocalPaymentId: { type: String },
    payglocalGid: { type: String },

    // Link to admin payment log
    adminPaymentLog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminPaymentLog",
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Subscription", subscriptionSchema)
