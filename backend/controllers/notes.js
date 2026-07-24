const Note = require("../models/Note")
const { uploadImageToCloudinary } = require("../utils/imageUploader")

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTOR: Upload Note / DPP / Study Material
// ─────────────────────────────────────────────────────────────────────────────
exports.uploadNote = async (req, res) => {
  try {
    const instructorId = req.user.id
    const { title, type, courseId, relatedLectureId, downloadable } = req.body

    if (!title || !type || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Title, type, and courseId are required.",
      })
    }

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." })
    }

    if (String(course.instructor) !== String(instructorId)) {
      return res.status(403).json({ success: false, message: "Unauthorized." })
    }

    // Check file upload
    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." })
    }

    // Upload to Cloudinary (use custom folder)
    const file = req.files.file
    const uploadRes = await uploadImageToCloudinary(file, process.env.FOLDER_NAME || "StudyNet")

    const note = await Note.create({
      title,
      type,
      fileUrl: uploadRes.secure_url,
      relatedLecture: relatedLectureId || undefined,
      relatedCourse: courseId,
      downloadable: downloadable !== "false",
      uploadedBy: instructorId,
    })

    return res.status(201).json({
      success: true,
      message: "Study material uploaded successfully.",
      data: note,
    })
  } catch (error) {
    console.error("uploadNote error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT / INSTRUCTOR: Get all notes / DPPs for a course
// ─────────────────────────────────────────────────────────────────────────────
exports.getNotesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params

    const notes = await Note.find({ relatedCourse: courseId })
      .populate("relatedLecture", "title")
      .sort({ createdAt: -1 })
      .lean()

    return res.status(200).json({ success: true, data: notes })
  } catch (error) {
    console.error("getNotesByCourse error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT: Track file download telemetry count
// ─────────────────────────────────────────────────────────────────────────────
exports.trackDownload = async (req, res) => {
  try {
    const { noteId } = req.params

    const note = await Note.findByIdAndUpdate(
      noteId,
      { $inc: { downloadCount: 1 } },
      { new: true }
    )

    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found." })
    }

    return res.status(200).json({ success: true, message: "Download tracked.", data: note })
  } catch (error) {
    console.error("trackDownload error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}
