const mongoose = require("mongoose")

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    couponType: {
      type: String,
      enum: ["admin", "practitioner"],
      default: "admin",
      required: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 1,
      max: 100, // For percentage; fixed can exceed if discountType === 'fixed'
    },
    applicableTo: {
      type: String,
      enum: ["courses", "sessions", "both"],
      default: "both",
      required: true,
    },
    // If empty array → applicable to all courses
    applicableCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    // If empty array → applicable to all offers/sessions
    applicableOffers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Offer",
      },
    ],
    // If couponType is practitioner, this binds the coupon strictly to this practitioner's products
    practitioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: null, // null = no cap
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: null, // null = never expires
    },
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
    },
    perUserLimit: {
      type: Number,
      default: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Coupon", couponSchema)
