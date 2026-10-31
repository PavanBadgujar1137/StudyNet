const mongoose = require("mongoose")

const paymentOrderSchema = new mongoose.Schema(
  {
    merchantTxnId: { type: String, required: true, unique: true, index: true },
    gid: { type: String, default: "", index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null, index: true },
    kind: {
      type: String,
      enum: ["subscription", "plan", "offer", "course", "subscription_call", "practitioner"],
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    planKey: { type: String, default: "" },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
    practitionerId: { type: mongoose.Schema.Types.ObjectId, ref: "user", default: null },
    status: {
      type: String,
      enum: ["pending", "consumed", "failed"],
      default: "pending",
      index: true,
    },
    fulfilled: {
      type: Boolean,
      default: false,
      index: true,
    },
    fulfilledAt: {
      type: Date,
      default: null,
    },
    fulfillmentDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    statusUrl: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

module.exports = mongoose.model("PaymentOrder", paymentOrderSchema)
