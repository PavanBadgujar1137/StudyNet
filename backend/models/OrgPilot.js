const mongoose = require("mongoose")

const orgPilotSchema = new mongoose.Schema(
  {
    orgName: { type: String, trim: true },
    contactName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    workType: { type: String, required: true },
    meetingType: { type: String }, // e.g. "25 minutes", "40 minutes", "45 minutes"
    notes: { type: String },
    status: {
      type: String,
      enum: ["new", "contacted", "pilot_approved", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("OrgPilot", orgPilotSchema)
