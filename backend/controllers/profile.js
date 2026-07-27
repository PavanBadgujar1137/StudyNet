const Profile = require("../models/Profile")
const User = require("../models/User")
const { uploadImageToCloudinary } = require("../utils/imageUploader")
const mongoose = require("mongoose")
const { convertSecondsToDuration } = require("../utils/secToDuration")
// Method for updating a profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName = "",
      lastName = "",
      dateOfBirth = "",
      about = "",
      contactNumber = "",
      gender = "",
    } = req.body
    const id = req.user.id

    // Find the profile by id
    const userDetails = await User.findById(id)
    const profile = await Profile.findById(userDetails.additionalDetails)

    const user = await User.findByIdAndUpdate(id, {
      firstName,
      lastName,
    })
    await user.save()

    // Update the profile fields
    profile.dateOfBirth = dateOfBirth
    profile.about = about
    profile.contactNumber = contactNumber
    profile.gender = gender

    // Save the updated profile
    await profile.save()

    // Find the updated user details
    const updatedUserDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec()

    return res.json({
      success: true,
      message: "Profile updated successfully",
      updatedUserDetails,
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

exports.deleteAccount = async (req, res) => {
  try {
    const id = req.user.id
    const user = await User.findById({ _id: id })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }
    // Delete Assosiated Profile with the User
    await Profile.findByIdAndDelete({
      _id: new mongoose.Types.ObjectId(user.additionalDetails),
    })
    for (const courseId of user.courses) {
      await Course.findByIdAndUpdate(
        courseId,
        { $pull: { studentsEnroled: id } },
        { new: true }
      )
    }
    // Now Delete User
    await User.findByIdAndDelete({ _id: id })
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
    await CourseProgress.deleteMany({ userId: id })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ success: false, message: "User Cannot be deleted successfully" })
  }
}

exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec()
    res.status(200).json({
      success: true,
      message: "User Data fetched successfully",
      data: userDetails,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.updateDisplayPicture = async (req, res) => {
  try {
    if (!req.files || !req.files.displayPicture) {
      return res.status(400).json({
        success: false,
        message: "No display picture uploaded",
      })
    }

    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      90
    )
    const updatedProfile = await User.findByIdAndUpdate(
      userId,
      { image: image.secure_url },
      { new: true }
    )
    return res.status(200).json({
      success: true,
      message: "Image Updated successfully",
      data: updatedProfile,
    })
  } catch (error) {
    console.log("UPDATE DISPLAY PICTURE ERROR:", error)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.getEnrolledCourses = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: [],
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.instructorDashboard = async (req, res) => {
  try {
    res.status(200).json({ courses: [] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Real-time Dynamic Dashboard Aggregators
// ─────────────────────────────────────────────────────────────────────────────
const CheckIn = require("../models/CheckIn")
const ReflectionPrompt = require("../models/ReflectionPrompt")
const LiveClass = require("../models/LiveClass")
const CircleMembership = require("../models/CircleMembership")
const CircleCohort = require("../models/CircleCohort")
const PractitionerProfile = require("../models/PractitionerProfile")
const Payout = require("../models/Payout")
const Invoice = require("../models/Invoice")
const Offer = require("../models/Offer")
const SessionNoteDraft = require("../models/SessionNoteDraft")

exports.getClientDashboardData = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId).populate("additionalDetails")
    if (!user) return res.status(404).json({ success: false, message: "User not found" })

    const createdAt = user.createdAt || new Date()
    const daysActive = Math.max(1, Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)))

    // Check-ins
    const checkIns = await CheckIn.find({ client: userId }).sort({ createdAt: -1 })
    const checkInCount = checkIns.length
    
    // Calculate streak
    let streak = 0
    if (checkIns.length > 0) {
      const uniqueDates = new Set(checkIns.map((c) => new Date(c.createdAt).toDateString()))
      streak = uniqueDates.size
    }

    // Reflections
    const reflections = await ReflectionPrompt.find({ client: userId }).sort({ createdAt: -1 })

    // Upcoming Zoom Live Classes
    const upcomingClasses = await LiveClass.find({
      status: { $in: ["scheduled", "live"] },
    })
      .populate("instructor", "firstName lastName image")
      .sort({ scheduledStart: 1 })
      .limit(10)

    // Circles
    const memberships = await CircleMembership.find({ user: userId }).populate("cohort")

    // Practitioner info placeholder/linked
    const defaultPractitioner = await User.findOne({ accountType: { $in: ["Practitioner", "Instructor"] } }).select("firstName lastName email image")

    // Dynamic milestones computed from real user activity
    const milestones = [
      { id: "joined", label: "Joined platform", date: new Date(createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }), achieved: true },
      { id: "first_checkin", label: "First check-in", date: checkIns.length ? new Date(checkIns[checkIns.length - 1].createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Not yet", achieved: checkIns.length > 0 },
      { id: "checkin_count", label: `${checkInCount} check-in(s) logged`, date: checkIns.length ? new Date(checkIns[0].createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "In progress", achieved: checkInCount >= 1 },
      { id: "circle_joined", label: "Joined a circle", date: memberships.length ? "Active" : "Not yet", achieved: memberships.length > 0 },
    ]

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          image: user.image,
          daysActive,
        },
        practitioner: defaultPractitioner ? {
          name: `Dr. ${defaultPractitioner.firstName} ${defaultPractitioner.lastName}`,
          firstName: defaultPractitioner.firstName,
          avatar: defaultPractitioner.image,
        } : {
          name: "Practitioner Portal",
          firstName: "Practitioner",
          avatar: "",
        },
        checkInCount,
        streak,
        checkIns,
        reflections,
        upcomingClasses,
        memberships,
        milestones,
      },
    })
  } catch (error) {
    console.error("getClientDashboardData error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

exports.getPractitionerDashboardData = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId).populate("additionalDetails")

    // Upcoming Zoom classes created by this instructor
    const upcomingClasses = await LiveClass.find({ instructor: userId })
      .sort({ scheduledStart: 1 })
      .lean()

    // Practitioner profile & offers
    const profile = await PractitionerProfile.findOne({ user: userId })
    const offers = await Offer.find({ practitioner: userId })
    const circles = await CircleCohort.find({ practitioner: userId })

    // Payouts & Invoices
    const payouts = await Payout.find({ practitioner: userId }).sort({ createdAt: -1 })
    const invoices = await Invoice.find({ practitioner: userId }).sort({ createdAt: -1 })

    // Compute earnings
    const totalEarnings = payouts.reduce((sum, p) => sum + (p.amount || 0), 0)
    const monthlyEarnings = payouts
      .filter((p) => new Date(p.createdAt).getMonth() === new Date().getMonth())
      .reduce((sum, p) => sum + (p.amount || 0), 0)

    const clearingThisWeek = payouts
      .filter((p) => p.status === "pending" || p.status === "processing")
      .reduce((sum, p) => sum + (p.amount || 0), 0)

    // Enrolled Clients / Students
    const allStudents = await User.find({ accountType: { $in: ["Student", "Client"] } })
      .select("firstName lastName email image createdAt")
      .sort({ createdAt: -1 })

    // AURA session notes awaiting approval
    const pendingNotes = await SessionNoteDraft.find({ practitioner: userId, status: "draft" })

    return res.status(200).json({
      success: true,
      data: {
        practitioner: {
          id: user?._id,
          name: user ? `${user.firstName} ${user.lastName}` : "Practitioner",
          firstName: user?.firstName || "Practitioner",
          lastName: user?.lastName || "",
          email: user?.email || "",
          image: user?.image || "",
          credentials: profile?.credentials || "Licensed Practitioner",
        },
        stats: {
          monthlyEarnings: monthlyEarnings,
          totalEarnings: totalEarnings,
          activeClientsCount: allStudents.length,
          clearingThisWeek: clearingThisWeek,
          circleSeatsFilled: circles.reduce((sum, c) => sum + (c.enrolledCount || 0), 0),
          totalCircleCapacity: circles.reduce((sum, c) => sum + (c.maxCapacity || 0), 0),
        },
        upcomingClasses,
        offers,
        circles,
        payouts,
        invoices,
        clients: allStudents,
        pendingNotes,
      },
    })
  } catch (error) {
    console.error("getPractitionerDashboardData error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

