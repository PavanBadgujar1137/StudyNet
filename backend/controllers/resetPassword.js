const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const { passwordResetEmail } = require("../mail/templates/passwordResetEmail")
const { passwordUpdated } = require("../mail/templates/passwordUpdate")
const bcrypt = require("bcrypt")
const crypto = require("crypto")

exports.resetPasswordToken = async (req, res) => {
  try {
    const email = req.body?.email?.trim()
    if (!email) {
      return res.json({
        success: false,
        message: "Email address is required",
      })
    }

    const user = await User.findOne({ email: email })
    if (!user) {
      return res.json({
        success: false,
        message: `This Email: ${email} is not Registered With Us. Enter a Valid Email.`,
      })
    }
    const token = crypto.randomBytes(20).toString("hex")

    await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 3600000, // 1 hour
      },
      { new: true }
    )

    // Dynamic origin resolution precedence:
    // 1. HTTP Request Origin header (exact host/port browser requested from)
    // 2. HTTP Request Referer header origin
    // 3. process.env.FRONTEND_URL
    // 4. process.env.CLIENT_URL
    // 5. Default fallback: http://localhost:3000
    let origin = req.headers.origin
    if (!origin && req.headers.referer) {
      try {
        const parsed = new URL(req.headers.referer)
        origin = parsed.origin
      } catch (e) {}
    }
    if (!origin) {
      origin = process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:3000"
    }

    const url = `${origin.replace(/\/+$/, "")}/update-password/${token}`

    await mailSender(
      email,
      "Password Reset Request - OpenHand",
      passwordResetEmail(url, user.firstName || "User")
    )

    res.json({
      success: true,
      message:
        "Email Sent Successfully, Please Check Your Email to Continue Further",
    })
  } catch (error) {
    return res.json({
      error: error.message,
      success: false,
      message: `Some Error in Sending the Reset Message`,
    })
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body

    if (!token || typeof token !== "string" || !token.trim()) {
      return res.json({
        success: false,
        message: "Token is Invalid or Missing",
      })
    }

    if (confirmPassword !== password) {
      return res.json({
        success: false,
        message: "Password and Confirm Password Does not Match",
      })
    }

    const userDetails = await User.findOne({ token: token.trim() })
    if (!userDetails) {
      return res.json({
        success: false,
        message: "Token is Invalid",
      })
    }

    if (!userDetails.resetPasswordExpires || new Date(userDetails.resetPasswordExpires).getTime() < Date.now()) {
      return res.status(403).json({
        success: false,
        message: `Token is Expired, Please Regenerate Your Token`,
      })
    }

    const encryptedPassword = await bcrypt.hash(password, 10)
    const updatedUser = await User.findOneAndUpdate(
      { _id: userDetails._id },
      {
        password: encryptedPassword,
        $unset: { token: 1, resetPasswordExpires: 1 }
      },
      { new: true }
    )

    try {
      await mailSender(
        updatedUser.email,
        "Password Updated Successfully - OpenHand",
        passwordUpdated(updatedUser.email, updatedUser.firstName || "User")
      )
    } catch (mailErr) {
      console.error("Failed to send password update confirmation email:", mailErr.message)
    }

    res.json({
      success: true,
      message: `Password Reset Successful`,
    })
  } catch (error) {
    return res.json({
      error: error.message,
      success: false,
      message: `Some Error in Updating the Password`,
    })
  }
}


