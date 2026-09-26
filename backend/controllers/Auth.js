const bcrypt = require("bcrypt")
const User = require("../models/User")
const OTP = require("../models/OTP")
const jwt = require("jsonwebtoken")
const otpGenerator = require("otp-generator")
const mailSender = require("../utils/mailSender")
const { passwordUpdated } = require("../mail/templates/passwordUpdate")
const Profile = require("../models/Profile")
require("dotenv").config()

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Signup Controller for Registering USers

exports.signup = async (req, res) => {
  let user, profileDetails
  try {
    // Destructure fields from the request body
    const {
      title,
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

    const cleanEmail = String(email).trim().toLowerCase()

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address format (e.g., name@domain.com)",
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
    const existingUser = await User.findOne({
      email: { $regex: new RegExp("^" + cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i") },
    })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered. Each account requires a unique email address. Please sign in or use another email to register.",
      })
    }

    // Find the most recent OTP for the email
    const response = await OTP.find({ email: cleanEmail }).sort({ createdAt: -1 }).limit(1)
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
    profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: contactNumber || "",
    })
    const now = new Date()
    const isPractitioner = accountType === "Practitioner" || accountType === "Instructor"
    const isLearner = accountType === "Learner" || accountType === "Client" || accountType === "Student"
    const trialDays = 14
    const trialExpiresAt = isPractitioner ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000) : null

    let learnerId = undefined
    if (isLearner) {
      const { generateUniqueLearnerId } = require("../utils/learnerIdGenerator")
      learnerId = await generateUniqueLearnerId(User)
    }

    // NOTE: Do NOT include learnerId in the create payload when it's undefined/null.
    // Sparse unique index only ignores ABSENT fields — storing explicit null still
    // triggers E11000 duplicate key when a second practitioner registers.
    const userCreatePayload = {
      title: title || "",
      firstName,
      lastName,
      email: cleanEmail,
      contactNumber: contactNumber || "",
      password: hashedPassword,
      accountType: accountType,
      approved: approved,
      additionalDetails: profileDetails._id,
      image: "",
      trialStartedAt: now,
      trialExpiresAt: trialExpiresAt,
      activePlan: isPractitioner ? "trial" : "none",
    }
    if (learnerId) userCreatePayload.learnerId = learnerId

    user = await User.create(userCreatePayload)

    // If Practitioner / Instructor, auto-create PractitionerProfile with bank payout details & default handle
    if (accountType === "Practitioner" || accountType === "Instructor") {
      const PractitionerProfile = require("../models/PractitionerProfile")
      const { bankAccountName, bankAccountNumber, bankIfscCode, bankName, upiId } = req.body
      const nameSlug = `${firstName || ''}-${lastName || ''}`
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      let defaultHandle = nameSlug || `practitioner-${user._id.toString().slice(-4)}`

      // Ensure handle is strictly unique across all practitioner profiles
      const existingHandle = await PractitionerProfile.findOne({ handle: defaultHandle })
      if (existingHandle) {
        defaultHandle = `${defaultHandle}-${user._id.toString().slice(-4)}`
        const secondCheck = await PractitionerProfile.findOne({ handle: defaultHandle })
        if (secondCheck) {
          defaultHandle = `${defaultHandle}-${Date.now().toString().slice(-4)}`
        }
      }

      const practitionerProfile = await PractitionerProfile.create({
        user: user._id,
        handle: defaultHandle,
        credentials: req.body.credentials || "",
        bio: req.body.bio || "",
        bankAccountName: bankAccountName || "",
        bankAccountNumber: bankAccountNumber || "",
        bankIfscCode: bankIfscCode || "",
        bankName: bankName || "",
        upiId: upiId || "",
      })

      user.practitionerProfile = practitionerProfile._id
      await user.save()
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
      isNewRegistration: true,
      message: "User registered successfully",
    })
  } catch (error) {
    console.error("Signup error:", error)
    if (user && user._id) {
      try {
        await User.findByIdAndDelete(user._id)
        if (profileDetails && profileDetails._id) {
          await Profile.findByIdAndDelete(profileDetails._id)
        }
      } catch (cleanupErr) {
        console.error("Cleanup error after failed signup:", cleanupErr)
      }
    }
    return res.status(500).json({
      success: false,
      message: error?.message || "User cannot be registered. Please try again.",
    })
  }
}

