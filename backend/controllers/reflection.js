const ReflectionPrompt = require("../models/ReflectionPrompt")

exports.getClientPrompts = async (req, res) => {
  try {
    const userId = req.user.id
    let prompts = await ReflectionPrompt.find({ client: userId }).sort({ createdAt: -1 })

    if (prompts.length === 0) {
      // Seed default reflection prompt if client has none yet
      prompts = [
        await ReflectionPrompt.create({
          client: userId,
          practitioner: "600000000000000000000000", // system placeholder
          promptText: "What felt heavy this week that you carried without asking for support?",
          status: "pending",
        }),
        await ReflectionPrompt.create({
          client: userId,
          practitioner: "600000000000000000000000",
          promptText: "Notice one moment in the last 3 days where you reacted differently than you would have 6 months ago.",
          status: "pending",
        }),
      ]
    }

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
