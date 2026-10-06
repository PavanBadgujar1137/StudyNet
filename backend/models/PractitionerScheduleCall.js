const mongoose = require("mongoose")

const practitionerScheduleCallSchema = new mongoose.Schema(
  {
    practitioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    practitionerName: {
      type: String,
      required: true,
      trim: true,
    },
    practitionerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    practitionerPhone: {
      type: String,
      trim: true,
    },
    modality: {
      type: String,
      trim: true,
      default: "General Practice",
    },
    planKey: {
      type: String,
      required: true,
      default: "pro_yearly",
    },
    planName: {
      type: String,
      required: true,
      default: "Pro Plan (Yearly)",
    },
    amountPaid: {
      type: Number,
      required: true,
      default: 9588,
    },
    currency: {
      type: String,
      default: "INR",
    },
    scheduledDate: {
      type: String,
      required: true, // e.g. "2026-10-15"
    },
    scheduledTimeSlot: {
      type: String,
      required: true, // e.g. "11:00 AM - 11:45 AM IST"
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata (IST)",
    },
    goals: {
      type: String,
      trim: true,
    },
    googleCalendarEventUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "call_link_sent", "completed", "cancelled"],
      default: "scheduled",
    },
    googleMeetLink: {
      type: String,
      trim: true,
    },
    callLinkSentAt: {
      type: Date,
    },
    callCompletedAt: {
      type: Date,
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    adminHandledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    paymentGateway: {
      type: String,
      default: "payglocal",
    },
    payglocalOrderId: {
      type: String,
    },
    payglocalPaymentId: {
      type: String,
    },
    payglocalGid: {
      type: String,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },
    adminPaymentLog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminPaymentLog",
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("PractitionerScheduleCall", practitionerScheduleCallSchema)