// Login controller for authenticating users
exports.login = async (req, res) => {
  try {
    // Get email and password from request body
    const { email, password, accountType, role, expectedAccountType } = req.body

    // Check if email or password is missing
    if (!email || !password) {
      // Return 400 Bad Request status code with error message
      return res.status(400).json({
        success: false,
        message: `Please Fill up All the Required Fields`,
      })
    }

    const cleanEmail = String(email).trim().toLowerCase()

    // Find user with provided email
    let user = await User.findOne({
      email: { $regex: new RegExp("^" + cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i") },
    }).populate("additionalDetails")

    // Auto-create default admin account on first login attempt if missing
    if (!user && cleanEmail === "admin@openhand.com") {
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

    // Role-based login validation (Learner vs Practitioner panels)
    const requestedRole = accountType || role || expectedAccountType
    if (requestedRole && user.accountType !== "Admin") {
      const isUserPractitioner = user.accountType === "Practitioner" || user.accountType === "Instructor"
      const isUserLearner = user.accountType === "Learner" || user.accountType === "Student" || user.accountType === "Client"

      if ((requestedRole === "Learner" || requestedRole === "Student" || requestedRole === "Client") && isUserPractitioner) {
        return res.status(400).json({
          success: false,
          message: "This email is registered as a Practitioner account. Please log in using the Practitioner Login.",
        })
      }

      if ((requestedRole === "Practitioner" || requestedRole === "Instructor") && isUserLearner) {
        return res.status(400).json({
          success: false,
          message: "This email is registered as a Learner account. Please log in using the Learner Login.",
        })
      }
    }

    // Check if account is scheduled for deletion or has reached permanent deletion date
    if (user.isDeleted) {
      const now = new Date()
      if (user.deletionEffectiveDate && new Date(user.deletionEffectiveDate) <= now) {
        try {
          const { hardDeleteUser } = require("./admin")
          await hardDeleteUser(user._id)
        } catch (e) {
          console.error("Auto hard-delete on login error:", e.message)
        }
        return res.status(403).json({
          success: false,
          message: "This account has been permanently deleted from our database.",
        })
      }

      const effectiveDate = user.deletionEffectiveDate ? new Date(user.deletionEffectiveDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      const daysRemaining = Math.max(1, Math.ceil((effectiveDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      const formattedDate = effectiveDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })

      return res.status(403).json({
        success: false,
        isScheduledForDeletion: true,
        deletionEffectiveDate: effectiveDate,
        daysRemaining,
        message: `Your account is scheduled for permanent deletion on ${formattedDate} (${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining). Account access is disabled. Please contact support if you need assistance.`,
      })
    }

    // Auto-heal missing trial dates for users
    if (!user.trialExpiresAt) {
      const trialDays = (user.accountType === "Learner" || user.accountType === "Client") ? 7 : 14
      user.trialStartedAt = user.createdAt || new Date()
      user.trialExpiresAt = new Date(new Date(user.trialStartedAt).getTime() + trialDays * 24 * 60 * 60 * 1000)
      if (!user.activePlan || user.activePlan === "none") user.activePlan = "trial"
      await user.save()
    }

    // Generate JWT token and Compare Password
    if (await bcrypt.compare(password, user.password)) {
      // Check if learner account has learnerId; auto-assign if missing
      const isLearner = user.accountType === "Learner" || user.accountType === "Client" || user.accountType === "Student"
      if (isLearner && !user.learnerId) {
        try {
          const { generateUniqueLearnerId } = require("../utils/learnerIdGenerator")
          user.learnerId = await generateUniqueLearnerId(User)
          await User.findByIdAndUpdate(user._id, { learnerId: user.learnerId })
        } catch (idErr) {
          console.error("Error auto-assigning learnerId on login:", idErr.message)
        }
      }

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
    let { provider = "google", email, firstName, lastName, image, accountType = "Client", code, redirectUri } = req.body

    // If OAuth authorization code is provided (e.g. for LinkedIn), exchange it for access token & user info
    if (code && (provider === "linkedin" || !email)) {
      try {
        const callbackUrl = redirectUri || `${req.headers.origin || process.env.FRONTEND_URL || "http://localhost:3000"}/social-callback`

        const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            client_id: process.env.LINKEDIN_CLIENT_ID,
            client_secret: process.env.LINKEDIN_CLIENT_SECRET,
            redirect_uri: callbackUrl,
          }).toString(),
        })
        const tokenJson = await tokenRes.json()
        const accessToken = tokenJson?.access_token
        if (!accessToken) {
          console.error("LinkedIn token exchange failure response:", tokenJson)
        }
        if (accessToken) {
          const userinfoRes = await fetch("https://api.linkedin.com/v2/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
          const linkedinProfile = await userinfoRes.json()
          if (linkedinProfile?.email) {
            email = linkedinProfile.email
            firstName = linkedinProfile.given_name || linkedinProfile.name?.split(" ")[0] || "User"
            lastName = linkedinProfile.family_name || linkedinProfile.name?.split(" ").slice(1).join(" ") || ""
            image = linkedinProfile.picture || ""
            provider = "linkedin"
          } else {
            console.error("LinkedIn userinfo response missing email:", linkedinProfile)
          }
        }
      } catch (oauthErr) {
        console.error("LinkedIn OAuth exchange error:", oauthErr?.response?.data || oauthErr.message)
      }
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required for social authentication",
      })
    }

    const emailLower = String(email).toLowerCase().trim()
    let user = await User.findOne({ email: emailLower }).populate("additionalDetails")

    const isNewRegistration = !user

    if (!user) {
      // Create new account for social registration
      const Profile = require("../models/Profile")
      const PractitionerProfile = require("../models/PractitionerProfile")

      const fName = String(firstName || emailLower.split("@")[0] || "User").trim()
      const lName = String(lastName || "").trim()
      const dummyPassword = await bcrypt.hash(`social_${provider}_${Date.now()}`, 10)

      const profileDetails = await Profile.create({
        gender: null,
        dateOfBirth: null,
        about: `Registered via ${provider === "google" ? "Google" : "LinkedIn"} Sign-In`,
        contactNumber: null,
      })

      let userAccountType = "Client"
      if (accountType === "Practitioner" || accountType === "Instructor") {
        userAccountType = "Practitioner"
      } else {
        userAccountType = "Client"
      }

      const now = new Date()
      const isLearner = userAccountType === "Client"
      const trialDays = isLearner ? 7 : 14
      const trialExpiresAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000)

      let learnerId = undefined
      if (isLearner) {
        const { generateUniqueLearnerId } = require("../utils/learnerIdGenerator")
        learnerId = await generateUniqueLearnerId(User)
      }

      // Only include learnerId when it has a real value — sparse unique index
      // only skips ABSENT fields, not explicit null.
      const socialCreatePayload = {
        firstName: fName,
        lastName: lName,
        email: emailLower,
        password: dummyPassword,
        accountType: userAccountType,
        contactNumber: "",
        additionalDetails: profileDetails._id,
        image: image || `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(fName + " " + lName)}`,
        approved: true,
        active: true,
        trialStartedAt: now,
        trialExpiresAt: trialExpiresAt,
        activePlan: "trial",
      }
      if (learnerId) socialCreatePayload.learnerId = learnerId

      user = await User.create(socialCreatePayload)

      if (userAccountType === "Practitioner") {
        const pProf = await PractitionerProfile.create({
          user: user._id,
          bio: "Verified practitioner registered via social login",
        })
        user.practitionerProfile = pProf._id
        await user.save()
      }

      user = await User.findById(user._id).populate("additionalDetails")
    } else {
      // Role-based login validation (Learner vs Practitioner panels)
      const requestedRole = accountType || req.body.expectedAccountType || req.body.role
      const mode = req.body.mode

      // If existing user registered as Learner but explicitly registers via Practitioner sign-up, upgrade their account
      if (mode === "signup" && (requestedRole === "Practitioner" || requestedRole === "Instructor") && (user.accountType === "Client" || user.accountType === "Learner" || user.accountType === "Student")) {
        const PractitionerProfile = require("../models/PractitionerProfile")
        user.accountType = "Practitioner"
        // Use $unset to REMOVE learnerId from the document entirely so the sparse
        // unique index doesn't see a null value and throw E11000.
        await User.findByIdAndUpdate(user._id, { $unset: { learnerId: "" } })
        user.learnerId = undefined
        if (!user.practitionerProfile) {
          const pProf = await PractitionerProfile.create({
            user: user._id,
            bio: "Verified practitioner registered via social login",
          })
          user.practitionerProfile = pProf._id
        }
        await user.save()
      } else if (requestedRole && user.accountType !== "Admin") {
        const isUserPractitioner = user.accountType === "Practitioner" || user.accountType === "Instructor"
        const isUserLearner = user.accountType === "Learner" || user.accountType === "Student" || user.accountType === "Client"

        if ((requestedRole === "Learner" || requestedRole === "Student" || requestedRole === "Client") && isUserPractitioner) {
          return res.status(400).json({
            success: false,
            message: "This email is registered as a Practitioner account. Please log in using the Practitioner Login.",
          })
        }

        if ((requestedRole === "Practitioner" || requestedRole === "Instructor") && isUserLearner) {
          return res.status(400).json({
            success: false,
            message: "This email is registered as a Learner account. Please log in using the Learner Login, or register as a Practitioner on the Sign Up page.",
          })
        }
      }

      // Check if account is scheduled for deletion or has reached permanent deletion date
      if (user.isDeleted) {
        const now = new Date()
        if (user.deletionEffectiveDate && new Date(user.deletionEffectiveDate) <= now) {
          try {
            const { hardDeleteUser } = require("./admin")
            await hardDeleteUser(user._id)
          } catch (e) {
            console.error("Auto hard-delete on socialLogin error:", e.message)
          }
          return res.status(403).json({
            success: false,
            message: "This account has been permanently deleted from our database.",
          })
        }

        const effectiveDate = user.deletionEffectiveDate ? new Date(user.deletionEffectiveDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        const daysRemaining = Math.max(1, Math.ceil((effectiveDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        const formattedDate = effectiveDate.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })

        return res.status(403).json({
          success: false,
          isScheduledForDeletion: true,
          deletionEffectiveDate: effectiveDate,
          daysRemaining,
          message: `Your account is scheduled for permanent deletion on ${formattedDate} (${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining). Account access is disabled. Please contact support if you need assistance.`,
        })
      }

      // User exists - update profile picture if missing or dicebear placeholder
      if (image && (!user.image || user.image.includes("dicebear"))) {
        user.image = image
        await user.save()
      }

      // Auto-assign learnerId if missing
      const isLearner = user.accountType === "Learner" || user.accountType === "Client" || user.accountType === "Student"
      if (isLearner && !user.learnerId) {
        try {
          const { generateUniqueLearnerId } = require("../utils/learnerIdGenerator")
          user.learnerId = await generateUniqueLearnerId(User)
          await user.save()
        } catch (idErr) {
          console.error("Error assigning learnerId in socialLogin:", idErr.message)
        }
      }

      if (!user.trialExpiresAt) {
        const trialDays = (user.accountType === "Learner" || user.accountType === "Client" || user.accountType === "Student") ? 7 : 14
        user.trialStartedAt = user.createdAt || new Date()
        user.trialExpiresAt = new Date(new Date(user.trialStartedAt).getTime() + trialDays * 24 * 60 * 60 * 1000)
        if (!user.activePlan || user.activePlan === "none") user.activePlan = "trial"
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
      isNewRegistration,
      message: isNewRegistration
        ? "Registration successful! Welcome to OpenHand."
        : `Successfully authenticated via ${provider === "google" ? "Google" : "LinkedIn"}!`,
    })
  } catch (error) {
    console.error("socialLogin error:", error)
    const userFriendlyMessage = error?.name === "ValidationError"
      ? "Registration details incomplete. Please verify your account information and try again."
      : "Social authentication failed. Please try signing in again."
    return res.status(500).json({
      success: false,
      message: userFriendlyMessage,
    })
  }
}
// Send OTP For Email Verification
exports.sendotp = async (req, res) => {
  try {
    const { email } = req.body

    const cleanEmail = String(email || "").trim().toLowerCase()

    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address format (e.g., name@domain.com)",
      })
    }

    // Check if user is already present with provided email (case-insensitive)
    const checkUserPresent = await User.findOne({
      email: { $regex: new RegExp("^" + cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i") },
    })

    // If user found with provided email
    if (checkUserPresent) {
      // Return 400 Bad Request status code with descriptive message
      return res.status(400).json({
        success: false,
        message: "This email is already registered. Each account requires a unique email address. Please sign in or use another email to register.",
      })
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    })
    let result = await OTP.findOne({ otp: otp })
    console.log("Result is Generate OTP Func")
    console.log("OTP", otp)
    console.log("Result", result)
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      })
      result = await OTP.findOne({ otp: otp })
    }
    const otpPayload = { email: cleanEmail, otp }
    const otpBody = await OTP.create(otpPayload)
    console.log("OTP Body", otpBody)
    return res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
      otp,
    })
  } catch (error) {
    console.error("sendotp error:", error.message)
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send OTP",
      error: error.message,
    })
  }
}

// Controller for Changing Password
exports.changePassword = async (req, res) => {
  try {
    // Get user data from req.user
    const userDetails = await User.findById(req.user.id)

    // Get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword } = req.body

    // Check if new password is identical to current password
    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as your current password.",
      })
    }

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    )
    if (!isPasswordMatch) {
      // If old password does not match, return a 401 error with a clear message
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect" })
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
