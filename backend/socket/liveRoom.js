/**
 * Socket.io live class room handlers.
 * Namespace: /live
 * Room pattern: class:<classId>
 *
 * Events emitted by client → server:
 *   join-room  { classId, userId, userName, role }
 *   leave-room { classId, userId }
 *   chat-message { classId, userId, userName, message, timestamp }
 *   raise-hand { classId, userId, userName }
 *   lower-hand { classId, userId }
 *
 * Events emitted by server → client:
 *   room-joined  { classId, attendeeCount }
 *   chat-message { userId, userName, message, timestamp, role }
 *   attendee-update { attendeeCount, attendees: [{ userId, userName, role }] }
 *   hand-raised  { userId, userName }
 *   hand-lowered { userId }
 *   class-started { classId }
 *   class-ended   { classId }
 *   error { message }
 */

const LiveClass = require("../models/LiveClass")

// Per-class attendee tracking (in-memory, resets on server restart)
// Map<classId, Map<socketId, { userId, userName, role }>>
const rooms = new Map()

const initLiveRoomSocket = (io) => {
  const liveNs = io.of("/live")

  liveNs.on("connection", (socket) => {
    console.log("[LiveRoom] Socket connected:", socket.id)

    // ── Join Room ─────────────────────────────────────────────────────────────
    socket.on("join-room", async ({ classId, userId, userName, role }) => {
      if (!classId || !userId) return

      socket.join(`class:${classId}`)

      // Track in memory
      if (!rooms.has(classId)) rooms.set(classId, new Map())
      rooms.get(classId).set(socket.id, { userId, userName, role: role || "student" })

      const attendees = [...rooms.get(classId).values()]

      socket.emit("room-joined", {
        classId,
        attendeeCount: attendees.length,
        attendees,
      })

      liveNs.to(`class:${classId}`).emit("attendee-update", {
        attendeeCount: attendees.length,
        attendees,
      })

      // Persist join timestamp to DB (best-effort, don't await)
      if (role === "student") {
        LiveClass.findOneAndUpdate(
          { _id: classId, "attendees.user": { $ne: userId } },
          { $push: { attendees: { user: userId, joinedAt: new Date() } } }
        ).catch(() => {})
      }

      console.log(`[LiveRoom] ${userName} joined class:${classId}`)
    })

    // ── Chat Message ──────────────────────────────────────────────────────────
    socket.on("chat-message", ({ classId, userId, userName, message, role }) => {
      if (!classId || !message?.trim()) return

      const payload = {
        userId,
        userName,
        message: message.trim().substring(0, 500), // cap length
        timestamp: new Date().toISOString(),
        role: role || "student",
      }

      liveNs.to(`class:${classId}`).emit("chat-message", payload)
    })

    // ── Raise/Lower Hand ──────────────────────────────────────────────────────
    socket.on("raise-hand", ({ classId, userId, userName }) => {
      liveNs.to(`class:${classId}`).emit("hand-raised", { userId, userName })
    })

    socket.on("lower-hand", ({ classId, userId }) => {
      liveNs.to(`class:${classId}`).emit("hand-lowered", { userId })
    })

    // ── Leave Room ────────────────────────────────────────────────────────────
    socket.on("leave-room", ({ classId, userId }) => {
      handleLeave(socket, liveNs, classId, userId)
    })

    // ── Disconnect ────────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      // Find which room this socket was in and clean up
      for (const [classId, sockets] of rooms.entries()) {
        if (sockets.has(socket.id)) {
          const peer = sockets.get(socket.id)
          handleLeave(socket, liveNs, classId, peer?.userId)
          break
        }
      }
      console.log("[LiveRoom] Socket disconnected:", socket.id)
    })
  })
}

function handleLeave(socket, liveNs, classId, userId) {
  if (!classId) return
  socket.leave(`class:${classId}`)

  if (rooms.has(classId)) {
    rooms.get(classId).delete(socket.id)

    const attendees = [...rooms.get(classId).values()]
    liveNs.to(`class:${classId}`).emit("attendee-update", {
      attendeeCount: attendees.length,
      attendees,
    })

    if (rooms.get(classId).size === 0) rooms.delete(classId)
  }

  // Update DB leave timestamp (best-effort)
  if (userId) {
    const now = new Date()
    LiveClass.findOneAndUpdate(
      { _id: classId, "attendees.user": userId, "attendees.leftAt": null },
      {
        $set: {
          "attendees.$.leftAt": now,
        },
      }
    )
      .then((doc) => {
        if (doc) {
          // Compute duration
          const record = doc.attendees.find(
            (a) => String(a.user) === String(userId) && !a.leftAt
          )
          if (record?.joinedAt) {
            const mins = Math.round((now - record.joinedAt) / 60000)
            LiveClass.updateOne(
              { _id: classId, "attendees.user": userId },
              { $set: { "attendees.$.durationMinutes": mins } }
            ).catch(() => {})
          }
        }
      })
      .catch(() => {})
  }
}

module.exports = { initLiveRoomSocket }
