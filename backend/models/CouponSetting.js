const mongoose = require("mongoose")

const couponSettingSchema = new mongoose.Schema(
  {
    allowStacking: {
      type: Boolean,
      default: true,
    },
    stackingPriority: {
      type: String,
      enum: ["personal_first", "best_discount", "admin_first", "practitioner_first"],
      default: "personal_first",
    },
    allowAdminPractitionerStacking: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("CouponSetting", couponSettingSchema)
