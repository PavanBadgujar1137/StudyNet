const mongoose = require("mongoose")

const payoutSchema = new mongoose.Schema(
  {
    practitioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    amount: { type: Number, required: true }, // Gross learner amount
    grossAmount: { type: Number },
    platformFeeDeducted: { type: Number, default: 0 },
    taxDeducted: { type: Number, default: 0 },
    commissionDeducted: { type: Number, default: 0 },
    netAmount: { type: Number, required: true }, // Net payout to practitioner's bank account
    status: {
      type: String,
      enum: ["processing", "pending_bank_details", "settled", "failed", "cancelled"],
      default: "processing",
    },
    settlementWindowHours: { type: Number, default: 72 }, // Automated 72-hour payout
    scheduledPayoutAt: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 72 * 60 * 60 * 1000)
      },
    },
    settledAt: { type: Date },
    payoutMethod: { type: String, default: "payglocal_direct_transfer" },
    payoutUtrNumber: { type: String }, // Bank UTR or Transaction Ref ID e.g. PAYG-UTR-XXXXXXXX
    payoutTransactionId: { type: String },
    processedBy: {
      type: String,
      enum: ["autopay_scheduler", "admin_manual", "instant_transfer"],
      default: "autopay_scheduler",
    },
    failureReason: { type: String },
    bankDetails: {
      accountHolderName: { type: String },
      accountNumberMasked: { type: String },
      bankName: { type: String },
      ifsc: { type: String },
      upiId: { type: String },
      iban: { type: String },
      swift: { type: String },
      country: { type: String },
      payoutMethod: { type: String },
    },
    bookingsCount: { type: Number, default: 1 },
    sourceType: {
      type: String,
      enum: ["course", "offer_booking", "session", "circle", "manual"],
      default: "offer_booking",
    },
    sourceId: { type: String },
    sourceTitle: { type: String },
  },
  { timestamps: true }
)

payoutSchema.index(
  { payoutTransactionId: 1 },
  { unique: true, partialFilterExpression: { payoutTransactionId: { $type: "string", $gt: "" } } }
)

module.exports = mongoose.model("Payout", payoutSchema)

