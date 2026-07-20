const mongoose = require("mongoose")

const recordedLectureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    videoUrl: { type: String, required: true }, // Cloudinary CDN URL or similar
    thumbnail: { type: String },
    durationSeconds: { type: Number, default: 0 },

    // References
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
    subsection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSection",
    },

    transcript: { type: String, default: "" },
    resources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Note",
      },
    ],

    watermarkEnabled: { type: Boolean, default: true },
    drmProtected: { type: Boolean, default: false },

    // Analytics
    views: { type: Number, default: 0 },
    avgWatchPercent: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model("RecordedLecture", recordedLectureSchema)
