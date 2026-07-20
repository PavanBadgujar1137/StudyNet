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
      required: true,
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

    // ── 100ms.live (HMS) integration fields ──────────────────────────────────
    streamProvider: {
      type: String,
      enum: ["hms", "agora", "zoom", "custom"],
      default: "hms",
    },
    // HMS room ID created via HMS Management API
    hmsRoomId: { type: String, select: false }, // hidden from public queries
    // HMS room code for students joining (short code, not the auth token)
    hmsRoomCode: { type: String, select: false },
    // Only set when the instructor "starts" the class and opens the room
    hmsRoomEnabled: { type: Boolean, default: false },

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
