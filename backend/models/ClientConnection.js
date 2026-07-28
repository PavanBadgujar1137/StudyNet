const mongoose = require("mongoose")

const clientConnectionSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ["pending_approval", "approved", "active", "rejected", "archived"],
      default: "pending_approval",
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    paymentId: {
      type: String,
      default: "",
    },
    orderId: {
      type: String,
      default: "",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "failed"],
      default: "paid",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
)

// Ensure unique client-practitioner pair
clientConnectionSchema.index({ client: 1, practitioner: 1 }, { unique: true })

module.exports = mongoose.model("ClientConnection", clientConnectionSchema)
