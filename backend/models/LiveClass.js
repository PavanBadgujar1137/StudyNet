const mongoose = require("mongoose")

// Tracks an individual attendee session
const attendeeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    joinedAt: { type: Date },
    leftAt: { type: Date },
    durationMinutes: { type: Number, default: 0 },
  },
  { _id: false }
)

const liveClassSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: false,
    },
    // Optional section context
    section: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },


    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    tags: [{ type: String }],

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    // Scheduling
    scheduledStart: { type: Date, required: true },
    scheduledEnd: { type: Date, required: true },
    actualStart: { type: Date },
    actualEnd: { type: Date },

    // Status lifecycle: scheduled → live → ended (or cancelled)
    status: {
      type: String,
      enum: ["scheduled", "live", "ended", "cancelled"],
      default: "scheduled",
    },

    // ── Zoom integration fields ──────────────────────────────────────────────
    streamProvider: {
      type: String,
      enum: ["zoom", "hms", "agora", "custom"],
      default: "zoom",
    },
    // Zoom Meeting details generated via Zoom API or provided link
    zoomMeetingId: { type: String },
    zoomJoinUrl: { type: String },
    zoomStartUrl: { type: String, select: false }, // host start link hidden from public queries
    zoomPassword: { type: String },

    // Chat
    chatEnabled: { type: Boolean, default: true },

    // Recording — populated post-class by instructor or auto webhook
    recordingUrl: { type: String },
    isRecordingPublished: { type: Boolean, default: false },
    recordedLectureRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecordedLecture",
    },

    // Attendance
    attendees: [attendeeSchema],
    maxAttendees: { type: Number, default: null }, // null = unlimited

    // Recurring class grouping — all docs in a series share this UUID
    recurrenceGroup: { type: String },

    // Reminder notification sent flag
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Index for efficient queries
liveClassSchema.index({ batch: 1, scheduledStart: 1 })
liveClassSchema.index({ instructor: 1, scheduledStart: 1 })
liveClassSchema.index({ status: 1 })
liveClassSchema.index({ recurrenceGroup: 1 })

module.exports = mongoose.model("LiveClass", liveClassSchema)
