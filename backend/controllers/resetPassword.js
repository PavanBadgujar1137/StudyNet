const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const { passwordResetEmail } = require("../mail/templates/passwordResetEmail")
const { passwordUpdated } = require("../mail/templates/passwordUpdate")
const bcrypt = require("bcrypt")
const crypto = require("crypto")

exports.resetPasswordToken = async (req, res) => {
  try {
    const rawEmail = req.body?.email?.trim()
    if (!rawEmail) {
      return res.json({
        success: false,
        message: "Email address is required",
      })
    }

    const user = await User.findOne({
      email: { $regex: new RegExp(`^${rawEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}$`, "i") },
    })

    if (!user) {
      return res.json({
        success: false,
        message: `This Email: ${rawEmail} is not Registered With Us. Enter a Valid Email.`,
      })
    }
    const token = crypto.randomBytes(20).toString("hex")

    await User.findOneAndUpdate(
      { _id: user._id },
      {
        token: token,
        resetPasswordExpires: Date.now() + 3600000, // 1 hour
      },
      { new: true }
    )

    // Dynamic origin resolution precedence:
    let origin = req.headers.origin
    if (!origin && req.headers.referer) {
      try {
        const parsed = new URL(req.headers.referer)
        origin = parsed.origin
      } catch (e) {}
    }
    if (!origin) {
      origin = process.env.FRONTEND_URL || process.env.CLIENT_URL || "https://openhand.live"
    }

    const url = `${origin.replace(/\/+$/, "")}/update-password/${token}`

    await mailSender(
      user.email,
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
    const { password, confirmPassword } = req.body
    let token = req.body?.token

    if (!token || typeof token !== "string" || !token.trim()) {
      return res.json({
        success: false,
        message: "Token is Invalid or Missing",
      })
    }

    const cleanToken = token.trim().split("?")[0].split("#")[0].replace(/\/+$/, "")

    if (confirmPassword !== password) {
      return res.json({
        success: false,
        message: "Password and Confirm Password Does not Match",
      })
    }

    const userDetails = await User.findOne({ token: cleanToken })
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


