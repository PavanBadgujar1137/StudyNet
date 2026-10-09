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
      enum: ["payglocal", "stripe", "manual", "discount_grant"],
      default: "payglocal",
    },
    payglocalOrderId: { type: String },
    payglocalPaymentId: { type: String },
    payglocalGid: { type: String },
    stripePaymentIntentId: { type: String },
    settlementStatus: {
      type: String,
      enum: ["unsettled", "pending_t2", "settled"],
      default: "unsettled",
    },
    settledAt: { type: Date },

    // Pre-Session Intake Answers (Stage 02)
    intakeAnswers: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],

    // Client Contact & Session Room Link for Multi-Channel Reminders
    clientPhone: { type: String, trim: true, default: "" },
    clientEmail: { type: String, trim: true, default: "" },
    meetingLink: { type: String, trim: true, default: "" },

    // Automated Notification Tracking Flags (WhatsApp + Email)
    reminderPurchaseSent: { type: Boolean, default: false },
    reminder1hSent: { type: Boolean, default: false },
    reminder15mSent: { type: Boolean, default: false },
    reminder2mSent: { type: Boolean, default: false },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Booking", bookingSchema)
