const { v4: uuidv4 } = require("uuid")
const LiveClass = require("../models/LiveClass")
const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const {
  createHMSRoom,
  setHMSRoomEnabled,
  getHMSAppToken,
  endHMSSession,
} = require("../utils/hms")

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTOR: Schedule a live class (single or recurring)
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

    if (!courseId || !title || !scheduledStart || !scheduledEnd) {
      return res.status(400).json({
        success: false,
        message: "courseId, title, scheduledStart, and scheduledEnd are required.",
      })
    }

    // Verify instructor owns the course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." })
    }
    if (String(course.instructor) !== String(instructorId)) {
      return res.status(403).json({ success: false, message: "Not authorized for this course." })
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

    // Create HMS room for EACH class
    const createdClasses = []

    for (const { start: s, end: e } of dates) {
      let hmsRoomId = null
      try {
        const hmsRoom = await createHMSRoom(
          `${title}-${s.toISOString().slice(0, 10)}`,
          description || title
        )
        hmsRoomId = hmsRoom.id
      } catch (hmsErr) {
        console.warn("HMS room creation failed (no keys?):", hmsErr.message)
      }

      const liveClass = await LiveClass.create({
        course: courseId,
        title,
        description: description || "",
        tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
        instructor: instructorId,
        scheduledStart: s,
        scheduledEnd: e,
        chatEnabled: chatEnabled !== false,
        maxAttendees: maxAttendees ? Number(maxAttendees) : null,
        hmsRoomId,
        recurrenceGroup,
        status: "scheduled",
      })

      createdClasses.push(liveClass)
    }

    // Push liveClass refs into the course
    await Course.findByIdAndUpdate(courseId, {
      $push: { liveClasses: { $each: createdClasses.map((c) => c._id) } },
    })

    return res.status(201).json({
      success: true,
      message: `${createdClasses.length} live class(es) scheduled.`,
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
      .populate("course", "courseName")
      .select("-hmsRoomId -hmsRoomCode")
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
    const userId = req.user.id
    const { accountType } = req.user

    let courseIds = []
    if (accountType === "Student") {
      const user = await User.findById(userId).select("courses")
      courseIds = user.courses || []
    } else {
      const courses = await Course.find({ instructor: userId }).select("_id")
      courseIds = courses.map((c) => c._id)
    }

    const now = new Date()
    const classes = await LiveClass.find({
      course: { $in: courseIds },
      scheduledStart: { $gte: now },
      status: { $in: ["scheduled", "live"] },
    })
      .populate("course", "courseName thumbnail")
      .populate("instructor", "firstName lastName image")
      .select("-hmsRoomId -hmsRoomCode")
      .sort({ scheduledStart: 1 })
      .limit(20)
      .lean()

    return res.status(200).json({ success: true, data: classes })
  } catch (error) {
    console.error("getUpcomingClasses error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTOR: Start class — enable HMS room, set status = live
// ─────────────────────────────────────────────────────────────────────────────
exports.startClass = async (req, res) => {
  try {
    const instructorId = req.user.id
    const { classId } = req.params

    const liveClass = await LiveClass.findById(classId).select("+hmsRoomId +hmsRoomCode")
    if (!liveClass) return res.status(404).json({ success: false, message: "Class not found." })
    if (String(liveClass.instructor) !== String(instructorId)) {
      return res.status(403).json({ success: false, message: "Not authorized." })
    }

    // Enable HMS room so students can join
    if (liveClass.hmsRoomId) {
      try {
        await setHMSRoomEnabled(liveClass.hmsRoomId, true)
      } catch (hmsErr) {
        console.warn("HMS enable failed:", hmsErr.message)
      }
    }

    liveClass.status = "live"
    liveClass.actualStart = new Date()
    liveClass.hmsRoomEnabled = true
    await liveClass.save()

    // Emit to all sockets watching this class
    const io = req.app.get("io")
    io.to(`class:${classId}`).emit("class-started", { classId })

    // Generate instructor's HMS token
    const instructor = await User.findById(instructorId).select("firstName lastName")
    let instructorToken = null
    if (liveClass.hmsRoomId) {
      try {
        instructorToken = getHMSAppToken(
          liveClass.hmsRoomId,
          instructorId,
          "instructor",
          `${instructor.firstName} ${instructor.lastName}`
        )
      } catch (e) {
        console.warn("HMS token error:", e.message)
      }
    }

    return res.status(200).json({
      success: true,
      message: "Class started.",
      data: {
        classId: liveClass._id,
        hmsRoomId: liveClass.hmsRoomId,
        hmsToken: instructorToken,
        status: liveClass.status,
      },
    })
  } catch (error) {
    console.error("startClass error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTRUCTOR: End class — disable room, set status = ended
// ─────────────────────────────────────────────────────────────────────────────
exports.endClass = async (req, res) => {
  try {
    const instructorId = req.user.id
    const { classId } = req.params

    const liveClass = await LiveClass.findById(classId).select("+hmsRoomId")
    if (!liveClass) return res.status(404).json({ success: false, message: "Class not found." })
    if (String(liveClass.instructor) !== String(instructorId)) {
      return res.status(403).json({ success: false, message: "Not authorized." })
    }

    if (liveClass.hmsRoomId) {
      try {
        await endHMSSession(liveClass.hmsRoomId)
        await setHMSRoomEnabled(liveClass.hmsRoomId, false)
      } catch (e) {
        console.warn("HMS end session error:", e.message)
      }
    }

    liveClass.status = "ended"
    liveClass.actualEnd = new Date()
    liveClass.hmsRoomEnabled = false
    await liveClass.save()

    const io = req.app.get("io")
    io.to(`class:${classId}`).emit("class-ended", { classId })

    return res.status(200).json({ success: true, message: "Class ended.", data: { classId } })
  } catch (error) {
    console.error("endClass error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT: Join class — verify enrollment, generate HMS token
// ─────────────────────────────────────────────────────────────────────────────
exports.joinClass = async (req, res) => {
  try {
    const userId = req.user.id
    const { classId } = req.params

    const liveClass = await LiveClass.findById(classId)
      .populate("course", "studentsEnroled")
      .select("+hmsRoomId")

    if (!liveClass) return res.status(404).json({ success: false, message: "Class not found." })

    // Check enrollment
    const isEnrolled = liveClass.course.studentsEnroled.map(String).includes(String(userId))
    if (!isEnrolled) {
      return res.status(403).json({ success: false, message: "You are not enrolled in this course." })
    }

    // Check join window (10 min before start or already live)
    const now = new Date()
    const joinWindowStart = new Date(liveClass.scheduledStart.getTime() - 10 * 60 * 1000)
    if (now < joinWindowStart && liveClass.status === "scheduled") {
      const minsLeft = Math.ceil((joinWindowStart - now) / 60000)
      return res.status(400).json({
        success: false,
        message: `Class join opens in ${minsLeft} minutes.`,
        minutesUntilJoin: minsLeft,
      })
    }

    if (liveClass.status === "ended") {
      return res.status(400).json({ success: false, message: "This class has already ended." })
    }
    if (liveClass.status === "cancelled") {
      return res.status(400).json({ success: false, message: "This class was cancelled." })
    }

    // Check capacity
    if (liveClass.maxAttendees) {
      const activeAttendees = liveClass.attendees.filter((a) => !a.leftAt).length
      if (activeAttendees >= liveClass.maxAttendees) {
        return res.status(400).json({ success: false, message: "Class is full." })
      }
    }

    // Log join in attendees (if not already joined)
    const alreadyJoined = liveClass.attendees.some((a) => String(a.user) === String(userId))
    if (!alreadyJoined) {
      liveClass.attendees.push({ user: userId, joinedAt: now })
      await liveClass.save()
    }

    // Generate HMS token for student
    const student = await User.findById(userId).select("firstName lastName")
    let hmsToken = null
    if (liveClass.hmsRoomId) {
      try {
        hmsToken = getHMSAppToken(
          liveClass.hmsRoomId,
          userId,
          "student",
          `${student.firstName} ${student.lastName}`
        )
      } catch (e) {
        console.warn("HMS token error:", e.message)
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        classId: liveClass._id,
        title: liveClass.title,
        status: liveClass.status,
        hmsRoomId: liveClass.hmsRoomId,
        hmsToken,
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
    const instructorId = req.user.id
    const { classId } = req.params
    const { scheduledStart, scheduledEnd } = req.body

    const liveClass = await LiveClass.findById(classId)
    if (!liveClass) return res.status(404).json({ success: false, message: "Class not found." })
    if (String(liveClass.instructor) !== String(instructorId)) {
      return res.status(403).json({ success: false, message: "Not authorized." })
    }
    if (liveClass.status === "live" || liveClass.status === "ended") {
      return res.status(400).json({ success: false, message: "Cannot reschedule a live or ended class." })
    }

    liveClass.scheduledStart = new Date(scheduledStart)
    liveClass.scheduledEnd = new Date(scheduledEnd)
    await liveClass.save()

    // Notify enrolled students by email (async, don't await)
    notifyStudentsReschedule(liveClass).catch(console.warn)

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
    const instructorId = req.user.id
    const { classId } = req.params

    const liveClass = await LiveClass.findById(classId).select("+hmsRoomId")
    if (!liveClass) return res.status(404).json({ success: false, message: "Class not found." })
    if (String(liveClass.instructor) !== String(instructorId)) {
      return res.status(403).json({ success: false, message: "Not authorized." })
    }

    liveClass.status = "cancelled"
    await liveClass.save()

    if (liveClass.hmsRoomId) {
      try { await setHMSRoomEnabled(liveClass.hmsRoomId, false) } catch (_) {}
    }

    notifyStudentsCancel(liveClass).catch(console.warn)

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
      .populate("course", "courseName")
      .populate("attendees.user", "firstName lastName email image")
      .select("-hmsRoomId")
      .lean()

    if (!liveClass) return res.status(404).json({ success: false, message: "Class not found." })

    return res.status(200).json({ success: true, data: liveClass })
  } catch (error) {
    console.error("getClassById error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────
async function notifyStudentsReschedule(liveClass) {
  const course = await Course.findById(liveClass.course).populate("studentsEnroled", "email firstName")
  if (!course) return
  for (const student of course.studentsEnroled) {
    await mailSender(
      student.email,
      `Class Rescheduled: ${liveClass.title}`,
      `<p>Hi ${student.firstName},</p>
       <p>The class <strong>${liveClass.title}</strong> has been rescheduled to 
       <strong>${new Date(liveClass.scheduledStart).toLocaleString("en-IN")}</strong>.</p>
       <p>See you then!</p>`
    ).catch(() => {})
  }
}

async function notifyStudentsCancel(liveClass) {
  const course = await Course.findById(liveClass.course).populate("studentsEnroled", "email firstName")
  if (!course) return
  for (const student of course.studentsEnroled) {
    await mailSender(
      student.email,
      `Class Cancelled: ${liveClass.title}`,
      `<p>Hi ${student.firstName},</p>
       <p>Unfortunately, the class <strong>${liveClass.title}</strong> scheduled for 
       <strong>${new Date(liveClass.scheduledStart).toLocaleString("en-IN")}</strong> has been cancelled.</p>
       <p>We apologize for the inconvenience.</p>`
    ).catch(() => {})
  }
}
