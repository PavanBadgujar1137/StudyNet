const mongoose = require("mongoose")

const invoiceSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
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
    invoiceNumber: { type: String, required: true, unique: true },
    subtotal: { type: Number, required: true },
    gstRatePercentage: { type: Number, default: 18 },
    gstAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    pdfUrl: { type: String },
    status: {
      type: String,
      enum: ["issued", "paid", "voided"],
      default: "issued",
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Invoice", invoiceSchema)
