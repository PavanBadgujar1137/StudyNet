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

    // ── LiveKit WebRTC Streaming Fields ──────────────────────────────────────
    streamProvider: {
      type: String,
      enum: ["livekit", "custom"],
      default: "livekit",
    },
    // LiveKit Room identifier and connection details
    livekitRoomName: { type: String },
    livekitServerUrl: { type: String },

    // Chat
    chatEnabled: { type: Boolean, default: true },

    // Recording — populated post-class by instructor or auto webhook
    recordingUrl: { type: String },
    isRecordingPublished: { type: Boolean, default: false },
    recordedLectureRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecordedLecture",
    },

    // Session Type: 1-on-1 (default) or group
    sessionType: {
      type: String,
      enum: ["1-on-1", "group"],
      default: "1-on-1",
    },
    // Optional specific client for 1-on-1 session
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },

    // Attendance
    attendees: [attendeeSchema],
    maxAttendees: { type: Number, default: null }, // null = unlimited (or 1 for 1-on-1)

    // Recurring class grouping — all docs in a series share this UUID
    recurrenceGroup: { type: String },

    // Reminder notification sent flag
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Index for efficient queries
liveClassSchema.index({ instructor: 1, scheduledStart: 1 })
liveClassSchema.index({ client: 1, scheduledStart: 1 })
liveClassSchema.index({ status: 1 })
liveClassSchema.index({ recurrenceGroup: 1 })

module.exports = mongoose.model("LiveClass", liveClassSchema)
