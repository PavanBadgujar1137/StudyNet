const mongoose = require("mongoose")

const courseVideoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    videoUrl: { type: String, required: true }, // AWS S3 / CloudFront public URL
    s3Key: { type: String, default: "" }, // S3 object key for deletion/management
    thumbnail: { type: String, default: "" },
    durationSeconds: { type: Number, default: 0 },
    order: { type: Number, default: 0 }, // position within course

    // Parent course
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // Attached Lecture Notes & Documents (PDF, Doc, Sheet, Zip, Images, etc.)
    attachments: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        s3Key: { type: String, default: "" },
        fileType: { type: String, default: "file" }, // "pdf", "doc", "sheet", "image", "archive", "file"
        mimetype: { type: String, default: "" },
        size: { type: Number, default: 0 },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Analytics
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model("CourseVideo", courseVideoSchema)

