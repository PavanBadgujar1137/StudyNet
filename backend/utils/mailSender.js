const nodemailer = require("nodemailer")

const mailSender = async (email, title, body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.MAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    })

    const info = await transporter.sendMail({
      from: `"OpenHand" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    })

    console.log("Email sent successfully:", info.response)
    return info
  } catch (error) {
    console.log("Error sending email:", error.message)
    throw error
  }
}

module.exports = mailSender
