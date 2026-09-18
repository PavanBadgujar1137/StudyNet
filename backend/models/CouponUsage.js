const mongoose = require("mongoose")

const couponUsageSchema = new mongoose.Schema(
  {
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    learnerDiscount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LearnerDiscount",
      default: null,
    },
    code: {
      type: String,
      default: "",
    },
    couponType: {
      type: String,
      enum: ["admin", "practitioner", "personal"],
      default: "admin",
    },
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    practitioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    productType: {
      type: String,
      enum: ["course", "session"],
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      default: null,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      required: true,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    appliedCoupons: [
      {
        code: String,
        couponType: String,
        discountPercentage: Number,
        discountAmount: Number,
      },
    ],
    orderId: {
      type: String,
      default: "",
    },
    paymentId: {
      type: String,
      default: "",
    },
    usedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("CouponUsage", couponUsageSchema)
