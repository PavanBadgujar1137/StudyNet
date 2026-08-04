const bcrypt = require("bcrypt")
const User = require("../models/User")
const OTP = require("../models/OTP")
const jwt = require("jsonwebtoken")
const otpGenerator = require("otp-generator")
const mailSender = require("../utils/mailSender")
const { passwordUpdated } = require("../mail/templates/passwordUpdate")
const Profile = require("../models/Profile")
require("dotenv").config()

// Signup Controller for Registering USers

exports.signup = async (req, res) => {
  try {
    // Destructure fields from the request body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body
    // Check if All Details are there or not
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).send({
        success: false,
        message: "All Fields are required",
      })
    }
    // Check if password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and Confirm Password do not match. Please try again.",
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      })
    }

    // Find the most recent OTP for the email
    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1)
    console.log(response)
    if (response.length === 0) {
      // OTP not found for the email
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      })
    } else if (otp !== response[0].otp) {
      // Invalid OTP
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the user
    let approved = ""
    approved === "Instructor" ? (approved = false) : (approved = true)

    // Create the Additional Profile For User
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    })
    const now = new Date()
    const trialExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType: accountType,
      approved: approved,
      additionalDetails: profileDetails._id,
      image: "",
      trialStartedAt: now,
      trialExpiresAt: trialExpiresAt,
      activePlan: accountType === "Client" || accountType === "Student" ? "trial" : "none",
    })

    // If Practitioner / Instructor, auto-create PractitionerProfile with bank payout details
    if (accountType === "Practitioner" || accountType === "Instructor") {
      const PractitionerProfile = require("../models/PractitionerProfile")
      const { bankAccountName, bankAccountNumber, bankIfscCode, bankName, upiId } = req.body
      await PractitionerProfile.create({
        user: user._id,
        credentials: req.body.credentials || "",
        bio: req.body.bio || "",
        bankAccountName: bankAccountName || "",
        bankAccountNumber: bankAccountNumber || "",
        bankIfscCode: bankIfscCode || "",
        bankName: bankName || "",
        upiId: upiId || "",
      })
    }

    const token = jwt.sign(
      { email: user.email, id: user._id, accountType: user.accountType, role: user.accountType },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    )

    const userObj = user.toObject ? user.toObject() : user
    delete userObj.password
    userObj.token = token

    return res.status(200).json({
      success: true,
      token,
      user: userObj,
      message: "User registered successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    })
  }
}

// Login controller for authenticating users
exports.login = async (req, res) => {
  try {
    // Get email and password from request body
    const { email, password } = req.body

    // Check if email or password is missing
    if (!email || !password) {
      // Return 400 Bad Request status code with error message
      return res.status(400).json({
        success: false,
        message: `Please Fill up All the Required Fields`,
      })
    }

    // Find user with provided email
    let user = await User.findOne({ email }).populate("additionalDetails")

    // Auto-create default admin account on first login attempt if missing
    if (!user && email.toLowerCase() === "admin@openhand.com") {
      const Profile = require("../models/Profile")
      const hashedPassword = await bcrypt.hash("AdminPassword123!", 10)
      const profile = await Profile.create({ gender: null, dateOfBirth: null, about: "Platform Administrator", contactNumber: null })
      user = await User.create({
        firstName: "Super",
        lastName: "Admin",
        email: "admin@openhand.com",
        password: hashedPassword,
        accountType: "Admin",
        additionalDetails: profile._id,
        approved: true,
        active: true,
      })
      user = await User.findById(user._id).populate("additionalDetails")
    }

    // If user not found with provided email
    if (!user) {
      return res.status(401).json({
        success: false,
        message: `User is not Registered with Us Please SignUp to Continue`,
      })
    }

    // Auto-heal missing trial dates for Client/Student users
    if ((user.accountType === "Client" || user.accountType === "Student") && !user.trialExpiresAt) {
      user.trialStartedAt = user.createdAt || new Date()
      user.trialExpiresAt = new Date(new Date(user.trialStartedAt).getTime() + 7 * 24 * 60 * 60 * 1000)
      if (!user.activePlan) user.activePlan = "trial"
      await user.save()
    }

    // Generate JWT token and Compare Password
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { email: user.email, id: user._id, accountType: user.accountType, role: user.accountType },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      )

      // Save token to user document in database
      user.token = token
      user.password = undefined
      // Set cookie for token and return success response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      }
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: `User Login Success`,
      })
    } else {
      return res.status(401).json({
        success: false,
        message: `Password is incorrect`,
      })
    }
  } catch (error) {
    console.error(error)
    // Return 500 Internal Server Error status code with error message
    return res.status(500).json({
      success: false,
      message: `Login Failure Please Try Again`,
    })
  }
}

