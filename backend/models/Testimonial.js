const mongoose = require("mongoose")

const testimonialSchema = new mongoose.Schema(
  {
    practitioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    clientName: { type: String, required: true },
    content: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Testimonial", testimonialSchema)
