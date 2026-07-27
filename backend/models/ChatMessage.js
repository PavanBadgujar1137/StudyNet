const mongoose = require("mongoose")

const chatMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    // "global" | "practitioner_group" | "direct"
    chatType: {
      type: String,
      enum: ["global", "practitioner_group", "direct"],
      required: true,
      default: "global",
    },
    // Used for practitioner_group and direct chats to identify the practitioner
    practitioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    // Used for direct 1-on-1 chats to identify the client/recipient
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: [
      {
        type: String,
      },
    ],
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  { timestamps: true }
)

// Indexing for quick querying of chat feeds
chatMessageSchema.index({ chatType: 1, createdAt: 1 })
chatMessageSchema.index({ chatType: 1, practitioner: 1, createdAt: 1 })
chatMessageSchema.index({ chatType: 1, sender: 1, recipient: 1, createdAt: 1 })

module.exports = mongoose.model("ChatMessage", chatMessageSchema)
