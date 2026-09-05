const mongoose = require("mongoose")

const courseVideoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    videoUrl: { type: String, required: true }, // Cloudinary URL
    thumbnail: { type: String, default: "" },
    durationSeconds: { type: Number, default: 0 },
    order: { type: Number, default: 0 }, // position within course

    // Parent course
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // Analytics
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model("CourseVideo", courseVideoSchema)
