const ReflectionPrompt = require("../models/ReflectionPrompt")
const ClientConnection = require("../models/ClientConnection")

const DEFAULT_PROMPTS = [
  "What felt heavy this week that you carried without asking for support?",
  "Notice one moment in the last 3 days where you reacted differently than you would have 6 months ago.",
]

exports.getClientPrompts = async (req, res) => {
  try {
    const userId = req.user.id

    // Delete auto-generated default prompts if present
    await ReflectionPrompt.deleteMany({
      client: userId,
      promptText: { $in: DEFAULT_PROMPTS },
    })

    const prompts = await ReflectionPrompt.find({ client: userId })
      .populate("practitioner", "firstName lastName email image")
      .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      prompts,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reflection prompts",
      error: error.message,
    })
  }
}

exports.answerPrompt = async (req, res) => {
  try {
    const userId = req.user.id
    const { promptId, answerText, action, isPrivate } = req.body // action: "answer" | "skip"

    const prompt = await ReflectionPrompt.findOne({ _id: promptId, client: userId })
    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: "Reflection prompt not found",
      })
    }

    if (action === "skip") {
      prompt.status = "skipped"
      prompt.isPrivate = true // server-enforced: skipped status is never exposed with reason
    } else {
      prompt.status = "answered"
      prompt.answerText = answerText || ""
      prompt.isPrivate = Boolean(isPrivate)
      prompt.answeredAt = new Date()
    }

    await prompt.save()

    return res.status(200).json({
      success: true,
      message: action === "skip" ? "Prompt skipped" : "Reflection saved",
      prompt,
      privacyGuarantee: "Your practitioner sees your answers, but never which prompts you skipped or marked private.",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to process reflection prompt",
      error: error.message,
    })
  }
}

exports.createPractitionerPrompt = async (req, res) => {
  try {
    const practitionerId = req.user.id
    const { clientId, promptText } = req.body

    if (!clientId || !promptText) {
      return res.status(400).json({
        success: false,
        message: "Learner ID and prompt text are required",
      })
    }

    const newPrompt = await ReflectionPrompt.create({
      client: clientId,
      practitioner: practitionerId,
      promptText,
      status: "pending",
    })

    const populatedPrompt = await ReflectionPrompt.findById(newPrompt._id)
      .populate("client", "firstName lastName email image")
      .populate("practitioner", "firstName lastName email image")

    return res.status(201).json({
      success: true,
      message: "Reflection prompt sent to learner successfully",
      prompt: populatedPrompt,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create reflection prompt",
      error: error.message,
    })
  }
}

exports.getPractitionerReflections = async (req, res) => {
  try {
    const practitionerId = req.user.id

    // Delete auto-generated default prompts if present
    await ReflectionPrompt.deleteMany({
      practitioner: practitionerId,
      promptText: { $in: DEFAULT_PROMPTS },
    })

    const prompts = await ReflectionPrompt.find({ practitioner: practitionerId })
      .populate("client", "firstName lastName email image")
      .sort({ createdAt: -1 })
      .lean()

    const sanitizedPrompts = prompts.map((p) => {
      if (p.isPrivate && p.status === "answered") {
        return {
          ...p,
          answerText: "🔒 Learner saved this reflection privately.",
        }
      }
      return p
    })

    return res.status(200).json({
      success: true,
      prompts: sanitizedPrompts,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch practitioner reflections",
      error: error.message,
    })
  }
}
