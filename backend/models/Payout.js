const mongoose = require("mongoose")

const payoutSchema = new mongoose.Schema(
  {
    practitioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    amount: { type: Number, required: true },
    commissionDeducted: { type: Number, default: 0 },
    netAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["processing", "settled", "failed"],
      default: "processing",
    },
    settledAt: { type: Date },
    payoutMethod: { type: String, default: "bank_transfer" },
    bankDetails: {
      accountNumberMasked: { type: String },
      ifsc: { type: String },
    },
    bookingsCount: { type: Number, default: 1 },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Payout", payoutSchema)
