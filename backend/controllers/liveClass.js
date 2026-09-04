const { v4: uuidv4 } = require("uuid")
const LiveClass = require("../models/LiveClass")
const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const { createZoomMeeting } = require("../utils/zoom")

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTOR: Schedule a live class (single or recurring) using Zoom
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
      recurrence,        // "none" | "daily" | "weekly"
      recurrenceEndDate, // ISO date string
    } = req.body

    if (!title || !scheduledStart || !scheduledEnd) {
      return res.status(400).json({
        success: false,
        message: "title, scheduledStart, and scheduledEnd are required.",
      })
    }

    // ITEM 18 FIX: Prevent backdated meeting creation
    if (new Date(scheduledStart) < new Date(Date.now() - 5 * 60 * 1000)) {
      return res.status(400).json({
        success: false,
        message: "Cannot schedule a backdated meeting. Please choose a future date and time.",
      })
    }

    const start = new Date(scheduledStart)

    const end = new Date(scheduledEnd)
    const durationMinutes = Math.max(15, Math.round((end.getTime() - start.getTime()) / 60000))

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

    // Create Zoom meeting for EACH class session
    const createdClasses = []

    for (const { start: s, end: e } of dates) {
      let zoomData = { zoomMeetingId: "", zoomJoinUrl: "", zoomStartUrl: "", zoomPassword: "" }
      try {
        zoomData = await createZoomMeeting({
          topic: `${title} - Live Session`,
          agenda: description || title,
          startTime: s,
          durationMinutes,
        })
      } catch (zoomErr) {
        console.warn("Zoom meeting creation warning:", zoomErr.message)
      }

      const liveClass = await LiveClass.create({
        course: courseId || undefined,
        title,
        description: description || "",
        tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
        instructor: instructorId,
        scheduledStart: s,
        scheduledEnd: e,
        chatEnabled: chatEnabled !== false,
        maxAttendees: maxAttendees ? Number(maxAttendees) : null,
        streamProvider: "zoom",
        zoomMeetingId: zoomData.zoomMeetingId,
        zoomJoinUrl: zoomData.zoomJoinUrl,
        zoomStartUrl: zoomData.zoomStartUrl,
        zoomPassword: zoomData.zoomPassword,
        recurrenceGroup,
        status: "scheduled",
      })

      createdClasses.push(liveClass)
    }

    return res.status(201).json({
      success: true,
      message: `${createdClasses.length} Zoom live class(es) scheduled successfully.`,
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
// STUDENT / INSTRUCTOR: Get upcoming live classes (enrolled courses)
// ─────────────────────────────────────────────────────────────────────────────
exports.getUpcomingClasses = async (req, res) => {
  try {
    const now = new Date()
    const rawClasses = await LiveClass.find({
      scheduledStart: { $gte: now },
      status: { $in: ["scheduled", "live"] },
    })
      .populate("instructor", "firstName lastName image")
      .sort({ scheduledStart: 1 })
      .limit(20)
      .lean()

    const classes = rawClasses.map((cls) => {
      let title = (cls.title || "").replace(/[*^%$#@!~`+={}\[\]\\|;"'<>,?]/g, " ").replace(/\s+/g, " ").trim()
      title = title.replace(/^[-:/&\s]+/, "").replace(/[-:/&\s]+$/, "")
      const alphaCount = (title.match(/[a-zA-Z0-9]/g) || []).length
      const hasVowelsOrDigits = /[aeiouyAEIOUY0-9]/.test(title)
      if (alphaCount < 2 || (!hasVowelsOrDigits && title.length >= 4)) {
        title = "Live Zoom Class"
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
// INSTRUCTOR: Start class — set status = live, return Zoom Start & Join details
// ─────────────────────────────────────────────────────────────────────────────
exports.startClass = async (req, res) => {
  try {
    const instructorId = req.user.id
    const { classId } = req.params

    const liveClass = await LiveClass.findById(classId).select("+zoomStartUrl")
    if (!liveClass) return res.status(404).json({ success: false, message: "Class not found." })
    if (String(liveClass.instructor) !== String(instructorId)) {
      return res.status(403).json({ success: false, message: "Not authorized." })
    }

    liveClass.status = "live"
    liveClass.actualStart = new Date()
    await liveClass.save()

    return res.status(200).json({
      success: true,
      message: "Zoom Class is now LIVE.",
      data: {
        classId: liveClass._id,
        title: liveClass.title,
        status: liveClass.status,
        streamProvider: "zoom",
        zoomMeetingId: liveClass.zoomMeetingId,
        zoomJoinUrl: liveClass.zoomJoinUrl,
        zoomStartUrl: liveClass.zoomStartUrl || liveClass.zoomJoinUrl,
        zoomPassword: liveClass.zoomPassword,
      },
    })
  } catch (error) {
    console.error("startClass error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTOR: End class — set status = ended
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

    return res.status(200).json({ success: true, message: "Class ended.", data: { classId } })
  } catch (error) {
    console.error("endClass error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT: Join class — verify enrollment & return Zoom meeting join details
// ─────────────────────────────────────────────────────────────────────────────
exports.joinClass = async (req, res) => {
  try {
    const userId = req.user.id
    const { classId } = req.params

    const liveClass = await LiveClass.findById(classId).select("+zoomStartUrl")

    if (!liveClass) return res.status(404).json({ success: false, message: "Class not found." })

    const isInstructor = String(liveClass.instructor) === String(userId)

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

    return res.status(200).json({
      success: true,
      data: {
        classId: liveClass._id,
        title: liveClass.title,
        description: liveClass.description,
        status: liveClass.status,
        scheduledStart: liveClass.scheduledStart,
        scheduledEnd: liveClass.scheduledEnd,
        streamProvider: "zoom",
        zoomMeetingId: liveClass.zoomMeetingId,
        zoomJoinUrl: liveClass.zoomJoinUrl,
        zoomStartUrl: liveClass.zoomStartUrl || liveClass.zoomJoinUrl,
        zoomPassword: liveClass.zoomPassword,
        chatEnabled: liveClass.chatEnabled,
      },
    })
  } catch (error) {
    console.error("joinClass error:", error)
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
    const { scheduledStart, scheduledEnd, title, description } = req.body

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
// INSTRUCTOR: Get a single class detail (with attendance)
// ─────────────────────────────────────────────────────────────────────────────
exports.getClassById = async (req, res) => {
  try {
    const { classId } = req.params
    const liveClass = await LiveClass.findById(classId)
      .populate("instructor", "firstName lastName image")
      .populate("attendees.user", "firstName lastName email image")
      .select("+zoomStartUrl")
      .lean()

    if (!liveClass) return res.status(404).json({ success: false, message: "Class not found." })

    return res.status(200).json({ success: true, data: liveClass })
  } catch (error) {
    console.error("getClassById error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}
