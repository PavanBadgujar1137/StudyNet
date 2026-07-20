const mongoose = require("mongoose")

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["notes", "dpp", "formula_sheet", "assignment"],
      required: true,
    },
    fileUrl: { type: String, required: true }, // Cloudinary file link
    relatedLecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecordedLecture",
    },
    relatedCourse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    downloadable: { type: Boolean, default: true },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    downloadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Note", noteSchema)