// ─── Social Login (Google & LinkedIn) ──────────────────────────────────────────
exports.socialLogin = async (req, res) => {
  try {
    const { provider = "google", email, firstName, lastName, image, accountType = "Client" } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required for social authentication",
      })
    }

    const emailLower = String(email).toLowerCase().trim()
    let user = await User.findOne({ email: emailLower }).populate("additionalDetails")

    if (!user) {
      // Create new account for social registration
      const Profile = require("../models/Profile")
      const PractitionerProfile = require("../models/PractitionerProfile")

      const fName = firstName || emailLower.split("@")[0] || "User"
      const lName = lastName || ""
      const dummyPassword = await bcrypt.hash(`social_${provider}_${Date.now()}`, 10)

      const profileDetails = await Profile.create({
        gender: null,
        dateOfBirth: null,
        about: `Registered via ${provider === "google" ? "Google" : "LinkedIn"} Sign-In`,
        contactNumber: null,
      })

      const userAccountType = ["Client", "Practitioner"].includes(accountType) ? accountType : "Client"
      const now = new Date()
      const trialExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

      user = await User.create({
        firstName: fName,
        lastName: lName,
        email: emailLower,
        password: dummyPassword,
        accountType: userAccountType,
        additionalDetails: profileDetails._id,
        image: image || `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(fName + " " + lName)}`,
        approved: true,
        active: true,
        trialStartedAt: userAccountType === "Client" ? now : undefined,
        trialExpiresAt: userAccountType === "Client" ? trialExpiresAt : undefined,
        activePlan: userAccountType === "Client" ? "trial" : "none",
      })

      if (userAccountType === "Practitioner") {
        await PractitionerProfile.create({
          user: user._id,
          bio: "Verified practitioner registered via social login",
        })
      }

      user = await User.findById(user._id).populate("additionalDetails")
    } else {
      // User exists - update profile picture if missing or dicebear placeholder
      if (image && (!user.image || user.image.includes("dicebear"))) {
        user.image = image
        await user.save()
      }

      if ((user.accountType === "Client" || user.accountType === "Student") && !user.trialExpiresAt) {
        user.trialStartedAt = user.createdAt || new Date()
        user.trialExpiresAt = new Date(new Date(user.trialStartedAt).getTime() + 7 * 24 * 60 * 60 * 1000)
        if (!user.activePlan) user.activePlan = "trial"
        await user.save()
      }
    }

    const token = jwt.sign(
      { email: user.email, id: user._id, accountType: user.accountType, role: user.accountType },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    )

    user.token = token
    user.password = undefined

    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    }

    return res.cookie("token", token, options).status(200).json({
      success: true,
      token,
      user,
      message: `Successfully authenticated via ${provider === "google" ? "Google" : "LinkedIn"}!`,
    })
  } catch (error) {
    console.error("socialLogin error:", error)
    return res.status(500).json({
      success: false,
      message: error.message || "Social authentication failed",
    })
  }
}
// Send OTP For Email Verification
exports.sendotp = async (req, res) => {
  try {
    const { email } = req.body

    // Check if user is already present
    // Find user with provided email
    const checkUserPresent = await User.findOne({ email })
    // to be used in case of signup

    // If user found with provided email
    if (checkUserPresent) {
      // Return 401 Unauthorized status code with error message
      return res.status(401).json({
        success: false,
        message: `User is Already Registered`,
      })
    }

    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    })
    const result = await OTP.findOne({ otp: otp })
    console.log("Result is Generate OTP Func")
    console.log("OTP", otp)
    console.log("Result", result)
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
      })
    }
    const otpPayload = { email, otp }
    const otpBody = await OTP.create(otpPayload)
    console.log("OTP Body", otpBody)
    res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
      otp,
    })
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ success: false, error: error.message })
  }
}

// Controller for Changing Password
exports.changePassword = async (req, res) => {
  try {
    // Get user data from req.user
    const userDetails = await User.findById(req.user.id)

    // Get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword } = req.body

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    )
    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" })
    }

    // Update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10)
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    )

    // Send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password for your account has been updated",
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      )
      console.log("Email sent successfully:", emailResponse.response)
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      })
    }

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error)
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    })
  }
}
