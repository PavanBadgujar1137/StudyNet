const { contactUsEmail } = require("../mail/templates/contactFormRes")
const mailSender = require("../utils/mailSender")
const OrgPilot = require("../models/OrgPilot")

exports.contactUsController = async (req, res) => {
  const {
    email,
    firstname,
    lastname,
    name,
    message,
    phoneNo,
    countrycode,
    workType,
    meetingType,
  } = req.body

  const clientName = name || `${firstname || ''} ${lastname || ''}`.trim() || "Valued User"

  try {
    // Create OrgPilot record for lead tracking if workType or meetingType present
    if (workType || meetingType || message) {
      await OrgPilot.create({
        contactName: clientName,
        email,
        phone: phoneNo || "",
        workType: workType || "General Inquiry",
        meetingType: meetingType || "Standard Call",
        notes: message || "",
      })
    }

    // Try sending email notification if SMTP is configured
    if (process.env.MAIL_USER && process.env.MAIL_PASS) {
      try {
        await mailSender(
          email,
          "OpenHand — We received your request",
          contactUsEmail(email, firstname || clientName, lastname || "", message || "", phoneNo, countrycode)
        )
      } catch (mailErr) {
        console.warn("Mail send failed, but lead saved:", mailErr.message)
      }
    }

    return res.status(200).json({
      success: true,
      message: "Your message has been logged successfully. A founder will get back to you within 1 working day.",
    })
  } catch (error) {
    console.error("Contact Us Controller Error:", error)
    return res.status(500).json({
      success: false,
      message: "Something went wrong processing your request.",
      error: error.message,
    })
  }
}
