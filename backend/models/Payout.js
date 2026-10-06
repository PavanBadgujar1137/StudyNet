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
    netAmount: { type: Number, required: true }, // Net salary to practitioner
    status: {
      type: String,
      enum: ["processing", "settled", "failed"],
      default: "processing",
    },
    settlementWindowHours: { type: Number, default: 72 }, // Automated 72-hour payout
    settledAt: { type: Date },
    payoutMethod: { type: String, default: "payglocal_direct_transfer" },
    bankDetails: {
      accountNumberMasked: { type: String },
      ifsc: { type: String },
      upiId: { type: String },
    },
    bookingsCount: { type: Number, default: 1 },
    sourceType: {
      type: String,
      enum: ["course", "offer_booking", "session", "circle", "manual"],
      default: "offer_booking",
    },
    sourceId: { type: String },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Payout", payoutSchema)
