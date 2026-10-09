const mongoose = require("mongoose")

const practitionerAvailabilitySchema = new mongoose.Schema(
  {
    practitioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },
    googleCalendarConnected: {
      type: Boolean,
      default: false,
    },
    googleAccessToken: { type: String },
    googleRefreshToken: { type: String },
    googleTokenExpiry: { type: Number },
    googleEmail: { type: String },
    timezone: { type: String, default: "Asia/Kolkata" },
    weeklySchedule: [
      {
        day: { type: Number, required: true }, // 0 (Sunday) to 6 (Saturday)
        slots: [
          {
            startTime: { type: String, required: true }, // "HH:MM" (24-hour)
            endTime: { type: String, required: true }, // "HH:MM" (24-hour)
          },
        ],
      },
    ],
  },
  { timestamps: true }
)

module.exports = mongoose.model("PractitionerAvailability", practitionerAvailabilitySchema)
