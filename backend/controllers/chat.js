const ChatMessage = require("../models/ChatMessage")
const User = require("../models/User")
const PractitionerProfile = require("../models/PractitionerProfile")
const { PutObjectCommand } = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")
const s3Client = require("../config/s3")
const path = require("path")

const BUCKET = process.env.AWS_S3_BUCKET_NAME
const REGION = process.env.AWS_REGION || "ap-south-1"
const FOLDER_PREFIX = process.env.AWS_S3_FOLDER || "openhand/uat"
const CLOUDFRONT_DOMAIN = process.env.AWS_CLOUDFRONT_DOMAIN

function buildFileUrl(key) {
  if (CLOUDFRONT_DOMAIN) {
    return `https://${CLOUDFRONT_DOMAIN}/${key}`
  }
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`
}

function buildS3Key(folder, originalName) {
  const timestamp = Date.now()
  const ext = path.extname(originalName || "file") || ""
  const baseName = path.basename(originalName || "upload", ext)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 80)
  return `${FOLDER_PREFIX}/${folder}/${timestamp}-${baseName}${ext}`
}

// ─────────────────────────────────────────────────────────────────────────────
// 0. DIRECT S3 PRESIGN FOR CHAT MEDIA (Images, Videos, Large Files up to 3GB)
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/v1/chat/presign-media
exports.presignChatMediaUpload = async (req, res) => {
  try {
    const { fileName, size, fileSize, fileType } = req.body

    if (!fileName) {
      return res.status(400).json({ success: false, message: "fileName is required" })
    }
    if (!BUCKET) {
      return res.status(500).json({ success: false, message: "S3 bucket not configured" })
    }

    const MAX_CHAT_FILE_SIZE = 3 * 1024 * 1024 * 1024 // 3 GB limit
    const incomingSize = size || fileSize
    if (incomingSize && Number(incomingSize) > MAX_CHAT_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        message: "File size exceeds the maximum limit of 3 GB.",
      })
    }

    const key = buildS3Key("chat_attachments", fileName)

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 14400 })
    const publicUrl = buildFileUrl(key)

    console.log(`[ChatPresign] user=${req.user?.id} fileName=${fileName} key=${key}`)
    return res.status(200).json({ success: true, presignedUrl, publicUrl, key, fileType: fileType || "application/octet-stream" })
  } catch (error) {
    console.error("presignChatMediaUpload error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

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

    let parsedAttachments = []
    if (attachments) {
      parsedAttachments = typeof attachments === "string" ? JSON.parse(attachments) : attachments
    }

    if ((!content || !content.trim()) && (!parsedAttachments || parsedAttachments.length === 0)) {
      return res.status(400).json({ success: false, message: "Message cannot be empty." })
    }

    const message = await ChatMessage.create({
      sender: senderId,
      chatType: "global",
      content: (content || "").trim(),
      attachments: Array.isArray(parsedAttachments) ? parsedAttachments : [],
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

    let parsedAttachments = []
    if (attachments) {
      parsedAttachments = typeof attachments === "string" ? JSON.parse(attachments) : attachments
    }

    if ((!content || !content.trim()) && (!parsedAttachments || parsedAttachments.length === 0)) {
      return res.status(400).json({ success: false, message: "Message cannot be empty." })
    }

    const message = await ChatMessage.create({
      sender: senderId,
      chatType: "practitioner_group",
      practitioner: practitionerId,
      content: (content || "").trim(),
      attachments: Array.isArray(parsedAttachments) ? parsedAttachments : [],
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

    let parsedAttachments = []
    if (attachments) {
      parsedAttachments = typeof attachments === "string" ? JSON.parse(attachments) : attachments
    }

    if ((!content || !content.trim()) && (!parsedAttachments || parsedAttachments.length === 0)) {
      return res.status(400).json({ success: false, message: "Message cannot be empty." })
    }

    const message = await ChatMessage.create({
      sender: currentUserId,
      recipient: targetUserId,
      chatType: "direct",
      content: (content || "").trim(),
      attachments: Array.isArray(parsedAttachments) ? parsedAttachments : [],
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
