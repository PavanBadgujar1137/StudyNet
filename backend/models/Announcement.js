const mongoose = require("mongoose")

const announcementSchema = new mongoose.Schema(
  {
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    pinned: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Announcement", announcementSchema)
