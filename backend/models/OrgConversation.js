const mongoose = require("mongoose")

/**
 * OrgConversation — Stores all "Book a Conversation" form submissions
 * from the For Organizations page. Admin can view & manage all these.
 */
const orgConversationSchema = new mongoose.Schema(
  {
    organizationName: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true, trim: true },
    contactPhone: { type: String, trim: true },
    companySize: { type: String }, // e.g. "50-200", "200+"
    message: { type: String, required: true },
    interestedIn: [{ type: String }], // e.g. ["1:1 Coaching", "Group Sessions"]

    status: {
      type: String,
      enum: ["new", "in_review", "contacted", "resolved"],
      default: "new",
    },

    // Admin notes on this inquiry
    adminNotes: { type: String, default: "" },
    assignedTo: { type: String }, // Admin can note who is handling this
  },
  { timestamps: true }
)

module.exports = mongoose.model("OrgConversation", orgConversationSchema)
