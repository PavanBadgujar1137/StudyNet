const { v4: uuidv4 } = require("uuid")
const LiveClass = require("../models/LiveClass")
const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const {
  generateRoomName,
  generateLiveKitToken,
  closeLiveKitRoom,
  getLiveKitConfig,
} = require("../utils/livekit")

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTOR: Schedule a live class (single or recurring) using LiveKit
// ─────────────────────────────────────────────────────────────────────────────
exports.scheduleLiveClass = async (req, res) => {
  try {
    const instructorId = req.user.id
    const {
      courseId,
      title,
      description,
      tags,
      scheduledStart,
      scheduledEnd,
      chatEnabled,
      maxAttendees,
      sessionType,       // "1-on-1" | "group" (default "1-on-1")
      clientId,          // optional specific client ID for 1-on-1 session
      recurrence,        // "none" | "daily" | "weekly"
      recurrenceEndDate, // ISO date string
    } = req.body

    if (!title || !scheduledStart || !scheduledEnd) {
      return res.status(400).json({
        success: false,
        message: "title, scheduledStart, and scheduledEnd are required.",
      })
    }

    // Prevent backdated meeting creation
    if (new Date(scheduledStart) < new Date(Date.now() - 5 * 60 * 1000)) {
      return res.status(400).json({
        success: false,
        message: "Cannot schedule a backdated meeting. Please choose a future date and time.",
      })
    }

    const start = new Date(scheduledStart)
    const end = new Date(scheduledEnd)

    // Build all class dates (single or recurring series)
    const dates = [{ start, end }]

    if (recurrence && recurrence !== "none" && recurrenceEndDate) {
      const recEnd = new Date(recurrenceEndDate)
      const intervalMs =
        recurrence === "daily" ? 86400000 : recurrence === "weekly" ? 604800000 : null

      if (intervalMs) {
        let cur = new Date(start.getTime() + intervalMs)
        let curEnd = new Date(end.getTime() + intervalMs)
        while (cur <= recEnd) {
          dates.push({ start: new Date(cur), end: new Date(curEnd) })
          cur = new Date(cur.getTime() + intervalMs)
          curEnd = new Date(curEnd.getTime() + intervalMs)
        }
      }
    }

    const recurrenceGroup = dates.length > 1 ? uuidv4() : null
    const { serverUrl } = getLiveKitConfig()

    // Determine final session type and capacity
    const finalSessionType = sessionType === "group" ? "group" : "1-on-1"
    const finalMaxAttendees = maxAttendees
      ? Number(maxAttendees)
      : finalSessionType === "1-on-1"
      ? 1
      : null

    // Create LiveKit-enabled session for EACH class date
    const createdClasses = []

    for (const { start: s, end: e } of dates) {
      const sessionUniqueId = uuidv4().slice(0, 8)
      const livekitRoomName = generateRoomName(sessionUniqueId, title)

      const liveClass = await LiveClass.create({
        course: courseId || undefined,
        title,
        description: description || "",
        tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
        instructor: instructorId,
        sessionType: finalSessionType,
        client: clientId || undefined,
        scheduledStart: s,
        scheduledEnd: e,
        chatEnabled: chatEnabled !== false,
        maxAttendees: finalMaxAttendees,
        streamProvider: "livekit",
        livekitRoomName,
        livekitServerUrl: serverUrl,
        recurrenceGroup,
        status: "scheduled",
      })

      createdClasses.push(liveClass)
    }

    return res.status(201).json({
      success: true,
      message: `${createdClasses.length} live ${finalSessionType} session(s) scheduled successfully.`,
      data: createdClasses,
    })
  } catch (error) {
    console.error("scheduleLiveClass error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTOR: Get scheduling calendar (all classes for instructor's courses)
// ─────────────────────────────────────────────────────────────────────────────
exports.getInstructorSchedule = async (req, res) => {
  try {
    const instructorId = req.user.id
    const { from, to } = req.query // ISO date strings for calendar range

    const filter = { instructor: instructorId }
    if (from || to) {
      filter.scheduledStart = {}
      if (from) filter.scheduledStart.$gte = new Date(from)
      if (to) filter.scheduledStart.$lte = new Date(to)
    }

    const classes = await LiveClass.find(filter)
      .populate("client", "firstName lastName image email")
      .sort({ scheduledStart: 1 })
      .lean()

    // Stats for the at-a-glance panel
    const now = new Date()
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999)

    const upcomingToday = classes.filter(
      (c) => c.scheduledStart >= todayStart && c.scheduledStart <= todayEnd && c.status !== "cancelled"
    ).length

    const endedClasses = classes.filter((c) => c.status === "ended")
    const totalAttendees = endedClasses.reduce((sum, c) => sum + (c.attendees?.length || 0), 0)
    const avgAttendance = endedClasses.length > 0
      ? Math.round(totalAttendees / endedClasses.length)
      : 0

    return res.status(200).json({
      success: true,
      data: classes,
      stats: { upcomingToday, avgAttendance, totalScheduled: classes.length },
    })
  } catch (error) {
    console.error("getInstructorSchedule error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT / INSTRUCTOR: Get upcoming live classes (enrolled courses & 1-on-1)
// ─────────────────────────────────────────────────────────────────────────────
exports.getUpcomingClasses = async (req, res) => {
  try {
    const userId = req.user?.id
    const now = new Date()

    const filter = {
      scheduledStart: { $gte: now },
      status: { $in: ["scheduled", "live"] },
    }

    if (userId) {
      filter.$or = [
        { sessionType: "group" },
        { sessionType: { $exists: false } },
        { client: userId },
        { instructor: userId },
        { "attendees.user": userId },
      ]
    }

    const rawClasses = await LiveClass.find(filter)
      .populate("instructor", "firstName lastName image email")
      .populate("client", "firstName lastName image email")
      .sort({ scheduledStart: 1 })
      .limit(20)
      .lean()

    const classes = rawClasses.map((cls) => {
      let title = (cls.title || "").replace(/[*^%$#@!~`+={}\[\]\\|;"'<>,?]/g, " ").replace(/\s+/g, " ").trim()
      title = title.replace(/^[-:/&\s]+/, "").replace(/[-:/&\s]+$/, "")
      const alphaCount = (title.match(/[a-zA-Z0-9]/g) || []).length
      const hasVowelsOrDigits = /[aeiouyAEIOUY0-9]/.test(title)
      if (alphaCount < 2 || (!hasVowelsOrDigits && title.length >= 4)) {
        title = cls.sessionType === "1-on-1" ? "1-on-1 Live Session" : "Live Interactive Session"
      }
      return { ...cls, title }
    })

    return res.status(200).json({ success: true, data: classes })
  } catch (error) {
    console.error("getUpcomingClasses error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTOR: Start class — set status = live & generate Host LiveKit Token
// ─────────────────────────────────────────────────────────────────────────────
exports.startClass = async (req, res) => {
  try {
    const instructorId = req.user.id
    const { classId } = req.params

    const liveClass = await LiveClass.findById(classId)
    if (!liveClass) return res.status(404).json({ success: false, message: "Class not found." })
    if (String(liveClass.instructor) !== String(instructorId)) {
      return res.status(403).json({ success: false, message: "Not authorized to host this class." })
    }

    // Ensure LiveKit room name exists
    if (!liveClass.livekitRoomName) {
      liveClass.livekitRoomName = generateRoomName(liveClass._id, liveClass.title)
    }

    liveClass.status = "live"
    liveClass.actualStart = new Date()
    liveClass.streamProvider = "livekit"
    const { serverUrl } = getLiveKitConfig()
    liveClass.livekitServerUrl = serverUrl
    await liveClass.save()

    // Generate Host LiveKit Token with admin/host privileges
    const instructorUser = await User.findById(instructorId).lean()
    const participantName = instructorUser ? `${instructorUser.firstName} ${instructorUser.lastName}`.trim() : "Instructor Host"

    const tokenData = await generateLiveKitToken({
      roomName: liveClass.livekitRoomName,
      identity: String(instructorId),
      name: participantName,
      isHost: true,
      metadata: {
        role: "instructor",
        avatar: instructorUser?.image || "",
        classId: String(liveClass._id),
        sessionType: liveClass.sessionType || "1-on-1",
      },
    })

    return res.status(200).json({
      success: true,
      message: "LiveKit Session is now LIVE.",
      data: {
        classId: liveClass._id,
        title: liveClass.title,
        sessionType: liveClass.sessionType || "1-on-1",
        client: liveClass.client,
        status: liveClass.status,
        streamProvider: "livekit",
        livekitRoomName: liveClass.livekitRoomName,
        livekitServerUrl: tokenData.serverUrl,
        livekitToken: tokenData.token,
        chatEnabled: liveClass.chatEnabled,
        isInstructor: true,
      },
    })
  } catch (error) {
    console.error("startClass error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTOR: End class — set status = ended & close LiveKit room
// ─────────────────────────────────────────────────────────────────────────────
exports.endClass = async (req, res) => {
  try {
    const instructorId = req.user.id
    const { classId } = req.params

    const liveClass = await LiveClass.findById(classId)
    if (!liveClass) return res.status(404).json({ success: false, message: "Class not found." })
    if (String(liveClass.instructor) !== String(instructorId)) {
      return res.status(403).json({ success: false, message: "Not authorized." })
    }

    liveClass.status = "ended"
    liveClass.actualEnd = new Date()
    await liveClass.save()

    // Clean up room on LiveKit server
    if (liveClass.livekitRoomName) {
      await closeLiveKitRoom(liveClass.livekitRoomName)
    }

    return res.status(200).json({
      success: true,
      message: "Live session ended successfully.",
      data: { classId },
    })
  } catch (error) {
    console.error("endClass error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT / PARTICIPANT: Join class — verify window/capacity & generate Token
// ─────────────────────────────────────────────────────────────────────────────
exports.joinClass = async (req, res) => {
  try {
    const userId = req.user.id
    const { classId } = req.params

    const liveClass = await LiveClass.findById(classId)

    if (!liveClass) return res.status(404).json({ success: false, message: "Class not found." })

    const isInstructor = String(liveClass.instructor) === String(userId)

    // Verify 1-on-1 session privacy (only designated client or host instructor can join)
    if (liveClass.sessionType === "1-on-1" && liveClass.client) {
      const isDesignatedClient = String(liveClass.client) === String(userId)
      if (!isInstructor && !isDesignatedClient) {
        return res.status(403).json({
          success: false,
          message: "This is a private 1-on-1 live session.",
        })
      }
    }

    // Check join window for non-instructors (15 min before start or already live)
    const now = new Date()
    const joinWindowStart = new Date(liveClass.scheduledStart.getTime() - 15 * 60 * 1000)
    if (!isInstructor && now < joinWindowStart && liveClass.status === "scheduled") {
      const minsLeft = Math.ceil((joinWindowStart - now) / 60000)
      return res.status(400).json({
        success: false,
        message: `Class join opens in ${minsLeft} minutes.`,
        minutesUntilJoin: minsLeft,
      })
    }

    if (liveClass.status === "ended" && !isInstructor) {
      return res.status(400).json({ success: false, message: "This class has already ended." })
    }
    if (liveClass.status === "cancelled") {
      return res.status(400).json({ success: false, message: "This class was cancelled." })
    }

    // Check capacity
    if (!isInstructor && liveClass.maxAttendees) {
      const activeAttendees = liveClass.attendees.filter((a) => !a.leftAt).length
      if (activeAttendees >= liveClass.maxAttendees) {
        return res.status(400).json({ success: false, message: "Class is full." })
      }
    }

    // Log join in attendees (if not already joined)
    const alreadyJoined = liveClass.attendees.some((a) => String(a.user) === String(userId))
    if (!alreadyJoined && !isInstructor) {
      liveClass.attendees.push({ user: userId, joinedAt: now })
      await liveClass.save()
    }

    // Ensure room name exists
    if (!liveClass.livekitRoomName) {
      liveClass.livekitRoomName = generateRoomName(liveClass._id, liveClass.title)
      await liveClass.save()
    }

    // Fetch user details for display name in LiveKit
    const attendeeUser = await User.findById(userId).lean()
    const participantName = attendeeUser ? `${attendeeUser.firstName} ${attendeeUser.lastName}`.trim() : `Attendee-${userId.slice(-4)}`

    // Generate participant LiveKit token
    const tokenData = await generateLiveKitToken({
      roomName: liveClass.livekitRoomName,
      identity: String(userId),
      name: participantName,
      isHost: isInstructor,
      metadata: {
        role: isInstructor ? "instructor" : "student",
        avatar: attendeeUser?.image || "",
        classId: String(liveClass._id),
        sessionType: liveClass.sessionType || "1-on-1",
      },
    })

    return res.status(200).json({
      success: true,
      data: {
        classId: liveClass._id,
        title: liveClass.title,
        description: liveClass.description,
        sessionType: liveClass.sessionType || "1-on-1",
        client: liveClass.client,
        status: liveClass.status,
        scheduledStart: liveClass.scheduledStart,
        scheduledEnd: liveClass.scheduledEnd,
        streamProvider: "livekit",
        livekitRoomName: liveClass.livekitRoomName,
        livekitServerUrl: tokenData.serverUrl,
        livekitToken: tokenData.token,
        chatEnabled: liveClass.chatEnabled,
        isInstructor,
      },
    })
  } catch (error) {
    console.error("joinClass error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// REFRESH / GET TOKEN: Re-fetch LiveKit token for an active class
// ─────────────────────────────────────────────────────────────────────────────
exports.getLiveClassToken = async (req, res) => {
  try {
    const userId = req.user.id
    const { classId } = req.params

    const liveClass = await LiveClass.findById(classId)
    if (!liveClass) return res.status(404).json({ success: false, message: "Class not found." })

    const isInstructor = String(liveClass.instructor) === String(userId)

    if (!liveClass.livekitRoomName) {
      liveClass.livekitRoomName = generateRoomName(liveClass._id, liveClass.title)
      await liveClass.save()
    }

    const userRecord = await User.findById(userId).lean()
    const participantName = userRecord ? `${userRecord.firstName} ${userRecord.lastName}`.trim() : `User-${userId.slice(-4)}`

    const tokenData = await generateLiveKitToken({
      roomName: liveClass.livekitRoomName,
      identity: String(userId),
      name: participantName,
      isHost: isInstructor,
      metadata: {
        role: isInstructor ? "instructor" : "student",
        avatar: userRecord?.image || "",
        classId: String(liveClass._id),
      },
    })

    return res.status(200).json({
      success: true,
      data: {
        livekitToken: tokenData.token,
        livekitServerUrl: tokenData.serverUrl,
        livekitRoomName: liveClass.livekitRoomName,
        streamProvider: "livekit",
      },
    })
  } catch (error) {
    console.error("getLiveClassToken error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT: Leave class — update attendance duration
// ─────────────────────────────────────────────────────────────────────────────
exports.leaveClass = async (req, res) => {
  try {
    const userId = req.user.id
    const { classId } = req.params

    const liveClass = await LiveClass.findById(classId)
    if (!liveClass) return res.status(404).json({ success: false, message: "Class not found." })

    const attendeeRecord = liveClass.attendees.find(
      (a) => String(a.user) === String(userId) && !a.leftAt
    )

    if (attendeeRecord) {
      const leftAt = new Date()
      attendeeRecord.leftAt = leftAt
      attendeeRecord.durationMinutes = Math.round(
        (leftAt - attendeeRecord.joinedAt) / 60000
      )
      await liveClass.save()
    }

    return res.status(200).json({ success: true, message: "Left class." })
  } catch (error) {
    console.error("leaveClass error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTOR: Reschedule a class
// ─────────────────────────────────────────────────────────────────────────────
exports.rescheduleClass = async (req, res) => {
  try {
    const instructorId = req.user.id || req.user._id
    const { classId } = req.params
    const { scheduledStart, scheduledEnd, title, description, sessionType, clientId } = req.body

    const liveClass = await LiveClass.findById(classId)
    if (!liveClass) return res.status(404).json({ success: false, message: "Class not found." })

    const isOwner = String(liveClass.instructor) === String(instructorId) || req.user?.accountType === "Practitioner" || req.user?.accountType === "Instructor" || req.user?.accountType === "Admin"
    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Not authorized." })
    }
    if (liveClass.status === "live" || liveClass.status === "ended") {
      return res.status(400).json({ success: false, message: "Cannot reschedule a live or ended class." })
    }

    if (scheduledStart) liveClass.scheduledStart = new Date(scheduledStart)
    if (scheduledEnd) liveClass.scheduledEnd = new Date(scheduledEnd)
    if (title) liveClass.title = title.slice(0, 100)
    if (description !== undefined) liveClass.description = description.slice(0, 500)
    if (sessionType) liveClass.sessionType = sessionType
    if (clientId !== undefined) liveClass.client = clientId || null
    await liveClass.save()

    return res.status(200).json({ success: true, message: "Class rescheduled.", data: liveClass })
  } catch (error) {
    console.error("rescheduleClass error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTOR: Cancel a class
// ─────────────────────────────────────────────────────────────────────────────
exports.cancelClass = async (req, res) => {
  try {
    const instructorId = req.user.id || req.user._id
    const { classId } = req.params

    const liveClass = await LiveClass.findById(classId)
    if (!liveClass) return res.status(404).json({ success: false, message: "Class not found." })

    const isOwner = String(liveClass.instructor) === String(instructorId) || req.user?.accountType === "Practitioner" || req.user?.accountType === "Instructor" || req.user?.accountType === "Admin"
    if (!isOwner) {
      return res.status(403).json({ success: false, message: "Not authorized." })
    }

    liveClass.status = "cancelled"
    await liveClass.save()
    await LiveClass.findByIdAndDelete(classId)

    return res.status(200).json({ success: true, message: "Class cancelled." })
  } catch (error) {
    console.error("cancelClass error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTOR: Publish recording (link a recording URL post-class)
// ─────────────────────────────────────────────────────────────────────────────
exports.publishRecording = async (req, res) => {
  try {
    const instructorId = req.user.id
    const { classId } = req.params
    const { recordingUrl } = req.body

    const liveClass = await LiveClass.findById(classId)
    if (!liveClass) return res.status(404).json({ success: false, message: "Class not found." })
    if (String(liveClass.instructor) !== String(instructorId)) {
      return res.status(403).json({ success: false, message: "Not authorized." })
    }

    liveClass.recordingUrl = recordingUrl
    liveClass.isRecordingPublished = true
    await liveClass.save()

    return res.status(200).json({ success: true, message: "Recording published.", data: liveClass })
  } catch (error) {
    console.error("publishRecording error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTOR / LEARNER: Get a single class detail (with attendance & client)
// ─────────────────────────────────────────────────────────────────────────────
exports.getClassById = async (req, res) => {
  try {
    const { classId } = req.params
    const liveClass = await LiveClass.findById(classId)
      .populate("instructor", "firstName lastName image email")
      .populate("client", "firstName lastName image email")
      .populate("attendees.user", "firstName lastName email image")
      .lean()

    if (!liveClass) return res.status(404).json({ success: false, message: "Class not found." })

    return res.status(200).json({ success: true, data: liveClass })
  } catch (error) {
    console.error("getClassById error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}
