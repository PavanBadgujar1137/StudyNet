const ConsentLog = require("../models/ConsentLog")

exports.grantConsent = async (req, res) => {
  try {
    const { clientId, practitionerId, bookingId, consentType } = req.body
    const userId = req.user.id

    const targetClient = clientId || userId
    if (!consentType) {
      return res.status(400).json({
        success: false,
        message: "consentType ('copilot_audio' or 'copilot_notes') is required",
      })
    }

    // Revoke previous active consent if any for this type
    await ConsentLog.updateMany(
      { client: targetClient, consentType, isActive: true },
      { isActive: false, revokedAt: new Date() }
    )

    const consent = await ConsentLog.create({
      client: targetClient,
      practitioner: practitionerId || userId,
      booking: bookingId || undefined,
      consentType,
      grantedAt: new Date(),
      isActive: true,
    })

    return res.status(200).json({
      success: true,
      message: `Consent granted for ${consentType}`,
      consent,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to log consent grant",
      error: error.message,
    })
  }
}

exports.revokeConsent = async (req, res) => {
  try {
    const { clientId, consentType } = req.body
    const userId = req.user.id
    const targetClient = clientId || userId

    await ConsentLog.updateMany(
      { client: targetClient, consentType: consentType || { $exists: true }, isActive: true },
      { isActive: false, revokedAt: new Date() }
    )

    return res.status(200).json({
      success: true,
      message: "Consent revoked immediately. Co-pilot recording stopped.",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to revoke consent",
      error: error.message,
    })
  }
}

exports.checkConsentStatus = async (req, res) => {
  try {
    const { clientId } = req.params
    const activeConsents = await ConsentLog.find({
      client: clientId,
      isActive: true,
    }).select("consentType grantedAt")

    return res.status(200).json({
      success: true,
      activeConsents: activeConsents.map((c) => c.consentType),
      details: activeConsents,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to check consent status",
      error: error.message,
    })
  }
}
