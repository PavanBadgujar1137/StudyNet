/**
 * 100ms.live (HMS) helper — creates rooms and mints auth tokens.
 * Docs: https://www.100ms.live/docs/server-side/v2/api-reference/overview
 *
 * Required env vars:
 *   HMS_APP_ACCESS_KEY   (from HMS Developer Dashboard → App → Access Key)
 *   HMS_APP_SECRET       (from HMS Developer Dashboard → App → App Secret)
 */

const jwt = require("jsonwebtoken")
const { v4: uuidv4 } = require("uuid")

// ─── HMS REST helpers ─────────────────────────────────────────────────────────

/**
 * Generate a HMS Management Token (used to call HMS REST API server-side).
 * Short-lived: 24 hours.
 */
const getHMSManagementToken = () => {
  const accessKey = process.env.HMS_APP_ACCESS_KEY
  const secret = process.env.HMS_APP_SECRET

  if (!accessKey || !secret) {
    throw new Error("HMS_APP_ACCESS_KEY and HMS_APP_SECRET must be set in backend/.env")
  }

  const payload = {
    access_key: accessKey,
    type: "management",
    version: 2,
    iat: Math.floor(Date.now() / 1000),
    nbf: Math.floor(Date.now() / 1000),
  }

  return jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn: "24h",
    jwtid: uuidv4(),
  })
}

/**
 * Create a HMS room via HMS Management API.
 * Returns the room object including `id` (roomId).
 */
const createHMSRoom = async (name, description = "") => {
  const token = getHMSManagementToken()

  const response = await fetch("https://api.100ms.live/v2/rooms", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase().substring(0, 100),
      description,
      template_id: process.env.HMS_TEMPLATE_ID || undefined,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`HMS createRoom failed: ${err}`)
  }

  return response.json()
}

/**
 * Enable / disable a HMS room (students can't join a disabled room).
 * Pass enabled=true when instructor starts the class, false to lock it.
 */
const setHMSRoomEnabled = async (roomId, enabled) => {
  const token = getHMSManagementToken()

  const response = await fetch(`https://api.100ms.live/v2/rooms/${roomId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ enabled }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`HMS setRoomEnabled failed: ${err}`)
  }

  return response.json()
}

/**
 * Generate a HMS App Token (client-side auth token for joining a room).
 *
 * @param {string} roomId  - HMS room ID
 * @param {string} userId  - StudyNet user ID (used as HMS userId)
 * @param {string} role    - "instructor" | "student" (must match HMS template roles)
 * @param {string} name    - Display name shown in class
 * @returns {string} JWT token valid for 1 hour
 */
const getHMSAppToken = (roomId, userId, role, name) => {
  const accessKey = process.env.HMS_APP_ACCESS_KEY
  const secret = process.env.HMS_APP_SECRET

  if (!accessKey || !secret) {
    throw new Error("HMS_APP_ACCESS_KEY and HMS_APP_SECRET must be set in backend/.env")
  }

  const payload = {
    access_key: accessKey,
    room_id: roomId,
    user_id: String(userId),
    role,
    type: "app",
    version: 2,
    iat: Math.floor(Date.now() / 1000),
    nbf: Math.floor(Date.now() / 1000),
  }

  return jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn: "1h",
    jwtid: uuidv4(),
  })
}

/**
 * End an active HMS session (kicks all peers, stops recording if any).
 */
const endHMSSession = async (roomId) => {
  const token = getHMSManagementToken()

  const response = await fetch(`https://api.100ms.live/v2/sessions/active?room_id=${roomId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) return // room might already be empty

  const sessions = await response.json()
  const sessionId = sessions?.data?.[0]?.id
  if (!sessionId) return

  await fetch(`https://api.100ms.live/v2/sessions/${sessionId}/end-room`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason: "Class ended by instructor", lock: true }),
  })
}

module.exports = { createHMSRoom, setHMSRoomEnabled, getHMSAppToken, endHMSSession, getHMSManagementToken }
