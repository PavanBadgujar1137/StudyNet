const ChatMessage = require("../models/ChatMessage")
const User = require("../models/User")
const PractitionerProfile = require("../models/PractitionerProfile")

// ─────────────────────────────────────────────────────────────────────────────
// 1. GLOBAL COMMUNITY CHAT
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/chat/global
exports.getGlobalMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ chatType: "global" })
      .populate("sender", "firstName lastName image accountType")
      .sort({ createdAt: 1 })
      .limit(100)
      .lean()

    return res.status(200).json({
      success: true,
      data: messages,
    })
  } catch (error) {
    console.error("getGlobalMessages error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// POST /api/v1/chat/global
exports.sendGlobalMessage = async (req, res) => {
  try {
    const senderId = req.user.id
    const { content, attachments } = req.body

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Message content cannot be empty." })
    }

    const message = await ChatMessage.create({
      sender: senderId,
      chatType: "global",
      content: content.trim(),
      attachments: attachments || [],
      readBy: [senderId],
    })

    const populatedMessage = await ChatMessage.findById(message._id)
      .populate("sender", "firstName lastName image accountType")
      .lean()

    return res.status(201).json({
      success: true,
      data: populatedMessage,
    })
  } catch (error) {
    console.error("sendGlobalMessage error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PRACTITIONER CIRCLE GROUP CHAT
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/chat/group/:practitionerId
exports.getPractitionerGroupMessages = async (req, res) => {
  try {
    const { practitionerId } = req.params

    const messages = await ChatMessage.find({
      chatType: "practitioner_group",
      practitioner: practitionerId,
    })
      .populate("sender", "firstName lastName image accountType")
      .sort({ createdAt: 1 })
      .limit(100)
      .lean()

    return res.status(200).json({
      success: true,
      data: messages,
    })
  } catch (error) {
    console.error("getPractitionerGroupMessages error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// POST /api/v1/chat/group/:practitionerId
exports.sendPractitionerGroupMessage = async (req, res) => {
  try {
    const senderId = req.user.id
    const { practitionerId } = req.params
    const { content, attachments } = req.body

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Message content cannot be empty." })
    }

    const message = await ChatMessage.create({
      sender: senderId,
      chatType: "practitioner_group",
      practitioner: practitionerId,
      content: content.trim(),
      attachments: attachments || [],
      readBy: [senderId],
    })

    const populatedMessage = await ChatMessage.findById(message._id)
      .populate("sender", "firstName lastName image accountType")
      .lean()

    return res.status(201).json({
      success: true,
      data: populatedMessage,
    })
  } catch (error) {
    console.error("sendPractitionerGroupMessage error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. 1-ON-1 DIRECT MESSAGING CHAT
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/chat/direct/:targetUserId
exports.getDirectMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id
    const { targetUserId } = req.params

    const messages = await ChatMessage.find({
      chatType: "direct",
      $or: [
        { sender: currentUserId, recipient: targetUserId },
        { sender: targetUserId, recipient: currentUserId },
      ],
    })
      .populate("sender", "firstName lastName image accountType")
      .populate("recipient", "firstName lastName image accountType")
      .sort({ createdAt: 1 })
      .limit(150)
      .lean()

    return res.status(200).json({
      success: true,
      data: messages,
    })
  } catch (error) {
    console.error("getDirectMessages error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// POST /api/v1/chat/direct/:targetUserId
exports.sendDirectMessage = async (req, res) => {
  try {
    const currentUserId = req.user.id
    const { targetUserId } = req.params
    const { content, attachments } = req.body

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Message content cannot be empty." })
    }

    const message = await ChatMessage.create({
      sender: currentUserId,
      recipient: targetUserId,
      chatType: "direct",
      content: content.trim(),
      attachments: attachments || [],
      readBy: [currentUserId],
    })

    const populatedMessage = await ChatMessage.findById(message._id)
      .populate("sender", "firstName lastName image accountType")
      .populate("recipient", "firstName lastName image accountType")
      .lean()

    return res.status(201).json({
      success: true,
      data: populatedMessage,
    })
  } catch (error) {
    console.error("sendDirectMessage error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. CHAT CONTACTS / ROOM LIST
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/chat/contacts
exports.getChatContacts = async (req, res) => {
  try {
    const userId = req.user.id
    const currentUser = await User.findById(userId).lean()

    let contacts = []

    if (currentUser.accountType === "Practitioner" || currentUser.accountType === "Instructor") {
      // Find clients who have messaged or booked with this practitioner
      const directMessagedUserIds = await ChatMessage.distinct("sender", {
        chatType: "direct",
        recipient: userId,
      })
      const directSentUserIds = await ChatMessage.distinct("recipient", {
        chatType: "direct",
        sender: userId,
      })

      const allUserIds = [...new Set([...directMessagedUserIds, ...directSentUserIds])]
      
      contacts = await User.find({ _id: { $in: allUserIds } })
        .select("firstName lastName email image accountType")
        .lean()

      // If no contacts yet, fetch active clients or sample users
      if (contacts.length === 0) {
        contacts = await User.find({ accountType: { $in: ["Client", "Student"] } })
          .select("firstName lastName email image accountType")
          .limit(10)
          .lean()
      }
    } else {
      // For Clients/Students: find practitioners
      const practitioners = await User.find({
        accountType: { $in: ["Practitioner", "Instructor"] },
      })
        .select("firstName lastName email image accountType")
        .limit(10)
        .lean()

      contacts = practitioners
    }

    return res.status(200).json({
      success: true,
      data: contacts,
    })
  } catch (error) {
    console.error("getChatContacts error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}
